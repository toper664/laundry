import * as bcrypt from 'bcrypt';
import { User } from './user.ts';

export class UserService {
  async setPassword(user: User, password: string): Promise<void> {
    user.password = await bcrypt.hash(password, 12);
  }

  async checkPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  isAdmin(user: User): boolean {
    return user.role === 'admin';
  }
}