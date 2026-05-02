import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../modules/user/user.ts';
import { Machine } from '../modules/machine/machine.ts';
import { Device } from '../modules/device/device.ts';
import { Session } from '../modules/session/session.ts';
import { Wifi } from '../modules/wifi/wifi.ts';
import { Setting } from '../modules/setting/setting.ts';
import { Notif } from '../modules/notif/notif.ts';
import { ShopProfile } from '../modules/shop_profile/shopProfile.ts';
import { config } from './conf.ts';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  // host: 'localhost',
  // port: 3306,
  // username: 'root',
  // password: 'password',
  synchronize: true,
  logging: false,
  // migrations: ["src/migration/**/*.ts"],
  // subscribers: [],
  database: process.cwd() + config.DATABASE_PATH,
  entities: [User, Device, Machine, Session, Wifi, Setting, Notif, ShopProfile],
  // extra: { 
    
  // },
});