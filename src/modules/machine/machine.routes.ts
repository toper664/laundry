import { Router } from 'express';
import { getAllMachines, editMachine, deleteMachine } from './machine.controller.ts';
import { hasRole, hasPerm } from '../../middlewares/checkPerm.ts';

const router = Router();

router.get('/', getAllMachines);
router.get('/:id/edit', (req, res) => {
    res.render('form', { title: 'Edit Machine', machine: null });
});
router.post('/:id/edit', editMachine);
router.post('/:id/delete', deleteMachine);

export default router;