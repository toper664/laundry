import { Router } from 'express';
import { hasRole } from '../../middlewares/checkPerm.ts';
import { ackCommand, getAllStatus, getCommands, getQueue, getStatus, postData, queueCommand, updateESP32 } from './device.controller.ts';

const router = Router();

router.post('/', updateESP32);
router.get('/status', getAllStatus);
router.get('/status/:device_id', getStatus);
router.get('/queue/:device_id', getQueue);
router.get('/command', getCommands);
router.post('/command/ack', ackCommand);
router.post('/data', postData);
router.post('/queue-command', queueCommand);

export default router;