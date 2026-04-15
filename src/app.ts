import express, { type Request, type Response, type NextFunction } from 'express';
import session from 'express-session';
import { Eta } from 'eta';
import * as path from 'path';
import axios from 'axios';
import multer from 'multer';
import { config } from './config/conf.ts';

import { check } from './middlewares/isAuth.ts';
import { hasRole, hasPerm } from './middlewares/checkPerm.ts';
import authRoutes from './modules/auth/auth.routes.ts';
import userRoutes from './modules/user/user.routes.ts';
import { settings } from 'cluster';
import { profile } from 'console';

const app = express();

const eta = new Eta({
  views: path.join(import.meta.dirname, "views"),
  cache: true,
});

function buildEtaEngine() {
  return (path: string, opts: any, callback: (arg0: unknown, arg1: string | undefined) => void) => {
    try {
      const fileContent = eta.readFile(path);
      const renderedTemplate = eta.renderString(fileContent, opts);
      callback(null, renderedTemplate);
    } catch (error) {
      callback(error, undefined);
    };
  };
}

app.engine("eta", buildEtaEngine())
app.set("view engine", "eta")

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: config.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: config.PERMANENT_SESSION_LIFETIME * 1000 },
}));
app.use(express.static('static'));

app.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'Running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/auth', authRoutes);
app.use(check);
app.use('/users', hasRole('admin'), userRoutes);
// app.use('/', dashboardRoutes);
// app.use('/api', apiRoutes);
// app.use('/settings', settingsRoutes);
// app.use('/profile', profileRoutes);
// app.use('/devices', deviceRoutes);

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