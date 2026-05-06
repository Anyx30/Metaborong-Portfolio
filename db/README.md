# Database — operator notes

The CMS schema is owned by `db/schema.ts` (Drizzle table definitions);
SQL migrations are checked into `db/migrations/`.

## Applying migrations

The repo ships with a `pnpm db:migrate` script that runs `drizzle-kit migrate`,
**but on this project that command is a known no-op** — it succeeds without
applying any SQL to the target database. The cause traces to a packaging
quirk in `drizzle-kit` against the version of `@vercel/postgres` we use;
debugging it has been deferred past v1 launch.

**Workaround for v1.** Apply migrations directly with `psql`:

```sh
# Local dev (the example uses the docker-pg setup the M1 BE handoff documents)
psql -h localhost -p 5433 -U postgres -d postgres < db/migrations/0001_init.sql

# Vercel Postgres (production / preview)
psql "$POSTGRES_URL" < db/migrations/0001_init.sql
```

`POSTGRES_URL` is the same connection string the runtime uses; copy it
from the Vercel project settings or your local `.env.local`.

## Generating new migrations

`pnpm db:generate` (which calls `drizzle-kit generate`) does work — it
emits a new `db/migrations/NNNN_*.sql` file from the diff between
`db/schema.ts` and the recorded snapshot under `db/migrations/meta/`.

After generating: review the SQL by hand, commit, and apply with the
`psql` recipe above. Do **not** rely on `pnpm db:migrate` to ship the
new file.

## Test database

`db/test-utils.ts` spins up a fresh in-memory `pg-mem` instance per
Vitest test (M1 BE handoff §9.6). It applies the same `0001_init.sql`
file at startup, so route tests run against the same schema as
production. No external Postgres needed for `pnpm test`.
