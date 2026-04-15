import type { Request, Response } from 'express';
import { DeviceRepository } from '../device/device.queries.ts';
import { SessionRepository } from '../session/session.queries.ts';
import { SessionService } from '../session/session.services.ts';
import { NotifRepository } from '../notif/notif.queries.ts';
import { AppDataSource } from '../../config/database.ts';
import { nowJakarta, safeIsoformat } from '../../utils/tz.ts';

const commandQueues = new Map(); // device_id -> array of commands
const deviceStatus = new Map();  // device_id -> last data

export const getStatus = (req: Request, res: Response): Response => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send('Missing device_id');
    }
    const device_id = Number(id);
    const status = deviceStatus.get(device_id);

    if (!status) {
        return res.status(404).json({ 
            error: 'Device not found or offline' 
        });
    }

    return res.status(200).json(status);
};

export const getAllStatus = (req: Request, res: Response): Response => {
  return res.json({
    devices: Object.fromEntries(deviceStatus),
    active_devices: deviceStatus.size
  });
};

export const getQueue = (req: Request, res: Response): Response => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send('Missing device_id');
    }
    const device_id = Number(id);
    const queue = commandQueues.get(device_id) || [];
    
    return res.status(200).json({
        device_id,
        queue_length: queue.length,
        commands: queue
    });
};

export const getCommands = (req: Request, res: Response): Response => {
    const { device_id } = req.query;
    
    if (!device_id) {
        return res.status(400).json({ error: 'device_id required' });
    }

    const commands = commandQueues.get(device_id) || [];
    commandQueues.set(device_id, []);

    console.log(`[ESP32] ${device_id} polled, sending ${commands.length} commands`);

    return res.status(200).json({
        device_id,
        commands: commands,
        timestamp: safeIsoformat(nowJakarta()),
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
    const { device_id, channel1, channel2 } = req.body;

    if (!device_id) {
        return res.status(400).json({ error: 'device_id required' });
    }

    const time = safeIsoformat(nowJakarta());

    deviceStatus.set(device_id, {
        device_id,
        channel1,
        channel2,
        last_seen: time,
    });

    console.log(`[DATA] ${device_id} | CH1: ${channel1?.current}A (${channel1?.relay_status}) | CH2: ${channel2?.current}A (${channel2?.relay_status})`);

    return res.status(200).json({
        received: true,
        device_id,
        timestamp: time
    });
};

export const queueCommand = (req: Request, res: Response): Response => {
    const { device_id, machine_id, command } = req.body;

    if (!device_id || !machine_id || !command) {
        return res.status(400).json({ 
            error: 'device_id, machine_id, and command required' 
        });
    }

    if (!['START', 'STOP'].includes(command)) {
        return res.status(400).json({ 
            error: 'command must be START or STOP' 
        });
    }

    const commandId = Date.now();
    if (!commandQueues.has(device_id)) {
        commandQueues.set(device_id, []);
    }

    commandQueues.get(device_id).push({
        command_id: commandId,
        machine_id: parseInt(machine_id),
        command: command,
        queued_at: safeIsoformat(nowJakarta()),
    });

    console.log(`[QUEUE] Added ${command} for Machine ${machine_id} to ${device_id}`);

    return res.status(200).json({
        success: true,
        command_id: commandId,
        device_id,
        machine_id,
        command,
        message: 'Command queued, waiting for ESP32 to poll'
    });
};

export const updateESP32 = async (req: Request, res: Response): Promise<Response> => {
  const { machine_id, current_amp = 0, timestamp: timestampStr, machine_status: explicitStatus } = req.body;
  const currentAmp = parseFloat(current_amp);

  const deviceRepo = new DeviceRepository(AppDataSource);
  const sessionRepo = new SessionRepository(AppDataSource);
  const notifRepo = new NotifRepository(AppDataSource);
  const ss = new SessionService();

  const device = await deviceRepo.findById(machine_id);
  if (!device) return res.status(404).json({ error: 'Device not found' });

  let espTime: Date = new Date();
  if (timestampStr) {
    try {
      espTime = new Date(timestampStr);
    } catch { espTime = new Date(); }
  }

  const oldStatus = device.status;
  const isRunning = currentAmp > device.ampThreshold;
  const newStatus = explicitStatus ?? (isRunning ? 'running' : 'standby');
  const session = await sessionRepo.findRunningByDevice(machine_id);
  let statusChanged = false;

  if (newStatus === 'running') {
    if (device.status !== 'running') {
      device.status = 'running';
      statusChanged = true;
      await notifRepo.createNotif(machine_id, device.name, 'running', `Machine ${device.name} is now operational.`);
    }
    if (!session) {
      const newSession = sessionRepo.create({
        deviceId: machine_id, status: 'running', actualStatus: 'ON',
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
        await notifRepo.createNotif(machine_id, device.name, 'completed', `Laundry session on device ${device.name} has completed.`);
      }
      device.status = 'standby';
      statusChanged = true;
    } else if (['offline', '', null].includes(oldStatus)) {
      device.status = 'standby';
      statusChanged = true;
    }
  }

  await deviceRepo.save(device);
  return res.status(200).json({
    status: 'success',
    device_status: device.status,
    status_changed: statusChanged,
    command: session?.targetStatus ?? 'OFF',
    server_time_jakarta: safeIsoformat(nowJakarta()),
  });
};