import { Router } from 'express';
import deviceRoutes from '../device/device.routes.ts';

const router = Router();

// router.get('/notifs', );
// router.get('/wifi', );
router.use('/device', deviceRoutes);
// router.get('/sessions', );

export default router;
