import { Notif } from './notif.ts';
import { utcToJakarta, formatJakartaTime, safeIsoformat } from '../../utils/tz.ts';

export class NotifService {
  createdAtJakarta(notif: Notif): string {
    return formatJakartaTime(notif.createdAt, 'HH:mm:ss');
  }

  toDict(notif: Notif): object {
    const jakartaTime = utcToJakarta(notif.createdAt);
    return {
      id: notif.id,
      device_id: notif.deviceId,
      device_name: notif.deviceName,
      type: notif.type,
      message: notif.message,
      is_read: notif.isRead,
      created_at: this.createdAtJakarta(notif),
      timestamp: safeIsoformat(jakartaTime),
    };
  }
}