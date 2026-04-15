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

  findById(id: number): Promise<Device | null> {
    return this.repo.findOne({ where: { id } });
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
      .createQueryBuilder('m')
      .where('m.status IN (:...statuses)', { statuses })
      .getCount();
  }

  save(Device: Device): Promise<Device> {
    return this.repo.save(Device);
  }

  remove(Device: Device): Promise<Device> {
    return this.repo.remove(Device);
  }
}