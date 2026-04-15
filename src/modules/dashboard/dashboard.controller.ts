import type { Request, Response } from 'express';
import { DeviceRepository } from '../device/device.queries.ts';
import { AppDataSource } from '../../config/database.ts';
import { SessionRepository } from '../session/session.queries.ts';
import { getTodayDate, jakartaToUtc } from '../../utils/tz.ts';

export const getDashboard = async (req: Request, res: Response) => {
  const machineRepo = new DeviceRepository(AppDataSource);
  const sessionRepo = new SessionRepository(AppDataSource);

  const totalMachines = await machineRepo.countByStatuses(['online', 'offline', 'standby', 'running']);
  const onlineMachines = await machineRepo.countByStatus('online');
  const runningMachines = await machineRepo.countByStatus('running');

  const today = getTodayDate();
  const utcStart = jakartaToUtc(today)!;
  const utcEnd = jakartaToUtc(today.endOf('day'))!;

  const todaySessions = await sessionRepo.countByDateRange(utcStart, utcEnd);

  const machines = await machineRepo.findAll();
  const machineData = await Promise.all(machines.map(async m => {
    let currentStatus = m.status || 'standby';
    if (['offline', ''].includes(currentStatus)) currentStatus = 'standby';
    const latestSession = await sessionRepo.findLatestByDevice(m.id);
    return {
      id: m.id,
      name: m.name,
      type: m.deviceType,
      status: currentStatus,
      current_amp: latestSession?.currentAmp ?? 0,
      target_status: latestSession?.targetStatus ?? 'OFF',
      actual_status: latestSession?.actualStatus ?? 'OFF',
    };
  }));

  return res.render('index', { totalMachines, onlineMachines, runningMachines, todaySessions, machines: machineData });
};