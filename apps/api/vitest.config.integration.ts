import { defineConfig } from 'vitest/config';
import { TEST_DATABASE_URL } from './test/test-database-url.js';

// Integration tests: real PostgreSQL (cafe_da_fisica_test), `*.int-spec.ts` next to the code.
// Requires `npm run db:up`. Migrations are applied automatically before the run.
export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        globals: true,
        root: './',
        include: ['src/**/*.int-spec.ts'],
        globalSetup: ['./test/global-setup.ts'],
        setupFiles: ['./test/setup-database.ts'],
        // Every file shares one database, so they must not run at the same time.
        fileParallelism: false,
        env: {
            NODE_ENV: 'test',
            DATABASE_URL: TEST_DATABASE_URL,
        },
    },
});
