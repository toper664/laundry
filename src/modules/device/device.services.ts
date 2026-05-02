import { Device } from './device.ts';

export class DeviceService {
  getPermissions(device: Device): string[] {
    try {
      return JSON.parse(device.permissions);
    } catch {
      return [];
    }
  }

  hasPermission(device: Device, permission: string): boolean {
    const perms = this.getPermissions(device);
    return perms.includes('all') || perms.includes(permission);
  }
}