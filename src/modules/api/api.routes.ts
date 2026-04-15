import { Router } from 'express';
import esp32Routes from '../esp32/esp32.routes.ts';
import { getWifiStatus } from './api.controller.ts';

const router = Router();

// router.get('/notifs', );
router.get('/wifi', getWifiStatus);
router.use('/esp32', esp32Routes);
// router.get('/sessions', );

export default router;
