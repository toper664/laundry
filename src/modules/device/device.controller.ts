import type { Request, Response } from 'express';
import { MachineRepository } from '../machine/machine.queries.ts';
import { SessionRepository } from '../session/session.queries.ts';
import { SessionService } from '../session/session.services.ts';
import { NotifRepository } from '../notif/notif.queries.ts';
import { AppDataSource } from '../../config/database.ts';
import { tzNow, safeIsoformat } from '../../utils/tz.ts';

const commandQueues = new Map(); // machine_id -> array of commands
const machineStatus = new Map();  // machine_id -> last data

export const getStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send('Missing machine_id');
    }
    const machine_id = Number(id);
    const status = machineStatus.get(machine_id);

    if (!status) {
        return res.status(404).json({ 
            error: 'Machine not found or offline' 
        });
    }

    return res.status(200).json(status);
};

export const getAllStatus = (req: Request, res: Response): Response => {
  return res.json({
    machines: Object.fromEntries(machineStatus),
    active_machines: machineStatus.size
  });
};

export const getQueue = (req: Request, res: Response): Response => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send('Missing machine_id');
    }
    const machine_id = Number(id);
    const queue = commandQueues.get(machine_id) || [];
    
    return res.status(200).json({
        machine_id,
        queue_length: queue.length,
        commands: queue
    });
};

export const getCommands = (req: Request, res: Response): Response => {
    const { machine_id } = req.query;
    
    if (!machine_id) {
        return res.status(400).json({ error: 'machine_id required' });
    }

    const commands = commandQueues.get(machine_id) || [];
    commandQueues.set(machine_id, []);

    console.log(`[ESP32] ${machine_id} polled, sending ${commands.length} commands`);

    return res.status(200).json({
        machine_id,
        commands: commands,
        timestamp: safeIsoformat(tzNow()),
    });
}

export const ackCommand = (req: Request, res: Response): Response => {
    const { command_id, machine_id, success } = req.body;
    console.log(`[ACK] Command ${command_id} for Machine ${machine_id}: ${success ? 'SUCCESS' : 'FAILED'}`);

    return res.status(200).json({
        received: true,
        command_id,
        machine_id,
        success
    });
};

export const postData = (req: Request, res: Response): Response => { 
    const { machine_id, channel1, channel2 } = req.body;

    if (!machine_id) {
        return res.status(400).json({ error: 'machine_id required' });
    }

    const time = safeIsoformat(tzNow());

    machineStatus.set(machine_id, {
        machine_id,
        channel1,
        channel2,
        last_seen: time,
    });

    console.log(`[DATA] ${machine_id} | CH1: ${channel1?.current}A (${channel1?.relay_status}) | CH2: ${channel2?.current}A (${channel2?.relay_status})`);

    return res.status(200).json({
        received: true,
        machine_id,
        timestamp: time
    });
};

export const queueCommand = (req: Request, res: Response): Response => {
    const { machine_id, device_id, command } = req.body;

    if (!machine_id || !device_id || !command) {
        return res.status(400).json({ 
            error: 'machine_id, device_id, and command required' 
        });
    }

    if (!['START', 'STOP'].includes(command)) {
        return res.status(400).json({ 
            error: 'command must be START or STOP' 
        });
    }

    const commandId = Date.now();
    if (!commandQueues.has(machine_id)) {
        commandQueues.set(machine_id, []);
    }

    commandQueues.get(machine_id).push({
        command_id: commandId,
        machine_id: parseInt(machine_id),
        command: command,
        queued_at: safeIsoformat(tzNow()),
    });

    console.log(`[QUEUE] Added ${command} for Machine ${machine_id} to ${device_id}`);

    return res.status(200).json({
        success: true,
        command_id: commandId,
        machine_id,
        device_id,
        command,
        message: 'Command queued, waiting for ESP32 to poll'
    });
};

export const updateESP32 = async (req: Request, res: Response): Promise<Response> => {
  const { machine_id, current_amp = 0, timestamp: timestampStr, machine_status: explicitStatus } = req.body;
  const currentAmp = parseFloat(current_amp);

  const machineRepo = new MachineRepository(AppDataSource);
  const sessionRepo = new SessionRepository(AppDataSource);
  const notifRepo = new NotifRepository(AppDataSource);
  const ss = new SessionService();

  const machine = await machineRepo.findById(machine_id);
  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  let espTime: Date = new Date();
  if (timestampStr) {
    try {
      espTime = new Date(timestampStr);
    } catch { espTime = new Date(); }
  }

  const oldStatus = machine.status;
  const isRunning = currentAmp > machine.ampThreshold;
  const newStatus = explicitStatus ?? (isRunning ? 'running' : 'standby');
  const session = await sessionRepo.findRunningByMachine(machine_id);
  let statusChanged = false;

  if (newStatus === 'running') {
    if (machine.status !== 'running') {
      machine.status = 'running';
      statusChanged = true;
      await notifRepo.createNotif(machine_id, machine.name, 'running', `Machine ${machine.name} is now operational.`);
    }
    if (!session) {
      const newSession = sessionRepo.create({
        machineId: machine_id, status: 'running', actualStatus: 'ON',
        currentAmp, maxAmp: currentAmp, startTime: espTime,
      });
      await sessionRepo.save(newSession);
    } else {
      session.currentAmp = currentAmp;
      session.maxAmp = Math.max(session.maxAmp, currentAmp);
      ss.addAmpReading(session, currentAmp);
      await sessionRepo.save(session);
    }
  } else {
    if (oldStatus === 'running') {
      if (session) {
        session.status = 'completed';
        session.endTime = new Date();
        session.actualStatus = 'OFF';
        await sessionRepo.save(session);
        await notifRepo.createNotif(machine_id, machine.name, 'completed', `Laundry session on machine ${machine.name} has completed.`);
      }
      machine.status = 'standby';
      statusChanged = true;
    } else if (['offline', '', null].includes(oldStatus)) {
      machine.status = 'standby';
      statusChanged = true;
    }
  }

  await machineRepo.save(machine);
  return res.status(200).json({
    status: 'success',
    machine_status: machine.status,
    status_changed: statusChanged,
    command: session?.targetStatus ?? 'OFF',
    server_time_jakarta: safeIsoformat(tzNow()),
  });
};