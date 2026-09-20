-- Runs once, when the PostgreSQL data volume is first created (see compose.yaml).
-- Only server-level setup belongs here. Tables live in TypeORM migrations
-- (apps/api/src/database/migrations) and are applied with `npm run db:migrate`.

-- Database used by the API's integration and e2e tests (`npm run test:int`, `npm run test:e2e`).
CREATE DATABASE cafe_da_fisica_test;
