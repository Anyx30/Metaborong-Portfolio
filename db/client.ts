import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import * as schema from './schema'

// One typed Drizzle client for the whole app. @vercel/postgres pools internally;
// in serverless functions a per-request connection is fine — it short-lives with
// the invocation. Locally `pnpm dev` reuses the singleton across HMR rebuilds.

declare global {
  // eslint-disable-next-line no-var
  var __mb_drizzle_db: ReturnType<typeof drizzle<typeof schema>> | undefined
}

export const db =
  globalThis.__mb_drizzle_db ?? drizzle(sql, { schema, casing: 'snake_case' })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__mb_drizzle_db = db
}

export { schema }
export type DB = typeof db
