import { Router } from 'express';
import { getUser, getAllUsers } from './user.controller.ts';
import { has } from '../../middlewares/checkPerm.ts';

const router = Router();

router.get('/', getUser);
router.get('/all', has('admin'), getAllUsers);

export default router;
