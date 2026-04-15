import { Router } from 'express';
import { getAllDevices, createDevice, editDevice, deleteDevice } from './device.controller.ts';
import { hasRole, hasPerm } from '../../middlewares/checkPerm.ts';

const router = Router();

router.get('/', getAllDevices);
router.get('/create', (req, res) => {
    res.render('form', { title: 'Create Machine', machine: null });
});
router.get('/:id/edit', (req, res) => {
    res.render('form', { title: 'Edit Machine', machine: null });
});
router.post('/create', hasPerm('create_machine') || hasPerm('all'), createDevice);
router.post('/:id/edit', hasPerm('edit_machine') || hasPerm('all'), editDevice);
router.post('/:id/delete', hasRole('admin'), deleteDevice);

export default router;