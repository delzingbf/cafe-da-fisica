-- Runs once, when the PostgreSQL data volume is first created (see compose.yaml).
-- Application tables are NOT created here: they are owned by Prisma migrations
-- in apps/api/prisma/migrations. Use this folder only for instance-level setup.

-- Separate database for automated tests so they never touch development data.
CREATE DATABASE cafe_da_fisica_test;
