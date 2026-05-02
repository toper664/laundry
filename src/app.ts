import express, { type Request, type Response, type NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { Eta } from 'eta';
import * as path from 'path';

import { check } from './middlewares/isAuth.ts';
import { hasRole, hasType } from './middlewares/checkPerm.ts';
import authRoutes from './modules/auth/auth.routes.ts';
import userRoutes from './modules/user/user.routes.ts';
import apiRoutes from './modules/api/api.routes.ts';
import machineRoutes from './modules/machine/machine.routes.ts';
import dashboardRoutes from './modules/dashboard/dashboard.routes.ts';
import wifiRoutes from './modules/wifi/wifi.routes.ts';
import { safeIsoformat, tzNow } from './utils/tz.ts';

const app = express();

const eta = new Eta({
  views: path.join(import.meta.dirname, "views"),
  cache: true,
});

const adminCheck = [hasType('user'), hasRole('admin')];

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
app.set('views', path.join(import.meta.dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));
app.use(cookieParser());

app.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'Running',
    timestamp: safeIsoformat(tzNow()),
  });
});

app.use('/auth', authRoutes);
app.use(check);
app.use('/api', hasType('device'), apiRoutes);
app.use('/', hasType('user'), dashboardRoutes);
app.use('/users', adminCheck, userRoutes);
app.use('/wifi', adminCheck, wifiRoutes);
// app.use('/settings', settingsRoutes);
// app.use('/profile', profileRoutes);
app.use('/machines', hasType('device'), machineRoutes);

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