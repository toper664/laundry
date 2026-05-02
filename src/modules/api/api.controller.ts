import type { Request, Response } from 'express';
import { MachineRepository } from '../machine/machine.queries.ts';
import { SessionRepository } from '../session/session.queries.ts';
import { AppDataSource } from '../../config/database.ts';
import { formatTzTime } from '../../utils/tz.ts';

export const getAllMachines = async (req: Request, res: Response): Promise<Response> => {
  const machineRepo = new MachineRepository(AppDataSource);
  const machines = await machineRepo.findAll();
  const sessionRepo = new SessionRepository(AppDataSource);

  const data = await Promise.all(machines.map(async m => {
    const latest = await sessionRepo.findLatestByMachine(m.id);
    let currentStatus = m.status || 'standby';
    if (['offline', '', 'stopped', 'STOPPED'].includes(currentStatus)) currentStatus = 'standby';
    return {
      id: m.id,
      name: m.name,
      type: m.machineType,
      status: currentStatus,
      current_amp: latest ? Math.round(latest.currentAmp * 100) / 100 : 0,
      actual_status: latest?.actualStatus ?? 'OFF',
      target_status: latest?.targetStatus ?? 'OFF',
      last_update: latest ? formatTzTime(latest.startTime) : '-',
      session_active: latest ? latest.status === 'running' : false,
    };
  }));

  return res.status(200).json(data);
};