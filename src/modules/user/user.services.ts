import * as bcrypt from 'bcrypt';
import { User } from './user.ts';

export class UserService {
  async setPassword(user: User, password: string): Promise<void> {
    user.password = await bcrypt.hash(password, 12);
  }

  async checkPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  getPermissions(user: User): string[] {
    try {
      return JSON.parse(user.permissions);
    } catch {
      return [];
    }
  }

  hasPermission(user: User, permission: string): boolean {
    const perms = this.getPermissions(user);
    return perms.includes('all') || perms.includes(permission) || user.role === 'admin';
  }

  isAdmin(user: User): boolean {
    return user.role === 'admin' || this.getPermissions(user).includes('all');
  }
}