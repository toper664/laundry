import { type Request, type Response, type NextFunction } from 'express';
import { AppDataSource } from '../config/database.ts';
import { User } from '../modules/user/user.ts';

const userRepository = AppDataSource.getRepository(User);

interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
  };
}

export const hasRole = (requiredRole: string) => {
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
          .json({ error: `Forbidden: Requires ${requiredRole} role` });
      }

      return next();
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const hasPerm = (requiredPerm: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await userRepository.findOneBy({
        id: req.user.userId,
      });

      if (!user || !user.permissions.includes(requiredPerm)) {
        return res
          .status(403)
          .json({ error: `Forbidden: Requires ${requiredPerm} permission` });
      }

      return next();
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};