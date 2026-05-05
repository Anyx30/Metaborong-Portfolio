import {
  pgTable,
  uuid,
  text,
  jsonb,
  smallint,
  real,
  integer,
  timestamp,
  index,
  uniqueIndex,
  check,
  AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import type { Block, GeoVariants, AiReadinessSuggestion } from '../lib/blog-schema'

// ── images ────────────────────────────────────────────────────────────────────
// Independent reusable assets. Posts reference image rows by id; deleting a post
// MUST NOT cascade-delete image rows.

export const images = pgTable('images', {
  id:         uuid('id').primaryKey().defaultRandom(),
  blob_url:   text('blob_url').notNull(),
  width:      integer('width').notNull(),
  height:     integer('height').notNull(),
  alt:        text('alt').notNull().default(''),
  focal_x:    real('focal_x').notNull().default(0.5),
  focal_y:    real('focal_y').notNull().default(0.5),
  filename:   text('filename').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── posts ─────────────────────────────────────────────────────────────────────
// Forward-complete per PRD §6.1. M1 only exercises the auth/login flows; the
// content/AI-readiness/geo-variants columns are pre-provisioned so M2/M6/M7 do
// not need additional migrations.

export const posts = pgTable(
  'posts',
  {
    id:                       uuid('id').primaryKey().defaultRandom(),
    slug:                     text('slug').notNull(),
    title:                    text('title').notNull(),
    excerpt:                  text('excerpt'),
    status:                   text('status').notNull().default('draft'),
    content_json:             jsonb('content_json').$type<Block[]>().notNull().default(sql`'[]'::jsonb`),
    content_schema_version:   smallint('content_schema_version').notNull().default(1),
    cover_image_id:           uuid('cover_image_id').references((): AnyPgColumn => images.id, { onDelete: 'set null' }),
    og_image_id:              uuid('og_image_id').references((): AnyPgColumn => images.id, { onDelete: 'set null' }),
    tags:                     text('tags').array().notNull().default(sql`'{}'::text[]`),
    author_name:              text('author_name').notNull(),
    author_url:               text('author_url'),
    meta_title:               text('meta_title'),
    meta_description:         text('meta_description'),
    canonical_url:            text('canonical_url'),
    geo_variants:             jsonb('geo_variants').$type<GeoVariants>().notNull().default(sql`'{}'::jsonb`),
    ai_readiness_score:       smallint('ai_readiness_score'),
    ai_readiness_band:        text('ai_readiness_band'),
    ai_readiness_report:      jsonb('ai_readiness_report').$type<{ suggestions: AiReadinessSuggestion[] }>(),
    ai_readiness_content_hash: text('ai_readiness_content_hash'),
    ai_readiness_checked_at:  timestamp('ai_readiness_checked_at', { withTimezone: true }),
    published_at:             timestamp('published_at', { withTimezone: true }),
    created_at:               timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at:               timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('posts_slug_unique_idx').on(t.slug),
    index('posts_status_published_at_idx').on(t.status, t.published_at.desc()),
    index('posts_tags_gin_idx').using('gin', t.tags),
    check('posts_status_check', sql`${t.status} IN ('draft','published')`),
  ]
)

// ── login_attempts ────────────────────────────────────────────────────────────
// Postgres-backed rate-limit counter. Pattern is reused for AI-readiness
// per-admin counter in M7.

export const login_attempts = pgTable(
  'login_attempts',
  {
    id:           uuid('id').primaryKey().defaultRandom(),
    ip:           text('ip').notNull(),
    attempted_at: timestamp('attempted_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('login_attempts_ip_attempted_at_idx').on(t.ip, t.attempted_at.desc()),
  ]
)

export type PostRow      = typeof posts.$inferSelect
export type PostInsert   = typeof posts.$inferInsert
export type ImageRow     = typeof images.$inferSelect
export type ImageInsert  = typeof images.$inferInsert
