import { Router } from 'express';
import { createUser, deleteUser, editUser, getAllUsers, resetPassword, toggleUserStatus } from './user.controller.ts';

const router = Router();

router.get('/', getAllUsers);
router.post('/create', createUser);
router.post('/:id/edit', editUser);
router.post('/:id/reset-password', resetPassword);
router.post('/:id/delete', deleteUser);
router.post('/:id/toggle', toggleUserStatus);

export default router;
