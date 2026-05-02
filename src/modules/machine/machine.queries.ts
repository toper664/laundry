import { DataSource, Repository } from 'typeorm';
import { Machine } from './machine.ts';

export class MachineRepository {
  private repo: Repository<Machine>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Machine);
  }

  create(data: Partial<Machine>): Machine {
    return this.repo.create(data);
  }

  findAll(): Promise<Machine[]> {
    return this.repo.find();
  }

  findById(id: number): Promise<Machine | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByType(machineType: string): Promise<Machine[]> {
    return this.repo.find({ where: { machineType } });
  }

  findByStatus(status: string): Promise<Machine[]> {
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

  save(Machine: Machine): Promise<Machine> {
    return this.repo.save(Machine);
  }

  remove(Machine: Machine): Promise<Machine> {
    return this.repo.remove(Machine);
  }
}