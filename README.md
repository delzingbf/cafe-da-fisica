# Café da Física

Monorepo for the Café da Física project: a NestJS REST API, a React web client and a PostgreSQL database, all in one repository.

| Layer    | Tech                                                     | Location             |
| -------- | -------------------------------------------------------- | -------------------- |
| Backend  | NestJS 12 (TypeScript, ESM), Prisma 7, Vitest            | `apps/api`           |
| Frontend | React 19, Vite 8, plain CSS, Vitest + Testing Library    | `apps/web`           |
| Shared   | Types/constants used by both apps                        | `packages/shared`    |
| Database | PostgreSQL 17 via Docker Compose, schema owned by Prisma | `db`, `compose.yaml` |

Tooling: npm workspaces, TypeScript 6, oxlint, Prettier.

## Repository layout

```
.
├── apps/
│   ├── api/                  NestJS API  → http://localhost:3000/api
│   │   ├── prisma/           schema.prisma, migrations/, seed.ts
│   │   ├── prisma.config.ts  Prisma CLI config (reads DATABASE_URL)
│   │   ├── src/
│   │   │   ├── main.ts       bootstrap: /api prefix, CORS, validation pipe
│   │   │   ├── app.module.ts root module — register feature modules here
│   │   │   ├── config/       env schema + validation (zod)
│   │   │   ├── prisma/       PrismaModule / PrismaService (global)
│   │   │   ├── health/       GET /api/health
│   │   │   ├── common/       filters, guards, interceptors, pipes
│   │   │   └── generated/    Prisma client (git-ignored, from `prisma generate`)
│   │   └── test/             e2e specs (*.e2e-spec.ts)
│   └── web/                  React client → http://localhost:5173
│       ├── vite.config.ts    dev proxy /api → :3000, vitest settings
│       └── src/
│           ├── api/          typed fetch wrapper
│           ├── pages/        route-level components (+ tests)
│           ├── components/   reusable UI
│           └── hooks/        custom hooks
├── packages/
│   └── shared/               @cafe-da-fisica/shared (built to dist/ by tsc)
├── db/
│   ├── init/                 SQL run once when the Postgres volume is created
│   └── README.md             database workflow
├── compose.yaml              PostgreSQL service
├── .env.example              compose variables (copy to .env)
└── package.json              workspaces + root scripts
```

## Prerequisites

- Node.js 24.15+ (`.nvmrc` → `nvm use`) and npm 11
- Docker Desktop (for PostgreSQL)

### Recommended VS Code extensions

Optional, but they surface the same checks the scripts run (types, lint, format, tests) directly in the editor.

| Extension    | ID                          | What it adds                                                         |
| ------------ | --------------------------- | -------------------------------------------------------------------- |
| Vitest       | `vitest.explorer`           | Testing panel, run/debug a single test, inline results               |
| Prisma       | `Prisma.prisma`             | Syntax highlighting, formatting and autocomplete for `schema.prisma` |
| oxc          | `oxc.oxc-vscode`            | oxlint diagnostics as you type                                       |
| Prettier     | `esbenp.prettier-vscode`    | Format on save with the repo's `.prettierrc`                         |
| EditorConfig | `EditorConfig.EditorConfig` | Applies `.editorconfig` (indentation, LF line endings)               |

Install them all from a terminal:

```bash
code --install-extension vitest.explorer --install-extension Prisma.prisma --install-extension oxc.oxc-vscode --install-extension esbenp.prettier-vscode --install-extension EditorConfig.EditorConfig
```

## Getting started

```bash
npm install                                   # installs all workspaces, builds shared, generates the Prisma client

cp .env.example .env                          # database credentials for Docker
cp apps/api/.env.example apps/api/.env        # API config (DATABASE_URL, PORT, …)
cp apps/web/.env.example apps/web/.env        # optional: VITE_API_URL

npm run db:up                                 # start PostgreSQL
npm run db:migrate                            # apply migrations (creates the first one once models exist)

npm run dev                                   # shared (watch) + API (:3000) + web (:5173)
```

Open http://localhost:5173 — the home page calls `GET /api/health` and shows whether the API and the database are up.

## Scripts (run from the repo root)

| Script                      | What it does                                             |
| --------------------------- | -------------------------------------------------------- |
| `npm run dev`               | Runs shared, api and web in watch mode                   |
| `npm run build`             | Builds shared → api → web                                |
| `npm run typecheck`         | `tsc --noEmit` in every workspace                        |
| `npm test`                  | Unit tests (api + web)                                   |
| `npm run test:e2e`          | API end-to-end tests                                     |
| `npm run lint`              | oxlint over the whole repo (warnings fail)               |
| `npm run format`            | Prettier write (`format:check` to verify)                |
| `npm run db:up` / `db:down` | Start / stop PostgreSQL                                  |
| `npm run db:migrate`        | `prisma migrate dev` — new migration from schema changes |
| `npm run db:seed`           | Runs `apps/api/prisma/seed.ts`                           |
| `npm run db:studio`         | Prisma Studio                                            |
| `npm run db:reset`          | Drop + recreate + migrate + seed (dev only)              |

Run a script in a single workspace with `-w`, e.g. `npm run test:watch -w apps/web`.

## How the pieces fit together

- **API prefix** — every route is mounted under `/api` (`API_PREFIX` in `packages/shared`).
- **Dev proxy** — the Vite dev server forwards `/api/*` to `http://localhost:3000`, so the browser never needs CORS in development. In production set `VITE_API_URL` to the deployed API.
- **Shared package** — `@cafe-da-fisica/shared` holds types and constants both apps import. It is compiled to `dist/` (automatically on `npm install`, and in watch mode during `npm run dev`). Put anything here that must stay in sync between client and server (response shapes, enums, route names).
- **Database access** — only the API touches PostgreSQL, through `PrismaService`. Schema lives in `apps/api/prisma/schema.prisma`; see [db/README.md](db/README.md) for the migration workflow.
- **Configuration** — the API validates its environment at startup (`apps/api/src/config/env.ts`) and refuses to boot with a bad config.

## Adding a feature (typical flow)

1. Model the data in `apps/api/prisma/schema.prisma`, then `npm run db:migrate`.
2. Put the shared contract (DTO/response types) in `packages/shared/src`.
3. Create a Nest module (`cd apps/api && npx nest g resource <name>`, or by hand under `apps/api/src/<name>`) and register it in `app.module.ts`.
4. Add a page/component under `apps/web/src` that calls the endpoint through `src/api/client.ts`.
5. Write unit tests next to the code (`*.spec.ts` in the API, `*.test.tsx` in the web app).

## Environment variables

| Variable       | Where           | Purpose                                           |
| -------------- | --------------- | ------------------------------------------------- |
| `POSTGRES_*`   | `.env`          | Credentials/port for the Docker PostgreSQL        |
| `DATABASE_URL` | `apps/api/.env` | Connection string used by Prisma                  |
| `PORT`         | `apps/api/.env` | API port (default 3000)                           |
| `CORS_ORIGIN`  | `apps/api/.env` | Allowed browser origin (default the Vite dev URL) |
| `VITE_API_URL` | `apps/web/.env` | API base URL for the browser (default `/api`)     |
