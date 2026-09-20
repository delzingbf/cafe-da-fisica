import 'dotenv/config';

// Connection string for the test database (created once by db/init/001-create-test-database.sql).
// Override with TEST_DATABASE_URL in apps/api/.env, e.g. when PostgreSQL is mapped to another port.
export const TEST_DATABASE_URL =
    process.env.TEST_DATABASE_URL ?? 'postgresql://cafe:cafe@localhost:5432/cafe_da_fisica_test';
