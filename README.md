# Café da Física

Monorepo for the Café da Física project: a NestJS REST API, a React web client and a PostgreSQL database, all in one repository.

| Layer    | Tech                                                  | Location             |
| -------- | ----------------------------------------------------- | -------------------- |
| Backend  | NestJS 12 (TypeScript, ESM), TypeORM 1, Vitest        | `apps/api`           |
| Frontend | React 19, Vite 8, plain CSS, Vitest + Testing Library | `apps/web`           |
| Shared   | Types/constants used by both apps                     | `packages/shared`    |
| Database | PostgreSQL 17 via Docker Compose, schema via TypeORM  | `db`, `compose.yaml` |

Tooling: npm workspaces, TypeScript 6, oxlint, Prettier.

## Repository layout

```
.
├── apps/
│   ├── api/                      NestJS API  → http://localhost:3000/api
│   │   ├── scripts/              typeorm.ts (TypeORM CLI wrapper), email-preview.ts
│   │   ├── src/
│   │   │   ├── main.ts           bootstrap: /api prefix, CORS, validation pipe
│   │   │   ├── app.module.ts     root module — register feature modules here
│   │   │   ├── domain/           business features (module, controller, service, entities)
│   │   │   │   ├── products/     GET /api/products
│   │   │   │   ├── orders/       POST /api/orders; emails/ = order notification emails
│   │   │   │   ├── settings/     single-row settings entity
│   │   │   │   └── admins/       admin accounts entity
│   │   │   ├── infrastructure/   technical support used by the domain
│   │   │   │   ├── config/       env schema + validation (zod)
│   │   │   │   ├── database/     DatabaseModule, data-source.ts, migrations/, seed.ts
│   │   │   │   ├── mail/         MailService (Resend) for transactional emails
│   │   │   │   └── health/       GET /api/health
│   │   │   └── common/           filters, guards, interceptors, pipes
│   │   └── test/                 e2e specs (*.e2e-spec.ts) + database test setup
│   └── web/                      React client → http://localhost:5173
│       ├── vite.config.ts        dev proxy /api → :3000, vitest settings
│       └── src/
│           ├── api/              typed fetch wrapper
│           ├── pages/            route-level components (+ tests)
│           ├── components/       reusable UI
│           └── hooks/            custom hooks
├── packages/
│   └── shared/                   @cafe-da-fisica/shared (built to dist/ by tsc)
├── db/
│   ├── init/                     SQL run once when the Postgres volume is created
│   └── README.md                 database workflow
├── compose.yaml                  PostgreSQL service
├── .env.example                  compose variables (copy to .env)
└── package.json                  workspaces + root scripts
```

## Prerequisites

- Node.js 24.15+ (`.nvmrc` → `nvm use`) and npm 11
- Docker Desktop (for PostgreSQL)

### Recommended VS Code extensions

Optional, but they surface the same checks the scripts run (types, lint, format, tests) directly in the editor.

| Extension    | ID                          | What it adds                                           |
| ------------ | --------------------------- | ------------------------------------------------------ |
| Vitest       | `vitest.explorer`           | Testing panel, run/debug a single test, inline results |
| oxc          | `oxc.oxc-vscode`            | oxlint diagnostics as you type                         |
| Prettier     | `esbenp.prettier-vscode`    | Format on save with the repo's `.prettierrc`           |
| EditorConfig | `EditorConfig.EditorConfig` | Applies `.editorconfig` (indentation, LF line endings) |

Install them all from a terminal:

```bash
code --install-extension vitest.explorer --install-extension oxc.oxc-vscode --install-extension esbenp.prettier-vscode --install-extension EditorConfig.EditorConfig
```

## Getting started

```bash
npm install                                   # installs all workspaces and builds shared

cp .env.example .env                          # database credentials for Docker
cp apps/api/.env.example apps/api/.env        # API config (DATABASE_URL, PORT, …)
cp apps/web/.env.example apps/web/.env        # optional: VITE_API_URL

npm run db:up                                 # start PostgreSQL
npm run db:migrate                            # apply migrations
npm run db:seed                               # optional: sample products + settings

npm run dev                                   # shared (watch) + API (:3000) + web (:5173)
```

Open http://localhost:5173 — the home page calls `GET /api/health` and shows whether the API and the database are up.

<<<<<<< Updated upstream
=======
## Admin panel

The admin panel lives at http://localhost:5173/admin. It shows the same menu as the public site, plus the
admin tools: a side menu (the ☰ button next to the title) with **Catálogo**, **Relatório** and
**Configurações**, and an **Adicionar Produto** button in the header. Configurações lets an admin
change the order notification email and their password; its appearance section is a non-functional
visual preview of the current management logo and palette. The current brand colors are defined as
CSS tokens in `apps/web/src/index.css`, and the logo is served from `apps/web/public/`.
Relatório and Adicionar Produto are placeholders.

### Creating a test admin account

There is no sign-up page: admin accounts are created from the command line. With the database up
and migrated (`npm run db:up`, `npm run db:migrate`):

```bash
npm run admin:create -- admin@example.com "admin12345"
```

Then open http://localhost:5173/admin and log in with that email and password.

- Any email works; the password needs at least 8 characters.
- Running it again with an email that already exists sets a new password, which is also how to
  recover a forgotten one.
- **Use double quotes, or none.** Windows' `cmd.exe` keeps single quotes, so `'admin12345'` would
  store the quotes as part of the password. The script refuses a password that still has its quotes.
- The account is saved in the database from `DATABASE_URL` (`apps/api/.env`), your local
  development database. `npm run db:reset` deletes it, so run the command again afterwards.

### How it works

