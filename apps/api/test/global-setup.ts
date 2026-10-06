// Runs once per Vitest invocation, before any test file: brings the test database up to date.
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from '../src/infrastructure/database/typeorm.options.js';
import { TEST_DATABASE_URL } from './test-database-url.js';

export default async function setup() {
    if (!/_test\b/.test(new URL(TEST_DATABASE_URL).pathname)) {
        throw new Error(
            `Refusing to run tests against "${TEST_DATABASE_URL}": database name must end in _test`,
        );
    }

    const dataSource = new DataSource(buildDataSourceOptions(TEST_DATABASE_URL));
    try {
        await dataSource.initialize();
    } catch (error) {
        throw new Error(
            `Could not connect to the test database. Is PostgreSQL running? (npm run db:up)\n${String(error)}`,
            { cause: error },
        );
    }
    try {
        await dataSource.runMigrations();
    } finally {
        await dataSource.destroy();
    }
}
