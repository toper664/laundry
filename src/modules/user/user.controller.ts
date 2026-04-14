import { type Request, type Response } from 'express';
import { User } from '../../models/user.ts';
import { AppDataSource } from '../../config/database.ts';

const userRepository = AppDataSource.getRepository(User);

interface AuthRequest extends Request {
  user?: {
    userId: number;
  };
}

export const getUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await userRepository.findOneBy({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const users = await userRepository.find();

    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};