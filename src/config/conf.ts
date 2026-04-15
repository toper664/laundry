import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: process.cwd() + '/src/config/.env'});
const akey = fs.readFileSync(process.cwd() + process.env.PATH_TO_ACCESS_KEY, 'utf-8');
const apub = fs.readFileSync(process.cwd() + process.env.PATH_TO_ACCESS_KEY_PUB, 'utf-8');
const rkey = fs.readFileSync(process.cwd() + process.env.PATH_TO_REFRESH_KEY, 'utf-8');
const rpub = fs.readFileSync(process.cwd() + process.env.PATH_TO_REFRESH_KEY_PUB, 'utf-8');
export const config = {
  ACCESS_KEY: akey,
  ACCESS_KEY_PUB: apub,
  REFRESH_KEY: rkey,
  REFRESH_KEY_PUB: rpub,
  DATABASE_PATH: process.env.DATABASE_PATH,
  PERMANENT_SESSION_LIFETIME: parseInt(process.env.PERMANENT_SESSION_LIFETIME || '3600'),
  DEFAULT_ADMIN_USERNAME: process.env.DEFAULT_ADMIN_USERNAME,
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD,
  TIMEZONE: process.env.TIMEZONE,
  IP_ADDR: process.env.IP_ADDR || 'localhost',
  PORT: parseInt(process.env.PORT || '3000'),
};