import type { Request, Response } from 'express';
import axios from 'axios';
import { config } from '../../config/conf.ts';
import { DeviceRepository } from '../device/device.queries.ts';
import { SessionRepository } from '../session/session.queries.ts';
import { SessionService } from '../session/session.services.ts';
import { NotifRepository } from '../notif/notif.queries.ts';
import { AppDataSource } from '../../config/database.ts';
import { formatJakartaTime } from '../../utils/tz.ts';

export const manualSim = async (req: Request, res: Response): Promise<Response> => {
  const { machine_id, action, duration } = req.body;
  const machineRepo = new DeviceRepository(AppDataSource);
  const sessionRepo = new SessionRepository(AppDataSource);
  const notifRepo = new NotifRepository(AppDataSource);
  const ss = new SessionService();

  const machine = await machineRepo.findById(machine_id);
  if (!machine) return res.status(404).json({ error: 'Machine not found' });

  const existingSession = await sessionRepo.findRunningByDevice(machine_id);

  if (action === 'START') {
    if (existingSession) return res.json({ success: false, message: 'Machine already running' });

    const session = sessionRepo.create({
      deviceId: machine_id, status: 'running', actualStatus: 'ON', targetStatus: 'ON',
      currentAmp: machine.ampThreshold + 1.0, maxAmp: machine.ampThreshold + 1.0,
      startTime: new Date(),
    });
    machine.status = 'running';
    await sessionRepo.save(session);
    await machineRepo.save(machine);

    await notifRepo.createNotif(machine.id, machine.name, 'running', `Simulation ${machine.name}: started`);

    if (duration) {
      setTimeout(async () => {
        try {
          await axios.post(`http://${config.IP_ADDR}:${config.PORT}/simulator/control`, { machine_id, action: 'stop' });
        } catch {}
      }, duration * 1000);
    }

    return res.status(200).json({
        success: true,
        message: `${machine.name} started`,
        session_id: session.id,
        start_time_jakarta: formatJakartaTime(session.startTime) });
  }

  if (action === 'STOP') {
    if (!existingSession) return res.status(400).json({ success: false, message: 'Machine not running' });
    const endTime = new Date();
    const durationSeconds = (endTime.getTime() - existingSession.startTime.getTime()) / 1000;
    machine.status = 'standby';
    existingSession.status = 'completed';
    existingSession.endTime = endTime;
    existingSession.actualStatus = 'OFF';
    existingSession.currentAmp = 0;
    await sessionRepo.save(existingSession);
    await machineRepo.save(machine);

    await notifRepo.createNotif(machine.id, machine.name, 'completed', `Simulation ${machine.name}: done in (${durationSeconds.toFixed(0)}s)`);

    return res.status(200).json({
        success: true,
        message: `${machine.name} stopped`,
        duration: durationSeconds,
        duration_formatted: ss.durationFormatted(existingSession),
        start_time: ss.startTimeFormatted(existingSession),
        end_time: ss.endTimeFormatted(existingSession)
    });
  }

  return res.status(400).json({ error: 'Invalid action' });
};

export const autoSim = async (req: Request, res: Response): Promise<Response> => {
  const machineRepo = new DeviceRepository(AppDataSource);
  const machines = await machineRepo.findAll();
  const sessionRepo = new SessionRepository(AppDataSource);
  const results: string[] = [];

  for (const machine of machines) {
    const isRunning = await sessionRepo.findRunningByDevice(machine.id);
    if (!isRunning && Math.random() > 0.7) {
      try {
        await axios.post(`http://${config.IP_ADDR}:${config.PORT}/simulator/control`, { machine_id: machine.id, action: 'START' });
        results.push(`${machine.name} started`);
      } catch {}
    } else if (isRunning && Math.random() > 0.8) {
      try {
        await axios.post(`http://${config.IP_ADDR}:${config.PORT}/simulator/control`, { machine_id: machine.id, action: 'STOP' });
        results.push(`${machine.name} stopped`);
      } catch {}
    }
  }

  return res.status(200).json({
    success: true,
    message: `${results.length} actions triggered`,
    details: results });
};