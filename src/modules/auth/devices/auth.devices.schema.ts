import { z } from 'zod';

const machineSchema = z.object({
  name: z.string().min(3),
  machine_type: z.string().min(3),
  amp: z.number().positive(),
  volt: z.number().positive(),
  relay_status: z.string().max(3),
  watt: z.number().positive(),  
});

export const bootstrapDeviceSchema = z.object({
  device_id: z.string().min(3),
  dev_key: z.string().min(6),
  device_type: z.string().min(3),
  location: z.string().min(3).optional(),
  wifi_info: z.object({
    ssid: z.string().min(1),
    bssid: z.string().min(12),
  }),
  machines: z.array(machineSchema).min(1),
});

export const loginDeviceSchema = z.object({
  device_id: z.string().min(3),
  dev_key: z.string().min(6),
  wifi_info: z.object({
    ssid: z.string().min(1),
    bssid: z.string().min(12),
  }),
});

export type BootstrapDeviceBody = z.infer<typeof bootstrapDeviceSchema>;

export type LoginDeviceBody = z.infer<typeof loginDeviceSchema>;

export type MachineInput = z.infer<typeof machineSchema>;