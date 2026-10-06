import { join } from 'node:path';
import type { DataSourceOptions } from 'typeorm';
import { entities } from './entities.js';

// Options shared by the Nest module (runtime), the TypeORM CLI (migrations) and the test setup.
export function buildDataSourceOptions(databaseUrl: string): DataSourceOptions {
    return {
        type: 'postgres',
        url: databaseUrl,
        entities,
        // Resolved next to this file, so it works from src/ (tsx, vitest) and from dist/ (nest build).
        migrations: [join(import.meta.dirname, 'migrations', '*.{ts,js}')],
        migrationsTableName: 'migrations',
        // Never let TypeORM alter the schema on its own — migrations are the only way in.
        synchronize: false,
    };
}
