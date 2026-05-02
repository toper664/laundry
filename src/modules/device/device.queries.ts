import { DataSource, Repository } from 'typeorm';
import { Device } from './device.ts';

export class DeviceRepository {
  private repo: Repository<Device>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Device);
  }

  create(data: Partial<Device>): Device {
    return this.repo.create(data);
  }

  findAll(): Promise<Device[]> {
    return this.repo.find();
  }

  findByUuid(uuid: string): Promise<Device | null> {
    return this.repo.findOne({ where: { uuid } });
  }

  findByDeviceId(deviceId: string): Promise<Device | null> {
    return this.repo.findOne({ where: { deviceId } });
  }

  findByType(deviceType: string): Promise<Device[]> {
    return this.repo.find({ where: { deviceType } });
  }

  findByStatus(status: string): Promise<Device[]> {
    return this.repo.find({ where: { status } });
  }

  countByStatus(status: string): Promise<number> {
    return this.repo.count({ where: { status } });
  }

  countByStatuses(statuses: string[]): Promise<number> {
    return this.repo
      .createQueryBuilder('d')
      .where('d.status IN (:...statuses)', { statuses })
      .getCount();
  }

  update(uuid: string, updateData: Partial<Device>): Promise<void> {
    return this.repo.update(uuid, updateData).then(() => {});
  }

  save(Device: Device): Promise<Device> {
    return this.repo.save(Device);
  }

  remove(Device: Device): Promise<Device> {
    return this.repo.remove(Device);
  }
}