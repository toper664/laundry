import type { Request, Response } from 'express';
import { DeviceRepository } from '../device/device.queries.ts';
import { SessionRepository } from '../session/session.queries.ts';
import { AppDataSource } from '../../config/database.ts';
import { getCurrentWifi, getSignalBars } from '../../utils/wifi.ts';
import { formatJakartaTime, nowJakarta, safeIsoformat } from '../../utils/tz.ts';

export const getWifiStatus = async (req: Request, res: Response): Promise<Response> => {
    const [ssid, signal] = getCurrentWifi();
    return res.status(200).json({
        ssid,
        signal,
        bars: signal ? getSignalBars(signal) : 0,
        status: ssid ? 'connected' : 'disconnected',
        timestamp: safeIsoformat(nowJakarta()),
    });
};

export const getAllDevices = async (req: Request, res: Response): Promise<Response> => {
  const machineRepo = new DeviceRepository(AppDataSource);
  const machines = await machineRepo.findAll();
  const sessionRepo = new SessionRepository(AppDataSource);

  const data = await Promise.all(machines.map(async m => {
    const latest = await sessionRepo.findLatestByDevice(m.id);
    let currentStatus = m.status || 'standby';
    if (['offline', '', 'stopped', 'STOPPED'].includes(currentStatus)) currentStatus = 'standby';
    return {
      id: m.id,
      name: m.name,
      type: m.deviceType,
      status: currentStatus,
      current_amp: latest ? Math.round(latest.currentAmp * 100) / 100 : 0,
      actual_status: latest?.actualStatus ?? 'OFF',
      target_status: latest?.targetStatus ?? 'OFF',
      last_update: latest ? formatJakartaTime(latest.startTime) : '-',
      session_active: latest ? latest.status === 'running' : false,
    };
  }));

  return res.status(200).json(data);
};