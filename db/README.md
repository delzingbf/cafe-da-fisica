# Database

PostgreSQL 17, run locally through Docker (`compose.yaml` at the repository root).

| What                     | Where                                                 |
| ------------------------ | ----------------------------------------------------- |
| Container definition     | `compose.yaml` (service `db`)                         |
| Credentials / port       | `.env` at the repo root (`.env.example`)              |
| First-boot SQL scripts   | `db/init/*.sql` (server setup only, e.g. the test DB) |
| Schema (source of truth) | TypeORM entities: `apps/api/src/**/*.entity.ts`       |
| Migrations               | `apps/api/src/infrastructure/database/migrations/`    |
| CLI data source          | `apps/api/src/infrastructure/database/data-source.ts` |
| Seed data                | `apps/api/src/infrastructure/database/seed.ts`        |

## Everyday commands (from the repo root)

```bash
npm run db:up                  # start PostgreSQL in the background
npm run db:logs                # follow its logs
npm run db:migrate             # apply pending migrations (typeorm migration:run)
npm run db:generate -- AddFoo  # diff entities vs database → new migration file
npm run db:revert              # undo the last migration
npm run db:status              # list applied / pending migrations
npm run db:seed                # run apps/api/src/infrastructure/database/seed.ts (idempotent)
npm run db:reset               # drop everything, migrate and seed (development only!)
npm run db:down                # stop the container (data is kept in the `pgdata` volume)
```

To wipe the data volume as well: `docker compose down -v`.

## Connection strings

```
development: postgresql://cafe:cafe@localhost:5432/cafe_da_fisica        (DATABASE_URL)
tests:       postgresql://cafe:cafe@localhost:5432/cafe_da_fisica_test   (TEST_DATABASE_URL)
```

Both live in `apps/api/.env`. The API only ever reads `DATABASE_URL`; the Vitest configs use
`TEST_DATABASE_URL` and refuse any database whose name does not end in `_test`.

## Changing the schema

1. Edit or add an entity under `apps/api/src/domain/<feature>/<name>.entity.ts`.
2. New entity? Add it to the list in `apps/api/src/infrastructure/database/entities.ts`.
3. With the database running, generate the migration: `npm run db:generate -- <DescriptiveName>`.
4. Review the generated SQL in `apps/api/src/infrastructure/database/migrations/` — TypeORM does not detect
   changes to `CHECK` expressions, so edit those by hand when needed.
5. Apply it with `npm run db:migrate` and commit the migration together with the entity change.

`synchronize` is off everywhere: TypeORM never alters the schema on its own. `db/init` scripts only
run on a brand-new volume, so never put table definitions there.

## Testing against the database

Integration tests (`*.int-spec.ts`, `npm run test:int`) and e2e tests (`npm run test:e2e`) run against
`cafe_da_fisica_test`. Before each run the migrations are applied automatically
(`apps/api/test/global-setup.ts`), and before each test every table is truncated
(`apps/api/test/setup-database.ts`). Unit tests (`*.spec.ts`, `npm test`) never touch a database.

## Troubleshooting

**"Authentication failed" or "connection refused" although the container is healthy** — another PostgreSQL
(e.g. a native Windows/macOS install) is probably already listening on port 5432 and receiving the
connections. Pick another host port for the container: set `POSTGRES_PORT=5433` in `.env`, use the same
port in `DATABASE_URL` and `TEST_DATABASE_URL` in `apps/api/.env`, and run `npm run db:up` again (the
container is recreated, data is kept).

**`database "cafe_da_fisica_test" does not exist`** — the volume predates `db/init/001-create-test-database.sql`.
Either recreate it (`docker compose down -v && npm run db:up`) or create the database by hand:
`docker compose exec db psql -U cafe -c 'CREATE DATABASE cafe_da_fisica_test'`.
