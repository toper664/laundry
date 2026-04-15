import { Router } from 'express';
import { hasRole } from '../../middlewares/checkPerm.ts';
import { ackCommand, getAllStatus, getCommands, getQueue, getStatus, postData, queueCommand, updateESP32 } from './esp32.controller.ts';

const router = Router();

router.post('/', hasRole('admin'), updateESP32);
router.get('/status', hasRole('admin'), getAllStatus);
router.get('/status/:device_id', hasRole('admin'), getStatus);
router.get('/queue/:device_id',hasRole('admin'), getQueue);
router.get('/commands', getCommands);
router.post('/command/ack', ackCommand);
router.post('/data', postData);
router.post('/queue-command', hasRole('admin'), queueCommand);

export default router;