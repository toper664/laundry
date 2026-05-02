import { Router } from 'express';
import { bootstrap, reauth, refresh } from './auth.devices.controller.ts';

const router = Router();

router.post('/bootstrap', bootstrap);
router.post('/reauth', reauth);
router.post('/refresh', refresh);

export default router;