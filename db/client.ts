import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

// One typed Drizzle client for the whole app.
//
// The pg driver speaks the standard Postgres TCP protocol, so the same
// connection string works for both local Docker postgres and managed
// providers (Neon / Vercel Postgres / Supabase / RDS / etc.) when the
// API route handlers run in Node runtime — and the M1 BE handlers
// explicitly set `runtime = 'nodejs'`. The deprecated `@vercel/postgres`
// package was only needed for edge runtime, which we don't target.
//
// Pool keeps connections alive across requests; the global singleton
// trick reuses the same Pool across HMR rebuilds in dev and across
// module re-evaluations during serverless cold starts.

declare global {
  // eslint-disable-next-line no-var
  var __mb_pg_pool: Pool | undefined
  // eslint-disable-next-line no-var
  var __mb_drizzle_db:
    | ReturnType<typeof drizzle<typeof schema>>
    | undefined
}

const pool =
  globalThis.__mb_pg_pool ??
  new Pool({ connectionString: process.env.POSTGRES_URL })

export const db =
  globalThis.__mb_drizzle_db ??
  drizzle(pool, { schema, casing: 'snake_case' })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__mb_pg_pool = pool
  globalThis.__mb_drizzle_db = db
}

export { schema }
export type DB = typeof db
