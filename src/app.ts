import express, { type Request, type Response, type NextFunction } from 'express';
import { check } from './middlewares/isAuth.ts';

import authRoutes from './modules/auth/auth.routes.ts';
import userRoutes from './modules/user/user.routes.ts';

const app = express();

app.use(express.json());

app.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'Running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/auth', authRoutes);
app.use(check);
app.use('/user', userRoutes);

app.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    return res.status(500).json({
      success: false,
      error: 'Something went wrong',
    });
  }
);

export default app;