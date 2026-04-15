export type SessionStatus = 'standby' | 'running' | 'completed';
export type PowerStatus = 'ON' | 'OFF';

export interface IAmpReading {
  timestamp: string | null;
  amp: number;
}

export interface ILaundrySession {
  id: number;
  deviceId: number;
  startTime: Date;
  endTime?: Date;
  targetStatus: PowerStatus;
  actualStatus: PowerStatus;
  currentAmp: number;
  maxAmp: number;
  status: SessionStatus;
  ampHistory: string;
}

export interface ISessionSummary {
  id: number;
  device_id: number;
  device_name: string;
  start_time: string;
  start_date: string;
  start_full: string | null;
  end_time: string;
  end_full: string | null;
  duration: string;
  duration_seconds: number;
  current_amp: number;
  max_amp: number;
  status: SessionStatus;
  target_status: PowerStatus;
  actual_status: PowerStatus;
}