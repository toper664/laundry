import { type Request, type Response, type NextFunction } from 'express';
import { AppDataSource } from '../config/database.ts';
import { User } from '../models/user.ts';

const userRepository = AppDataSource.getRepository(User);

interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
  };
}

export const has = (requiredRole: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await userRepository.findOneBy({
        id: req.user.userId,
      });

      if (!user || user.role !== requiredRole) {
        return res
          .status(403)
          .json({ error: `Requires ${requiredRole} role` });
      }

      return next();
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};