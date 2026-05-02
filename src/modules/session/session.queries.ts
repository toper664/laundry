import { DataSource, Repository } from 'typeorm';
import { Session } from './session.ts';

export class SessionRepository {
  private repo: Repository<Session>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Session);
  }

  create(sessionData: Partial<Session>): Session {
    return this.repo.create(sessionData);
  }

  findById(id: number): Promise<Session | null> {
    return this.repo.findOne({ where: { id } });
  }

  findRunningByMachine(machineId: number): Promise<Session | null> {
    return this.repo.findOne({ where: { machineId, status: 'running' } });
  }

  findLatestByMachine(machineId: number): Promise<Session | null> {
    return this.repo.findOne({ where: { machineId }, order: { startTime: 'DESC' } });
  }

  findByMachine(machineId: number): Promise<Session[]> {
    return this.repo.find({ where: { machineId }, order: { startTime: 'DESC' } });
  }

  findByDateRange(utcStart: Date, utcEnd: Date): Promise<Session[]> {
    return this.repo
      .createQueryBuilder('s')
      .where('s.startTime >= :start AND s.startTime <= :end', { start: utcStart, end: utcEnd })
      .orderBy('s.startTime', 'DESC')
      .getMany();
  }

  countByDateRange(utcStart: Date, utcEnd: Date): Promise<number> {
    return this.repo
      .createQueryBuilder('s')
      .where('s.startTime >= :start AND s.startTime <= :end', { start: utcStart, end: utcEnd })
      .getCount();
  }

  save(session: Session): Promise<Session> {
    return this.repo.save(session);
  }
}