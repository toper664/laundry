export type UserRole = 'admin' | 'operator';
export type Permission = 'all' | 'view_settings' | 'edit_settings' | 'create_machine' | 'edit_machine';

export interface IUser {
  id: number;
  username: string;
  role: UserRole;
  permissions: string;
  isActiveUser: boolean;
}