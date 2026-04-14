import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../models/user.ts';

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
  database: process.cwd() + '/data/storage.db',
  entities: [User],
});