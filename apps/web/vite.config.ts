import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    // Keep the terminal history (and the Local URL) when running alongside the API in `npm run dev`.
    clearScreen: false,
    server: {
        port: 5173,
        // Forward /api/* to the NestJS dev server so the browser never deals with CORS.
        proxy: {
            '/api': { target: 'http://localhost:3000', changeOrigin: true },
        },
    },
    test: {
        environment: 'jsdom',
        // Node 25+ ships its own global `localStorage` (undefined without --localstorage-file),
        // which shadows jsdom's. Turning it off leaves jsdom's in place; harmless on Node 24.
        execArgv: ['--no-experimental-webstorage'],
        include: ['src/**/*.test.{ts,tsx}'],
    },
});
