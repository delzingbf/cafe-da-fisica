import { defineConfig } from 'vitest/config';

// Unit tests: `*.spec.ts` next to the code they cover.
export default defineConfig({
    resolve: {
        // Honour path aliases from tsconfig.json (e.g. ones added by `nest g library`).
        tsconfigPaths: true,
    },
    test: {
        globals: true,
        root: './',
        include: ['src/**/*.spec.ts'],
    },
});
