import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, './config/.env') });
const f = fs.readFileSync(process.cwd() + process.env.PATH_TO_PRIVATE_KEY, 'utf-8').split('\n');
const key = f.slice(1, -1).join('');
export const config = {
  SECRET_KEY: key,
  DATABASE_PATH: process.env.DATABASE_PATH,
  PERMANENT_SESSION_LIFETIME: parseInt(process.env.PERMANENT_SESSION_LIFETIME || '3600'),
  DEFAULT_ADMIN_USERNAME: process.env.DEFAULT_ADMIN_USERNAME,
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD,
  TIMEZONE: process.env.TIMEZONE,
  IP_ADDR: process.env.IP_ADDR || 'localhost',
  PORT: parseInt(process.env.PORT || '3000'),
};