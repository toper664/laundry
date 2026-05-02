import type { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database.ts';
import { UserRepository } from '../modules/user/user.queries.ts';
import { DeviceRepository } from '../modules/device/device.queries.ts';

const urepo = new UserRepository(AppDataSource);
const drepo = new DeviceRepository(AppDataSource);

export const hasType = (requiredType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try{
      if (!res.locals.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (res.locals.id.type !== requiredType) {
        return res
          .status(403)
          .json({ error: `Forbidden: Requires ${requiredType} type` });
      }

      return next();
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const hasRole = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!res.locals.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await urepo.findById(res.locals.id.sub);

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
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!res.locals.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const device = await drepo.findByUuid(res.locals.id.sub);

      if (!device || !device.permissions.includes(requiredPerm)) {
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