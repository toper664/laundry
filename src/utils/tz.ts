import { DateTime } from 'luxon';
import { config } from '../config/conf.ts';

export function nowJakarta(): DateTime {
  return DateTime.now().setZone(config.TIMEZONE);
}

export function utcToJakarta(utcDt: Date | null | undefined): DateTime | null {
  if (!utcDt) return null;
  return DateTime.fromJSDate(utcDt, { zone: 'utc' }).setZone(config.TIMEZONE);
}

export function jakartaToUtc(jakartaDt: DateTime | null | undefined): Date | null {
  if (!jakartaDt) return null;
  return jakartaDt.toUTC().toJSDate();
}

export function formatJakartaTime(utcDt: Date | null | undefined, format: string = 'HH:mm:ss'): string {
  if (!utcDt) return '-';
  const jakarta = utcToJakarta(utcDt);
  if (!jakarta) return '-';
  return jakarta.toFormat(format);
}

export function getTodayDate(): DateTime {
  return nowJakarta().startOf('day');
}

export function safeIsoformat(dt: Date | DateTime | null | undefined): string | null {
  if (!dt) return null;
  if (dt instanceof Date) return dt.toISOString();
  return (dt as DateTime).toISO();
}