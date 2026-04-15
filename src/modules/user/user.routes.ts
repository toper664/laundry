import { Router } from 'express';
import { getUser, getAllUsers } from './user.controller.ts';

const router = Router();

router.get('/', getAllUsers);

export default router;
