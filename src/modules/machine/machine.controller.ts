import type { Request, Response } from 'express';
import { MachineRepository } from './machine.queries.ts';
import { AppDataSource } from '../../config/database.ts';

const repo = new MachineRepository(AppDataSource);

export const getAllMachines = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const washers = await repo.findByType('washer');
    const dryers = await repo.findByType('dryer');
    return res.render('list', { washers, dryers });
  } catch (error) {
    console.error('Error fetching machines:', error);
    return res.status(500).send('Internal Server Error');
  }
};

export const editMachine = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send('Missing machine_id');
  }
  const machineId = Number(id);
  const machine = await repo.findById(machineId);
  if (!machine) return res.status(404).send('Not found');
  if (req.body.name) machine.name = req.body.name;
  machine.ampThreshold = parseFloat(req.body.amp_threshold ?? 0.5);
  machine.autoStopSeconds = parseInt(req.body.auto_stop_seconds ?? 5);
  await repo.save(machine);
  res.redirect('/machines');
};

export const deleteMachine = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send('Missing machine_id');
  }
  const machineId = Number(id);
  const machine = await repo.findById(machineId);
  if (!machine) return res.status(404).send('Not found');
  await repo.remove(machine);
  res.redirect('/machines');
};