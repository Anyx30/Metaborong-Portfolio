import type { Config } from 'drizzle-kit'

// drizzle-kit reads .env automatically when it's invoked from the project root.
// `pnpm db:generate` does not require POSTGRES_URL (the SQL diff is computed
// from db/schema.ts vs ./db/migrations/), but `pnpm db:migrate` does — so a
// placeholder is fine for `generate` and operators will set POSTGRES_URL in
// .env.local before running `migrate`.
const url = process.env.POSTGRES_URL ?? 'postgres://placeholder@localhost:5432/placeholder'

export default {
  schema:        './db/schema.ts',
  out:           './db/migrations',
  dialect:       'postgresql',
  casing:        'snake_case',
  dbCredentials: { url },
  // Print SQL on generate, not on migrate; keeps `pnpm db:generate` self-explanatory.
  verbose:       true,
  strict:        true,
} satisfies Config
