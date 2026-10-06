// DataSource for the TypeORM CLI (`npm run typeorm -- ...`) and scripts run outside Nest.
// The API itself gets its DataSource from DatabaseModule.
import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './typeorm.options.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set (see apps/api/.env.example)');
}

export default new DataSource(buildDataSourceOptions(databaseUrl));
