// One typed MongoClient for the whole app.
//
// The native `mongodb` driver speaks the standard MongoDB wire protocol,
// so the same connection string works for local dev, DigitalOcean
// Managed MongoDB, MongoDB Atlas, etc. Route handlers run in Node
// runtime (`runtime = 'nodejs'`) so the BSON driver is fine — no edge.
//
// MongoClient pools connections internally; the global-singleton trick
// reuses the same client across HMR rebuilds in dev and across module
// re-evaluations during serverless cold starts. Indexes are created
// lazily on first getDb() call per process (idempotent — Mongo treats
// redundant createIndex calls as no-ops).

import { MongoClient, type Db, type Collection } from 'mongodb'
import { ensureIndexes } from './collections'
import type {
  PostDoc,
  ImageDoc,
  LoginAttemptDoc,
  AiReadinessAttemptDoc,
} from './schema'

declare global {
  var __mb_mongo_client: MongoClient | undefined
  var __mb_mongo_db: Db | undefined
  var __mb_mongo_indexes_promise: Promise<void> | undefined
}

function dbNameFromUri(uri: string): string {
  // mongodb://user:pass@host:port/dbname?opts or mongodb+srv://.../dbname?opts
  // Strip query, find the path segment after the host.
  try {
    const noQuery = uri.split('?')[0]
    const afterScheme = noQuery.replace(/^mongodb(\+srv)?:\/\//, '')
    const slash = afterScheme.indexOf('/')
    if (slash === -1) return 'metaborong'
    const name = afterScheme.slice(slash + 1)
    return name || 'metaborong'
  } catch {
    return 'metaborong'
  }
}

function buildClient(): { client: MongoClient; db: Db } {
  const uri = process.env.MONGODB_URI
  if (!uri || !uri.trim()) {
    throw new Error('MONGODB_URI is not configured')
  }
  const client = new MongoClient(uri)
  const db = client.db(dbNameFromUri(uri))
  return { client, db }
}

/**
 * Returns the shared Db handle for this process. The first call kicks
 * off ensureIndexes() as a fire-and-forget promise; subsequent calls
 * reuse the same promise so two concurrent first-callers don't both
 * race index creation.
 */
export function getDb(): Db {
  if (!globalThis.__mb_mongo_db) {
    const { client, db } = buildClient()
    globalThis.__mb_mongo_client = client
    globalThis.__mb_mongo_db = db
  }
  if (!globalThis.__mb_mongo_indexes_promise) {
    globalThis.__mb_mongo_indexes_promise = ensureIndexes(globalThis.__mb_mongo_db!).catch((err) => {
      // Reset on failure so a later request can retry; log for ops.
      globalThis.__mb_mongo_indexes_promise = undefined
      console.error('[db] ensureIndexes failed:', err)
    })
  }
  return globalThis.__mb_mongo_db!
}

// ── typed collection helpers ─────────────────────────────────────────────────

export function postsColl(db: Db = getDb()): Collection<PostDoc> {
  return db.collection<PostDoc>('posts')
}

export function imagesColl(db: Db = getDb()): Collection<ImageDoc> {
  return db.collection<ImageDoc>('images')
}

export function loginAttemptsColl(db: Db = getDb()): Collection<LoginAttemptDoc> {
  return db.collection<LoginAttemptDoc>('login_attempts')
}

export function aiReadinessAttemptsColl(db: Db = getDb()): Collection<AiReadinessAttemptDoc> {
  return db.collection<AiReadinessAttemptDoc>('ai_readiness_attempts')
}

/**
 * Proxy that defers to getDb() on every property access. Route handlers
 * and lib helpers `import { db } from '@/db/client'` and use the proxy;
 * each test re-mocks `@/db/client` to substitute its own Db handle. The
 * proxy lets us preserve that test seam without changing every callsite.
 */
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const real = getDb()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (real as any)[prop]
    if (typeof value === 'function') return value.bind(real)
    return Reflect.get(real, prop, receiver)
  },
}) as Db

export type { Db }
