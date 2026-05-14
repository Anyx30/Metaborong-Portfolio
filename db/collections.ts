// Index specs for the four CMS collections, applied lazily on first
// getDb() call per process. `createIndex` is idempotent in MongoDB, so
// calling this on every cold start is a no-op once the indexes exist.
//
// The two TTL indexes (login_attempts, ai_readiness_attempts) replace the
// "periodic prune" task the Postgres design left for M8 — Mongo's TTL
// monitor sweeps expired rows automatically, so neither rate-limit table
// grows unbounded.

import type { Db } from 'mongodb'

export async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    // posts
    db.collection('posts').createIndex({ slug: 1 }, { unique: true, name: 'posts_slug_unique' }),
    db.collection('posts').createIndex({ status: 1, published_at: -1 }, { name: 'posts_status_published_at' }),
    db.collection('posts').createIndex({ tags: 1 }, { name: 'posts_tags' }),

    // images — keyset pagination is (created_at DESC, _id DESC). Mongo
    // can serve it from the compound index below.
    db.collection('images').createIndex({ created_at: -1, _id: -1 }, { name: 'images_created_at_id' }),

    // login_attempts — IP + recency for the rate-limit query, plus a
    // TTL so rows older than 1h are auto-pruned.
    db.collection('login_attempts').createIndex({ ip: 1, attempted_at: -1 }, { name: 'login_attempts_ip_attempted_at' }),
    db.collection('login_attempts').createIndex(
      { attempted_at: 1 },
      { name: 'login_attempts_ttl', expireAfterSeconds: 3600 },
    ),

    // ai_readiness_attempts — same shape as login_attempts but bucketed
    // per-admin, with a 2h TTL (the per-admin window is 1h; 2h gives the
    // sweep a one-hour grace buffer).
    db.collection('ai_readiness_attempts').createIndex(
      { admin_email: 1, attempted_at: -1 },
      { name: 'ai_readiness_attempts_admin_attempted_at' },
    ),
    db.collection('ai_readiness_attempts').createIndex(
      { attempted_at: 1 },
      { name: 'ai_readiness_attempts_ttl', expireAfterSeconds: 7200 },
    ),
  ])
}
