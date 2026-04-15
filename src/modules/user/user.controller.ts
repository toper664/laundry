import { type Request, type Response } from 'express';
import { AppDataSource } from '../../config/database.ts';
import { User } from './user.ts';
import { UserService } from './user.services.ts';
import { UserRepository } from './user.queries.ts';

const repo = new UserRepository(AppDataSource);

// export const getUser = async (req: AuthRequest, res: Response): Promise<Response> => {
//   try {
//     const userId = req.user?.userId;

//     if (!userId) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const user = await repo.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     return res.json({ success: true, data: user });
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

export const getAllUsers = async (_req: Request, res: Response): Promise<Response | void> => {
  try {
    const users = await repo.findAll();

    return res.render('users', { users });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<Response | void> => {
  const { username, password, role = 'operator' } = req.body;
  const existing = await repo.findByUsername(username);
  if (!existing) {
    const user = repo.create({ username, role });
    const us = new UserService();
    user.createdBy = (req as any).currentUser?.id;
    await us.setPassword(user, password);
    await repo.save(user);
    return res.redirect('/users');
  } else {
    return res.status(400).json({ error: 'Username already exists' });
  }
};

export const editUser = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send('Missing user_id');
  }
  const userId = Number(id);
  const user = await repo.findById(userId);
  if (!user) return res.status(404).send('Not found');
  const currentUser: User = (req as any).currentUser;
  if (user.id === currentUser.id) return res.status(400).send('You cannot edit your own user account').redirect('/users');
  if (req.body.role) user.role = req.body.role;
  user.isActiveUser = req.body.is_active === 'true' || req.body.is_active === true;
  await repo.save(user);
  return res.redirect('/users');
};

export const resetPassword = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send('Missing user_id');
  }
  const userId = Number(id);
  const user = await repo.findById(userId);
  if (!user) return res.status(404).send('Not found');
  const { new_password, confirm_password } = req.body;
  if (!new_password || new_password !== confirm_password) return res.status(400).send('Passwords do not match').redirect('/users');
  const us = new UserService();
  await us.setPassword(user, new_password);
  await repo.save(user);
  return res.redirect('/users');
};

export const deleteUser = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send('Missing user_id');
  }
  const userId = Number(id);
  const user = await repo.findById(userId);
  if (!user) return res.status(404).send('Not found');
  const currentUser: User = (req as any).currentUser;
  if (user.id === currentUser.id) return res.status(400).send('You cannot delete your own user account').redirect('/users');
  if (user.role === 'admin') {
    const adminCount = await repo.countByRole('admin');
    if (adminCount <= 1) return res.status(400).send('Cannot delete the last admin user').redirect('/users');
  }
  await repo.remove(user);
  return res.redirect('/users');
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send('Missing user_id');
  }
  const userId = Number(id);
  const user = await repo.findById(userId);
  if (!user) return res.status(404).send('Not found');
  const currentUser: User = (req as any).currentUser;
  if (user.id === currentUser.id) return res.status(400).send('You cannot modify your own user account').redirect('/users');
  user.isActiveUser = !user.isActiveUser;
  await repo.save(user);
  return res.redirect('/users');
};