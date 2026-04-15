import type { Request, Response } from 'express';
import { DeviceRepository } from '../device/device.queries.ts';
import { AppDataSource } from '../../config/database.ts';

const repo = new DeviceRepository(AppDataSource);

export const getAllDevices = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const washers = await repo.findByType('washer');
    const dryers = await repo.findByType('dryer');
    return res.render('list', { washers, dryers });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return res.status(500).send('Internal Server Error');
  }
};

export const createDevice = async (req: Request, res: Response): Promise<Response | void> => {
  const { name, type, location, amp_threshold = 0.5, auto_stop_seconds = 5 } = req.body;
  if (!name || !type) return res.status(400).send('Name and type are required').redirect('/machines/create');
  const device = repo.create({
    name, deviceType: type, location,
    ampThreshold: parseFloat(amp_threshold),
    autoStopSeconds: parseInt(auto_stop_seconds),
  });
  await repo.save(device);
  res.redirect('/machines');
};

export const editDevice = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send('Missing device_id');
  }
  const deviceId = Number(id);
  const device = await repo.findById(deviceId);
  if (!device) return res.status(404).send('Not found');
  if (req.body.name) device.name = req.body.name;
  device.location = req.body.location;
  device.ampThreshold = parseFloat(req.body.amp_threshold ?? 0.5);
  device.autoStopSeconds = parseInt(req.body.auto_stop_seconds ?? 5);
  await repo.save(device);
  res.redirect('/machines');
};

export const deleteDevice = async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send('Missing device_id');
  }
  const deviceId = Number(id);
  const device = await repo.findById(deviceId);
  if (!device) return res.status(404).send('Not found');
  await repo.remove(device);
  res.redirect('/machines');
};