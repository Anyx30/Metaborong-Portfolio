// pg-mem-backed test bootstrap.
//
// Each call to createTestDb() spins up a fresh in-memory Postgres, applies
// db/migrations/0001_init.sql, and returns a typed Drizzle client wired to
// the in-memory DB via drizzle-orm/node-postgres. Subsequent migrations
// (0002_*.sql, …) will be picked up automatically by reading the journal.
//
// Tests use this helper directly when they need a real DB. Route-handler
// tests that import from `db/client` should `vi.mock('@/db/client', …)`
// to swap the production pg/Pool-backed client for one returned by
// createTestDb().

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { newDb, DataType, type IMemoryDb } from 'pg-mem'
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { types as pgTypes } from 'pg'
import * as schema from '@/db/schema'

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

function applyMigrations(memDb: IMemoryDb): void {
  // Read the journal so we apply migrations in the order drizzle-kit
  // expects, not whatever readdir returns.
  const journalPath = path.join(MIGRATIONS_DIR, 'meta', '_journal.json')
  const journal = JSON.parse(readFileSync(journalPath, 'utf8')) as {
    entries: Array<{ tag: string }>
  }

  for (const entry of journal.entries) {
    const sqlPath = path.join(MIGRATIONS_DIR, `${entry.tag}.sql`)
    const sql = readFileSync(sqlPath, 'utf8')
    // drizzle-kit emits "--> statement-breakpoint" between statements so
    // multi-statement migrations parse correctly under any driver.
    const statements = sql
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean)
    for (const statement of statements) {
      memDb.public.none(statement)
    }
  }
}

function registerPgFunctions(memDb: IMemoryDb): void {
  // pg-mem doesn't ship gen_random_uuid out of the box; the migration uses
  // it as a column DEFAULT, so register a Node-side implementation. impure
  // is required so pg-mem doesn't memoize and hand identical IDs to every
  // INSERT in the same query.
  memDb.public.registerFunction({
    name: 'gen_random_uuid',
    returns: DataType.uuid,
    implementation: () => randomUUID(),
    impure: true,
  })
}

export type TestDb = NodePgDatabase<typeof schema>

export interface TestDbHandle {
  db: TestDb
  memDb: IMemoryDb
}

export function createTestDb(): TestDbHandle {
  const memDb = newDb({ autoCreateForeignKeyIndices: true })
  registerPgFunctions(memDb)
  applyMigrations(memDb)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = memDb.adapters.createPg() as any

  // drizzle-orm's node-postgres adapter passes a `types` object on every
  // query config so pg can run row-level type parsers. pg-mem hard-rejects
  // any query that carries `types.getTypeParser` (it does its own internal
  // type handling). Strip that key before each query reaches pg-mem.
  // Pool and Client are the same class in pg-mem; one patch covers both.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // pg-mem returns a fresh Pool class per createPg() call, so the patch
  // below must run on every test bootstrap — there is no prototype reuse
  // to gate against.
  const proto = adapter.Pool.prototype as any
  {
    const origQuery = proto.query
    proto.query = async function patchedQuery(config: unknown, ...rest: unknown[]) {
      let cleanConfig: unknown = config
      if (config && typeof config === 'object') {
        const obj = config as Record<string, unknown>
        if ('types' in obj || 'rowMode' in obj) {
          // drizzle-on-pg passes both `types` (custom row parsers) and
          // `rowMode: 'array'` (compact rows) for performance. pg-mem
          // hard-rejects both since it does its own type handling and
          // always returns object rows. Stripping is harmless: the parsed
          // values that pg-mem returns already match Drizzle's expectations.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { types: _t, rowMode: _r, ...clean } = obj
          cleanConfig = clean
        }
      }
      const result = await origQuery.call(this, cleanConfig, ...rest)
      // Two pg-mem ↔ drizzle impedance mismatches to bridge here:
      //   1. pg-mem returns `fields: []` (no column metadata).
      //   2. pg-mem ignores rowMode='array' (we strip it above) and returns
      //      object rows like `{id: 'a', tags: [...]}`.
      // drizzle's mapResultRow uses POSITIONAL access (`row[columnIndex]`),
      // so it needs array-mode rows. Convert objects to arrays in the
      // order of the synthesized fields so drizzle's positional decoder
      // resolves correctly. Empty result sets pass through unchanged.
      if (
        result && typeof result === 'object' &&
        Array.isArray((result as { rows?: unknown[] }).rows) &&
        (result as { rows: unknown[] }).rows.length > 0 &&
        typeof (result as { rows: unknown[] }).rows[0] === 'object' &&
        (result as { rows: unknown[] }).rows[0] !== null &&
        !Array.isArray((result as { rows: unknown[] }).rows[0])
      ) {
        const r = result as {
          rows: Array<Record<string, unknown>>
          rowCount: number
          command: string
        }
        const columnNames = Object.keys(r.rows[0])
        const fields = columnNames.map((name) => ({ name, dataTypeID: 0 }))
        const arrayRows = r.rows.map((row) => columnNames.map((name) => row[name]))
        // pg-mem's `fields` is a getter-only property on the original
        // object; return a shallow-copied result so we can override safely.
        return { ...r, rows: arrayRows, fields }
      }
      return result
    }
  }
  void pgTypes // keep the import live for callers that want a real parser

  const pool = new adapter.Pool()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = drizzle(pool as any, { schema, casing: 'snake_case' }) as TestDb
  return { db, memDb }
}

/** Used by route tests that mock '@/db/client'. */
export function exposeAsClientModule(handle: TestDbHandle): { db: TestDb; schema: typeof schema } {
  return { db: handle.db, schema }
}

/**
 * List of migration tags currently applied — handy for assertions that pin
 * the migration set so a missing migration breaks tests early.
 */
export function listMigrationTags(): string[] {
  const journalPath = path.join(MIGRATIONS_DIR, 'meta', '_journal.json')
  const journal = JSON.parse(readFileSync(journalPath, 'utf8')) as {
    entries: Array<{ tag: string }>
  }
  return journal.entries.map((e) => e.tag)
}

