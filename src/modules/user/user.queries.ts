import { DataSource, Repository } from 'typeorm';
import { User } from './user.ts';

export class UserRepository {
  private repo: Repository<User>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(User);
  }

  create(userData: Partial<User>): User {
    return this.repo.create(userData);
  }

  update(id: number, updateData: Partial<User>): Promise<void> {
    return this.repo.update(id, updateData).then(() => {});
  }

  findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({ where: { username } });
  }

  findByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.repo.findOne({ where: { refreshToken } });
  }

  findActiveById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id, isActiveUser: true } });
  }

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  remove(user: User): Promise<User> {
    return this.repo.remove(user);
  }

  countByRole(role: string, isActiveUser = true): Promise<number> {
    return this.repo.count({ where: { role, isActiveUser } });
  }
}