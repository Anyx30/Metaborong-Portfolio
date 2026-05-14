# Database — operator notes

The CMS data layer is MongoDB (native `mongodb` driver, no ORM). Document
shapes are defined in TypeScript in `db/schema.ts`; index specs live in
`db/collections.ts` and are applied lazily on first connection (per
process) via `ensureIndexes()`.

## Connection string

`MONGODB_URI` is the single env var the data layer reads. Format depends
on the provider:

- DigitalOcean Managed MongoDB (standard URI):
  `mongodb://USER:PASS@HOST:PORT/metaborong?tls=true&authSource=admin`
- MongoDB Atlas (SRV URI):
  `mongodb+srv://USER:PASS@CLUSTER.mongodb.net/metaborong?retryWrites=true&w=majority`

The database name is parsed from the path segment of the URI. If the
path is empty the driver falls back to the `metaborong` database.

> ⚠️ **Escape every `$` in the URI as `\$` inside `.env.local`.** Next.js's
> dotenv-expand will substitute `$tokens` with empty strings otherwise —
> the same trap that bit M1 with `ADMIN_PASSWORD_HASH` and M4 with
> `BLOB_READ_WRITE_TOKEN`. Mongo passwords commonly contain `$`.

## Bootstrapping a fresh database

There is no migration tool. The four collections (`posts`, `images`,
`login_attempts`, `ai_readiness_attempts`) are created automatically on
first insert. Indexes are created on first `getDb()` call per process
(idempotent — Mongo treats redundant `createIndex` calls as no-ops).

To pre-create indexes ahead of the first request (warm-deploy scenarios):

```sh
# Connect with mongosh and trigger ensureIndexes from a one-shot script
MONGODB_URI=mongodb://… node -e "
  import('./db/client.ts').then(({ getDb }) => {
    getDb()
    setTimeout(() => process.exit(0), 2000)
  })
"
```

In practice this is unnecessary — the first cold request will create
them automatically.

## Indexes

Defined in `db/collections.ts`:

| Collection | Index | Notes |
|------------|-------|-------|
| `posts` | `{ slug: 1 }` unique | Slug uniqueness; UNIQUE replaces the Postgres unique-index |
| `posts` | `{ status: 1, published_at: -1 }` | Public list ordering |
| `posts` | `{ tags: 1 }` | Multikey for tag filtering |
| `images` | `{ created_at: -1, _id: -1 }` | Keyset pagination |
| `login_attempts` | `{ ip: 1, attempted_at: -1 }` | Rate-limit count |
| `login_attempts` | `{ attempted_at: 1 }` TTL 3600s | Auto-prune ≥1h-old |
| `ai_readiness_attempts` | `{ admin_email: 1, attempted_at: -1 }` | Per-admin rate-limit count |
| `ai_readiness_attempts` | `{ attempted_at: 1 }` TTL 7200s | Auto-prune ≥2h-old |

The two TTL indexes replace the periodic-prune task the Postgres design
had deferred to M8 — Mongo's TTL monitor sweeps expired rows
automatically.

## `_id` convention

All four collections use a **string UUID v4** as `_id`. This is set
explicitly by the route handlers on every insert; we never let Mongo
generate an ObjectId. Reasons:

- Preserves all existing fixtures, test data, and external API responses.
- Preserves the route-level `UUID_RE` regex guards (e.g. the
  `[id]/ai-readiness` route).
- The row→wire mappers (`rowToPost`, `rowToImage`) emit the `_id` value
  as the wire field `id` so external API consumers see no change from
  the Postgres era.

## Test database

`db/test-utils.ts` boots ONE `mongodb-memory-server` instance per Vitest
worker (lazily, on first `createTestDb()` call) and hands out a fresh
isolated Db on a unique random database name per test. The first boot
downloads the MongoDB binary (~70 MB) into the OS cache; subsequent
boots are sub-second. No external MongoDB needed for `pnpm test`.

## Operational notes

- **Connection pooling**: The `MongoClient` is cached on `globalThis` for
  HMR survival in dev and to avoid cold-start reconnect overhead in
  serverless. The driver manages a connection pool internally.
- **No transactions**: All current writes are document-level atomic.
  The two rate-limit windows (login, AI readiness) use count-then-insert
  without a transaction — the cap is advisory and burning one extra call
  past the limit isn't a real failure. Mirrors the same trade-off the
  Postgres design made.
- **Schema validation**: Done by Zod at the API boundary
  (`lib/blog-schema.ts`). We do NOT also attach a MongoDB JSON-Schema
  validator to the collections to avoid drift between two sources of
  truth.
