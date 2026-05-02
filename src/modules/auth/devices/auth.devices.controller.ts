import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { v7 as uuidv7 } from 'uuid';
import { generateAccessToken,
         generateRefreshToken,
         hashToken,
         verifyRefreshToken, } from '../../../utils/jwt.ts';
import { MachineRepository } from '../../machine/machine.queries.ts';
import { DeviceRepository } from '../../device/device.queries.ts';
import { WifiRepository } from '../../wifi/wifi.queries.ts';
import { config } from '../../../config/conf.ts';
import { AppDataSource } from '../../../config/database.ts';
import { type BootstrapDeviceBody, bootstrapDeviceSchema, type LoginDeviceBody, loginDeviceSchema, type MachineInput } from './auth.devices.schema.ts';
import { type DeviceInfo } from '../../../middlewares/check.schema.ts';

const mrepo = new MachineRepository(AppDataSource);
const drepo = new DeviceRepository(AppDataSource);
const wrepo = new WifiRepository(AppDataSource);
const SALT_ROUNDS = 12;

export const bootstrap = async (
  req: Request<{}, {}, BootstrapDeviceBody>,
  res: Response
): Promise<Response> => {
  try {
    const result = bootstrapDeviceSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
          error: 'Invalid input',
          details: result.error.flatten(),
        });
      }
  
      const { device_id, dev_key, device_type, location, wifi_info, machines } = result.data;

      if (!device_id || !dev_key) {
        return res.status(400).json({ error: 'device_id and dev_key are required' });
      }

      if (!wifi_info || !wifi_info.ssid || !wifi_info.bssid) {
        return res.status(400).json({ error: 'Incomplete wifi_info' });
      }

      if (machines.length === 0) {
        return res.status(400).json({ error: 'At least one machine is required' });
      }

      if (dev_key !== config.DEFAULT_KEY) {
        return res.status(401).json({ error: 'Invalid device key' });
      }

      if (await drepo.findByDeviceId(device_id)) {
        return res.status(409).json({ error: 'Device ID already exists' });
      }

      const wifi = await wrepo.findByBssid(wifi_info.bssid);

      if (!wifi) {
        return res.status(409).json({ error: 'WiFi not recognized' });
      }

      const uuid = uuidv7();
      const hashedKey = await bcrypt.hash(uuid+device_id, SALT_ROUNDS);
  
      const merr = await createMachine(machines, uuid);
      if (merr instanceof Error) {
        return res.status(400).json({ error: 'Machine creation failed', details: merr.message });
      }

      const device = drepo.create({
        uuid: uuid,
        deviceId: device_id,
        devKey: hashedKey,
        deviceType: device_type,
        location: location ? location : null,
      });
  
      const payload = {
        type: 'device',
        sub: device.uuid,
        name: device.deviceId,
      } as DeviceInfo;
  
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
  
      device.refreshToken = hashToken(refreshToken);
      await drepo.save(device);

      const { relatedDevices } = wifi;
      const updatedRelatedDevices = [...(JSON.parse(relatedDevices) || []), device.uuid];
      await wrepo.update(wifi_info.bssid, { relatedDevices: JSON.stringify(updatedRelatedDevices) });
  
      return res.status(201).json({
        success: true,
        id: device.uuid,
        name: device.deviceId,
        hash: device.devKey,
        token: accessToken,
        refreshToken: refreshToken,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
};

export const reauth = async (
  req: Request<{}, {}, LoginDeviceBody>,
  res: Response
): Promise<Response> => {
  try {
    const result = loginDeviceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: result.error.flatten(),
      });
    }
    
    const { device_id, dev_key, wifi_info } = result.data;
    //device_id is uuid, dev_key is hashed key
    
    const wifi = await wrepo.findByBssid(wifi_info.bssid);

    if (!wifi) {
      return res.status(409).json({ error: 'WiFi not recognized' });
    }

    const device = await drepo.findByUuid(device_id);

    if (!device) {
      return res.status(401).json({ error: 'Device not found' });
    }

    const isMatch = dev_key === device.devKey;

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      type: 'device',
      sub: device.uuid,
      name: device.deviceId,
    } as DeviceInfo;

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    drepo.update(payload.sub, { refreshToken: hashToken(refreshToken) });

    return res.status(200).json({
      success: true,
      id: device.uuid,
      name: device.deviceId,
      token: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken) as DeviceInfo;
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const payload = {
      type: 'device',
      sub: decoded.sub,
      name: decoded.name,
    } as DeviceInfo;

    const device = await drepo.findByUuid(payload.sub);
    if (!device || device.refreshToken !== hashToken(refreshToken)) {
      return res.status(403).json({ error: 'Unrecognized refresh token' });
    }

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await drepo.update(payload.sub, { refreshToken: hashToken(newRefreshToken) });

    return res.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid or expired refresh token' });
  }
};

async function createMachine(machines: MachineInput[], uuid: string) {
  for (const m of machines) {
    try {
      const { name, machine_type, amp = 0.5, volt = 220, watt, relay_status } = m;
      if (!name || !machine_type) throw new Error('Machine name and type are required');
      const machine = mrepo.create({
        name, machineType: machine_type,
        uuid: uuid,
        current: amp,
        voltage: volt,
        power: watt,
        status: relay_status,
      });
      await mrepo.save(machine);
    } catch (err) {
      return err;
    }
  }
};