- **Login** — `POST /api/auth/login` checks the password against `admins.password_hash` (scrypt)
  and answers with an `admin_session` cookie: a signed JWT, valid for 8 hours, `httpOnly` so page
  scripts cannot read it. When the panel loads it calls `GET /api/auth/me` to find out whether
  someone is logged in; **Sair** calls `POST /api/auth/logout`.
- **Rate limit** — 5 login attempts per minute per IP. After that the API answers 429 for the rest
  of the minute.
- **What is actually protected** — the login card only covers the page; the menu behind it is
  public data anyway. Admin data is protected by the API: a controller with
  `@UseGuards(AdminGuard)` (import `AuthModule` in its module) answers 401 without a valid session.
- **Front end** — `apps/web/src/Root.tsx` picks the public site (`App.tsx`) or the admin panel
  (`AdminApp.tsx`, downloaded only on `/admin`) from the URL. Admin pages: `/admin` (catalog),
  `/admin/relatorio` and `/admin/configuracoes`.
- **Secret** — the cookie is signed with `JWT_SECRET`. It can stay empty in development (a built-in
  development secret is used) but is required in production. Changing it logs every admin out.

Things to settle before deploying (same-site cookie, reverse proxy, SPA fallback for `/admin`) are
listed in [docs/notes.md](docs/notes.md).

### Troubleshooting

| Message on the login card                         | Cause and fix                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| "E-mail ou senha incorretos."                     | Wrong email or password. Run `admin:create` again to set a new password (mind the quotes). |
| "Muitas tentativas. Aguarde um minuto…"           | Rate limit reached. Wait a minute, or restart the API (the counter is kept in memory).     |
| "Não foi possível entrar. Verifique sua conexão…" | The API is not answering. Check that `npm run dev` is running and `/api/health` responds.  |

>>>>>>> Stashed changes
## Scripts (run from the repo root)

| Script                      | What it does                                            |
| --------------------------- | ------------------------------------------------------- |
| `npm run dev`               | Runs shared, api and web in watch mode                  |
| `npm run build`             | Builds shared → api → web                               |
| `npm run typecheck`         | `tsc --noEmit` in every workspace                       |
| `npm test`                  | Unit tests (api + web), no database needed              |
| `npm run test:int`          | API integration tests against `cafe_da_fisica_test`     |
| `npm run test:e2e`          | API end-to-end tests against `cafe_da_fisica_test`      |
| `npm run lint`              | oxlint over the whole repo (warnings fail)              |
| `npm run format`            | Prettier write (`format:check` to verify)               |
| `npm run db:up` / `db:down` | Start / stop PostgreSQL                                 |
| `npm run db:migrate`        | Apply pending TypeORM migrations                        |
| `npm run db:generate -- X`  | New migration `X` from entity changes (needs the DB up) |
| `npm run db:revert`         | Undo the last migration                                 |
| `npm run db:seed`           | Runs `apps/api/src/infrastructure/database/seed.ts`     |
| `npm run db:reset`          | Drop schema + migrate + seed (dev only)                 |

Run a script in a single workspace with `-w`, e.g. `npm run test:watch -w apps/web`.

## How the pieces fit together

- **API prefix** — every route is mounted under `/api` (`API_PREFIX` in `packages/shared`).
- **Dev proxy** — the Vite dev server forwards `/api/*` to `http://localhost:3000`, so the browser never needs CORS in development. In production set `VITE_API_URL` to the deployed API.
- **Shared package** — `@cafe-da-fisica/shared` holds types and constants both apps import. It is compiled to `dist/` (automatically on `npm install`, and in watch mode during `npm run dev`). Put anything here that must stay in sync between client and server (response shapes, enums, route names).
- **Database access** — only the API touches PostgreSQL, through TypeORM (`DatabaseModule` opens the connection; feature modules inject repositories with `TypeOrmModule.forFeature`). Entities under `apps/api/src/domain/<feature>/*.entity.ts` are the schema; see [db/README.md](db/README.md) for the migration workflow.
- **Configuration** — the API validates its environment at startup (`apps/api/src/infrastructure/config/env.ts`) and refuses to boot with a bad config.

## Adding a feature (typical flow)

1. Model the data as an entity in `apps/api/src/domain/<feature>/<name>.entity.ts`, register it in `src/infrastructure/database/entities.ts`, then `npm run db:generate -- <Name>` and `npm run db:migrate`.
2. Put the shared contract (DTO/response types) in `packages/shared/src`.
3. Create a Nest module (`cd apps/api && npx nest g resource <name>`, or by hand under `apps/api/src/domain/<name>`) and register it in `app.module.ts`.
4. Add a page/component under `apps/web/src` that calls the endpoint through `src/api/client.ts`.
5. Write unit tests next to the code (`*.spec.ts` in the API, `*.test.tsx` in the web app) and, for anything that depends on the database, an integration test (`*.int-spec.ts`).

## Environment variables

| Variable            | Where           | Purpose                                            |
| ------------------- | --------------- | -------------------------------------------------- |
| `POSTGRES_*`        | `.env`          | Credentials/port for the Docker PostgreSQL         |
| `DATABASE_URL`      | `apps/api/.env` | Connection string used by TypeORM                  |
| `TEST_DATABASE_URL` | `apps/api/.env` | Database for `test:int` / `test:e2e` (Vitest only) |
| `PORT`              | `apps/api/.env` | API port (default 3000)                            |
| `CORS_ORIGIN`       | `apps/api/.env` | Allowed browser origin (default the Vite dev URL)  |
| `RESEND_API_KEY`    | `apps/api/.env` | Resend key; unset → emails are only logged         |
| `EMAIL_FROM`        | `apps/api/.env` | Sender of outgoing emails                          |
| `VITE_API_URL`      | `apps/web/.env` | API base URL for the browser (default `/api`)      |
