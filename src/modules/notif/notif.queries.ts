import { DataSource, Repository } from 'typeorm';
import { Notif } from './notif.ts';

export class NotifRepository {
    private repo: Repository<Notif>;

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Notif);
    }

    async createNotif(deviceId: number, deviceName: string, notifType: string, message: string): Promise<Notif> {
        const newNotif = this.repo.create({ deviceId: deviceId, deviceName: deviceName, type: notifType, message });
        await this.repo.save(newNotif);

        // Keep only latest 100 notifications
        const all = await this.repo.find({ order: { createdAt: 'DESC' } });
        const toDelete = all.slice(100);
        if (toDelete.length > 0) await this.repo.remove(toDelete);

        return newNotif;
    }
}