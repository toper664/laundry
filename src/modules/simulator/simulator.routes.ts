import { Router } from 'express';
import { manualSim, autoSim } from './simulator.controller.ts';

const router = Router();

router.post('/control', manualSim);
router.post('/auto', autoSim);

export default router;