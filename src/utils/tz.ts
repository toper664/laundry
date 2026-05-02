import { DateTime } from 'luxon';
import { config } from '../config/conf.ts';

export function tzNow(): DateTime {
  return DateTime.now().setZone(config.TIMEZONE).set({ millisecond: 0 });
}

export function utcToTz(utcDt: Date | null | undefined): DateTime | null {
  if (!utcDt) return null;
  return DateTime.fromJSDate(utcDt, { zone: 'utc' }).setZone(config.TIMEZONE).set({ millisecond: 0 });
}

export function tzToUtc(tzDt: DateTime | null | undefined): Date | null {
  if (!tzDt) return null;
  return tzDt.set({ millisecond: 0 }).toUTC().toJSDate();
}

export function formatTzTime(utcDt: Date | null | undefined, format: string = 'HH:mm:ss'): string {
  if (!utcDt) return '-';
  const tz = utcToTz(utcDt);
  if (!tz) return '-';
  return tz.set({ millisecond: 0 }).toFormat(format);
}

export function getTodayDate(): DateTime {
  return tzNow().startOf('day');
}

export function safeIsoformat(dt: Date | DateTime | null | undefined): string | null {
  if (!dt) return null;
  if (dt instanceof Date) return dt.toISOString();
  return (dt as DateTime).set({ millisecond: 0 }).toISO({ suppressMilliseconds: true });
}