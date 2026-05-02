import { type Request, type Response } from 'express';
import { AppDataSource } from '../../config/database.ts';
import { WifiRepository } from './wifi.queries.ts';

const repo = new WifiRepository(AppDataSource);

// export const getWifi = async (req: AuthRequest, res: Response): Promise<Response> => {
//   try {
//     const wifiId = req.wifi?.wifiId;

//     if (!wifiId) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const wifi = await repo.findById(wifiId);

//     if (!wifi) {
//       return res.status(404).json({ error: 'Wifi not found' });
//     }

//     return res.json({ success: true, data: wifi });
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

export const getAllWifi = async (_req: Request, res: Response): Promise<Response | void> => {
  try {
    const wifis = await repo.findAll();
    return res.json({ success: true, data: wifis });
    // return res.render('wifis', { wifis });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createWifi = async (req: Request, res: Response): Promise<Response | void> => {
  const { ssid, bssid, rssi, securityType = 'Open', relatedDevices = '[]' } = req.body;
  const existing = await repo.findBySsid(ssid);
  if (!existing) {
    const wifi = repo.create({ bssid, ssid, rssi, securityType, relatedDevices });
    await repo.save(wifi);
    return res.status(201).json({ success: true });
    // return res.redirect('/wifi');
  } else {
    return res.status(400).json({ error: 'SSID already exists' });
  }
};

export const editWifi = async (req: Request, res: Response): Promise<Response | void> => {
  const { ssid } = req.params;
  if (!ssid) {
    return res.status(400).send('Missing ssid');
  }
  if (ssid instanceof Array) {
    return res.status(400).send('SSID too long');
  }
  const wifi = await repo.findBySsid(ssid);
  if (!wifi) return res.status(404).send('Not found');
  wifi.ssid = req.body.ssid || wifi.ssid;
  wifi.securityType = req.body.securityType || wifi.securityType;
  wifi.relatedDevices = req.body.relatedDevices || wifi.relatedDevices;
  await repo.save(wifi);
  return res.redirect('/wifi');
};

export const deleteWifi = async (req: Request, res: Response): Promise<Response | void> => {
  const { ssid } = req.params;
  if (!ssid) {
    return res.status(400).send('Missing ssid');
  }
  if (ssid instanceof Array) {
    return res.status(400).send('SSID too long');
  }
  const wifi = await repo.findBySsid(ssid);
  if (!wifi) return res.status(404).send('Not found');
  await repo.remove(wifi);
  return res.redirect('/wifi');
};

export const checkWifiStatus = async (req: Request, res: Response): Promise<Response | void> => {
  const { ssid } = req.params;
  if (!ssid) {
    return res.status(400).send('Missing ssid');
  }
  if (ssid instanceof Array) {
    return res.status(400).send('SSID too long');
  }
  const wifi = await repo.findBySsid(ssid);
  if (!wifi) return res.status(404).send('Not found');
  return res.json({ signal: wifi.rssi }).redirect('/wifi');
};