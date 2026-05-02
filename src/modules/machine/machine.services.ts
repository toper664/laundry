import { Machine } from './machine.ts';
import { Session } from '../session/session.ts';

export class MachineService {
  get type(): (machine: Machine) => string {
    return (machine) => machine.machineType;
  }

  normalizeStatus(machine: Machine): string {
    if (!machine.status || ['offline', '', 'stopped', 'STOPPED'].includes(machine.status)) {
      return 'standby';
    }
    return machine.status;
  }

  toSummary(machine: Machine, latestSession?: Session): object {
    return {
      id: machine.id,
      name: machine.name,
      type: machine.machineType,
      status: this.normalizeStatus(machine),
      current_amp: latestSession ? Math.round(latestSession.currentAmp * 100) / 100 : 0,
      target_status: latestSession?.targetStatus ?? 'OFF',
      actual_status: latestSession?.actualStatus ?? 'OFF',
      session_active: latestSession?.status === 'running',
    };
  }
}