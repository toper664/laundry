import type { Request, Response } from 'express';
import { DeviceRepository } from '../device/device.queries.ts';
import { SessionRepository } from '../session/session.queries.ts';
import { SessionService } from '../session/session.services.ts';
import { NotifRepository } from '../notif/notif.queries.ts';
import { AppDataSource } from '../../config/database.ts';
import { getCurrentWifi, getSignalBars } from '../../utils/wifi.ts';
import { nowJakarta, safeIsoformat } from '../../utils/tz.ts';

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