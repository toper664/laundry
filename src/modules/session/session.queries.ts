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

  findRunningByDevice(deviceId: number): Promise<Session | null> {
    return this.repo.findOne({ where: { deviceId, status: 'running' } });
  }

  findLatestByDevice(deviceId: number): Promise<Session | null> {
    return this.repo.findOne({ where: { deviceId }, order: { startTime: 'DESC' } });
  }

  findByDevice(deviceId: number): Promise<Session[]> {
    return this.repo.find({ where: { deviceId }, order: { startTime: 'DESC' } });
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