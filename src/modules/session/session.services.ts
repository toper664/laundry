import { Session } from './session.ts';
import { type IAmpReading, type ISessionSummary } from './session.types.ts';
import { utcToTz, formatTzTime, tzNow, safeIsoformat, getTodayDate, tzToUtc } from '../../utils/tz.ts';

export class SessionService {
  durationSeconds(session: Session): number {
    if (session.endTime && session.startTime) {
      return (session.endTime.getTime() - session.startTime.getTime()) / 1000;
    } else if (session.startTime && session.status === 'running') {
      return (Date.now() - session.startTime.getTime()) / 1000;
    }
    return 0;
  }

  durationFormatted(session: Session): string {
    const seconds = Math.floor(this.durationSeconds(session));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    return `${pad(minutes)}:${pad(secs)}`;
  }

  startTimeFormatted(session: Session): string {
    return formatTzTime(session.startTime, 'HH:mm:ss');
  }

  startDateFormatted(session: Session): string {
    return formatTzTime(session.startTime, 'dd MMM yyyy');
  }

  endTimeFormatted(session: Session): string {
    return formatTzTime(session.endTime, 'HH:mm:ss');
  }

  addAmpReading(session: Session, ampValue: number): void {
    let history: IAmpReading[] = [];
    try {
      history = JSON.parse(session.ampHistory || '[]');
    } catch {
      history = [];
    }
    history.push({ timestamp: safeIsoformat(tzNow()), amp: Math.round(ampValue * 100) / 100 });
    if (history.length > 100) history = history.slice(-100);
    session.ampHistory = JSON.stringify(history);
  }

  getAmpHistory(session: Session): IAmpReading[] {
    try {
      return JSON.parse(session.ampHistory || '[]');
    } catch {
      return [];
    }
  }

  getTotalRuntimeToday(machineId: number, sessions: Session[]): number {
    const today = getTodayDate();
    const utcStart = tzToUtc(today);
    const utcEnd = tzToUtc(today.endOf('day'));
    if (!utcStart || !utcEnd) return 0;

    return sessions
      .filter(s =>
        s.machineId === machineId &&
        s.status === 'completed' &&
        s.startTime >= utcStart &&
        s.startTime <= utcEnd
      )
      .reduce((sum, s) => sum + (this.durationSeconds(s) ?? 0), 0);
  }

  toDict(session: Session, machineName: string = '-'): ISessionSummary {
    const startJakarta = utcToTz(session.startTime);
    const endJakarta = utcToTz(session.endTime);
    return {
      id: session.id,
      machine_id: session.machineId,
      machine_name: machineName,
      start_time: this.startTimeFormatted(session),
      start_date: this.startDateFormatted(session),
      start_full: safeIsoformat(startJakarta),
      end_time: this.endTimeFormatted(session),
      end_full: safeIsoformat(endJakarta),
      duration: this.durationFormatted(session),
      duration_seconds: this.durationSeconds(session),
      current_amp: Math.round(session.currentAmp * 100) / 100,
      max_amp: Math.round(session.maxAmp * 100) / 100,
      status: session.status as any,
      target_status: session.targetStatus as any,
      actual_status: session.actualStatus as any,
    };
  }
}