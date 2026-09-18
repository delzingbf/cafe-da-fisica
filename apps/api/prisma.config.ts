import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Read directly instead of Prisma's `env()` helper so `prisma generate` (which
    // needs no database) still works on a fresh clone before `.env` exists.
    url: process.env.DATABASE_URL,
  },
});
