import { Router } from 'express';
import { checkWifiStatus, createWifi, deleteWifi, editWifi, getAllWifi } from './wifi.controller.ts';

const router = Router();

router.get('/', getAllWifi);
router.post('/create', createWifi);
router.post('/:ssid/edit', editWifi);
router.post('/:ssid/delete', deleteWifi);
router.get('/:ssid/status', checkWifiStatus);

export default router;