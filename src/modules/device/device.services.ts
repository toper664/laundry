import { Device } from './device.ts';
import { Session } from '../session/session.ts';

export class DeviceService {
  get type(): (device: Device) => string {
    return (device) => device.deviceType;
  }

  normalizeStatus(device: Device): string {
    if (!device.status || ['offline', '', 'stopped', 'STOPPED'].includes(device.status)) {
      return 'standby';
    }
    return device.status;
  }

  toSummary(device: Device, latestSession?: Session): object {
    return {
      id: device.id,
      name: device.name,
      type: device.deviceType,
      status: this.normalizeStatus(device),
      current_amp: latestSession ? Math.round(latestSession.currentAmp * 100) / 100 : 0,
      target_status: latestSession?.targetStatus ?? 'OFF',
      actual_status: latestSession?.actualStatus ?? 'OFF',
      session_active: latestSession?.status === 'running',
    };
  }
}