# Database

PostgreSQL 17, run locally through Docker (`compose.yaml` at the repository root).

| What                     | Where                                    |
| ------------------------ | ---------------------------------------- |
| Container definition     | `compose.yaml` (service `db`)            |
| Credentials / port       | `.env` at the repo root (`.env.example`) |
| First-boot SQL scripts   | `db/init/*.sql`                          |
| Schema (source of truth) | `apps/api/prisma/schema.prisma`          |
| Migrations               | `apps/api/prisma/migrations/`            |
| Seed data                | `apps/api/prisma/seed.ts`                |

## Everyday commands (from the repo root)

```bash
npm run db:up        # start PostgreSQL in the background
npm run db:logs      # follow its logs
npm run db:migrate   # create/apply a migration from schema.prisma changes (prisma migrate dev)
npm run db:seed      # run apps/api/prisma/seed.ts
npm run db:studio    # browse data in Prisma Studio
npm run db:reset     # drop, recreate, migrate and seed (development only!)
npm run db:down      # stop the container (data is kept in the `pgdata` volume)
```

To wipe the data volume as well: `docker compose down -v`.

## Connection strings

```
development: postgresql://cafe:cafe@localhost:5432/cafe_da_fisica
tests:       postgresql://cafe:cafe@localhost:5432/cafe_da_fisica_test
```

The API reads `DATABASE_URL` from `apps/api/.env`.

## Changing the schema

1. Edit `apps/api/prisma/schema.prisma`.
2. Run `npm run db:migrate` and give the migration a descriptive name.
3. Commit the generated folder under `apps/api/prisma/migrations/` together with the schema change.

`db/init` scripts only run on a brand-new volume, so never put table definitions there.

## Troubleshooting

**"Authentication failed" or "connection refused" although the container is healthy** — another PostgreSQL
(e.g. a native Windows/macOS install) is probably already listening on port 5432 and receiving the
connections. Pick another host port for the container: set `POSTGRES_PORT=5433` in `.env`, use the same
port in `DATABASE_URL` in `apps/api/.env`, and run `npm run db:up` again (the container is recreated, data
is kept).
