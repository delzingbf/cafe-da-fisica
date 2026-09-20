import { defineConfig } from 'vitest/config';
import { TEST_DATABASE_URL } from './test/test-database-url.js';

// End-to-end tests: boot the whole Nest app against the test database and hit it over HTTP
// (test/*.e2e-spec.ts). Requires `npm run db:up`.
export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        globals: true,
        root: './',
        include: ['test/**/*.e2e-spec.ts'],
        globalSetup: ['./test/global-setup.ts'],
        setupFiles: ['./test/setup-database.ts'],
        fileParallelism: false,
        env: {
            NODE_ENV: 'test',
            DATABASE_URL: TEST_DATABASE_URL,
        },
    },
});
