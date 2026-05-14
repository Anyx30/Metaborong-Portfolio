// mongodb-memory-server-backed test bootstrap.
//
// Boot ONE mongodb-memory-server per Vitest worker (lazily on first
// createTestDb() call), then hand out a fresh isolated Db per call by
// picking a unique random database name on the shared server.
// Memory-server's first boot downloads the binary (~70 MB) and takes
// ~5–10s; cached subsequent boots are sub-second.
//
// Tests use the handle directly when they need a real Db. Route-handler
// tests that import from `db/client` should `vi.mock('@/db/client', …)` to
// swap the production client for the test handle. The dbHandle injection
// pattern that lib/posts.ts / lib/images.ts expose (the optional second
// arg defaulting to the production db) is the canonical test seam from M1.

import { randomUUID } from 'node:crypto'
import { MongoClient, type Db } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { ensureIndexes } from './collections'

let serverPromise: Promise<MongoMemoryServer> | null = null
let clientPromise: Promise<MongoClient> | null = null

async function getSharedClient(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = (async () => {
      if (!serverPromise) serverPromise = MongoMemoryServer.create()
      const server = await serverPromise
      const c = new MongoClient(server.getUri())
      await c.connect()
      return c
    })()
  }
  return clientPromise
}

export interface TestDbHandle {
  db:     Db
  client: MongoClient
  dbName: string
}

/**
 * Returns a fresh, isolated Db backed by a unique random database name
 * on the shared in-memory server. ensureIndexes() runs once per Db so
 * unique-constraint and TTL behaviour matches production.
 */
export async function createTestDb(): Promise<TestDbHandle> {
  const client = await getSharedClient()
  const dbName = `mb_test_${randomUUID().replace(/-/g, '')}`
  const db = client.db(dbName)
  await ensureIndexes(db)
  return { db, client, dbName }
}

/**
 * Tear-down for use in afterAll, when a test file wants to be a
 * good citizen and stop the in-memory server before the worker exits.
 * Optional — Vitest's worker-exit cleanup handles it either way.
 */
export async function stopTestServer(): Promise<void> {
  if (clientPromise) {
    const c = await clientPromise
    await c.close()
    clientPromise = null
  }
  if (serverPromise) {
    const s = await serverPromise
    await s.stop()
    serverPromise = null
  }
}
