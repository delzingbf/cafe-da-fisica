import { defineConfig } from 'vitest/config';

// End-to-end tests: boot the whole Nest app and hit it over HTTP (test/*.e2e-spec.ts).
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://cafe:cafe@localhost:5432/cafe_da_fisica_test',
    },
  },
});
