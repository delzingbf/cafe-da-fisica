// Loaded in every database-backed test file (see vitest.config.*.ts `setupFiles`).
// Gives each test a clean database: every table is truncated before it runs.
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from '../src/database/typeorm.options.js';
import { TEST_DATABASE_URL } from './test-database-url.js';

/** Direct connection to the test database, for assertions that bypass the app. */
export const testDataSource = new DataSource(buildDataSourceOptions(TEST_DATABASE_URL));

let truncateSql: string;

beforeAll(async () => {
    await testDataSource.initialize();
    const tables = testDataSource.entityMetadatas.map((meta) => `"${meta.tableName}"`);
    truncateSql = `TRUNCATE ${tables.join(', ')} RESTART IDENTITY CASCADE`;
});

beforeEach(async () => {
    await testDataSource.query(truncateSql);
});

afterAll(async () => {
    await testDataSource.destroy();
});
