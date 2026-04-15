import { Router } from 'express';
import { getWifiStatus, updateESP32 } from './api.controller.ts';

const router = Router();

// router.get('/status', getAllUsers);
// router.get('/command', );
// router.get('/notifs', );
router.get('/wifi', getWifiStatus);
router.post('/esp32', updateESP32);
// router.get('/sessions', );

export default router;
