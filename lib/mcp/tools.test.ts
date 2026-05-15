import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { randomUUID } from 'node:crypto'

// Same mocks as the admin route tests: per-test mongodb-memory-server,
// stubbed @vercel/blob. We invoke the handlers DIRECTLY via the registry
// (no JSON-RPC envelope) and inject the test Db so each test is isolated.
vi.mock('server-only', () => ({}))
vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (pathname: string) => ({
    url:                `https://abc123.public.blob.vercel-storage.com/${pathname}`,
    pathname,
    contentType:        'image/webp',
    contentDisposition: 'inline',
  })),
  del: vi.fn(async () => {}),
}))

import sharp from 'sharp'
import { createTestDb, type TestDbHandle } from '@/db/test-utils'
import {
  ToolError,
  buildToolRegistry,
  type CreateDraftInput,
  type GetPostInput,
  type ListPostsInput,
  type PatchPostInput,
  type UploadImageInput,
} from '@/lib/mcp/tools'
import type { ImageDoc, PostDoc } from '@/db/schema'

let testHandle: TestDbHandle

beforeAll(() => {
  process.env.MCP_ADMIN_TOKEN = 'tok-' + 'x'.repeat(32)
})

beforeEach(async () => {
  testHandle = await createTestDb()
})

function registry() {
  return buildToolRegistry({ dbHandle: testHandle.db })
}

async function makeJpeg(width = 32, height = 32): Promise<Buffer> {
  return await sharp({
    create: { width, height, channels: 3, background: { r: 100, g: 100, b: 100 } },
  }).jpeg().toBuffer()
}

async function seedPost(slug: string, status: 'draft' | 'published' = 'draft'): Promise<PostDoc> {
  const now = new Date()
  const doc: PostDoc = {
    _id:                       randomUUID(),
    slug,
    title:                     slug,
    excerpt:                   null,
    status,
    content_json:              [],
    content_schema_version:    1,
    cover_image_id:            null,
    og_image_id:               null,
    tags:                      [],
    author_name:               'admin',
    author_url:                null,
    meta_title:                null,
    meta_description:          null,
    canonical_url:             null,
    geo_variants:              {},
    ai_readiness_score:        null,
    ai_readiness_band:         null,
    ai_readiness_report:       null,
    ai_readiness_content_hash: null,
    ai_readiness_checked_at:   null,
    published_at:              status === 'published' ? new Date() : null,
    created_at:                now,
    updated_at:                now,
  }
  await testHandle.db.collection<PostDoc>('posts').insertOne(doc)
  return doc
}

// ── cms_create_draft ─────────────────────────────────────────────────────────

describe('cms_create_draft', () => {
  it('creates a draft with content_json derived from markdown', async () => {
    const tool = registry().cms_create_draft
    const input: CreateDraftInput = {
      title:    'Hello MCP',
      markdown: '## Hi\n\nA paragraph here.',
    }
    const out = await tool.handler(input) as { id: string; slug: string }
    expect(out.slug).toBe('hello-mcp')

    const row = await testHandle.db.collection<PostDoc>('posts').findOne({ _id: out.id })
    expect(row?.status).toBe('draft')
    expect(row?.content_json.length).toBe(2)
    expect(row?.content_json[0].type).toBe('heading')
    expect(row?.content_json[1].type).toBe('paragraph')
  })

  it('forces status to draft even though the input has no status field', async () => {
    const tool = registry().cms_create_draft
    const out = await tool.handler({ title: 'Forced', markdown: '' }) as { id: string }
    const row = await testHandle.db.collection<PostDoc>('posts').findOne({ _id: out.id })
    expect(row?.status).toBe('draft')
    expect(row?.published_at).toBeNull()
  })

  it('SLUG_CONFLICT on duplicate slug', async () => {
    await seedPost('taken')
    const tool = registry().cms_create_draft
    await expect(async () => {
      await tool.handler({ title: 'X', slug: 'taken', markdown: '' } satisfies CreateDraftInput)
    }).rejects.toMatchObject({ appCode: 'SLUG_CONFLICT', field: 'slug' })
  })

  it('INVALID_CONTENT when markdown contains H1', async () => {
    const tool = registry().cms_create_draft
    await expect(async () => {
      await tool.handler({ title: 'X', markdown: '# nope' } satisfies CreateDraftInput)
    }).rejects.toMatchObject({ appCode: 'INVALID_CONTENT' })
  })

  it('applies the block_roles override map', async () => {
    const tool = registry().cms_create_draft
    const out = await tool.handler({
      title: 'Roled',
      markdown: 'First.\n\nSecond.',
      block_roles: { '1': 'tldr' },
    } satisfies CreateDraftInput) as { id: string }
    const row = await testHandle.db.collection<PostDoc>('posts').findOne({ _id: out.id })
    expect(row?.content_json[0].role).toBeUndefined()
    expect(row?.content_json[1].role).toBe('tldr')
  })
})

// ── cms_patch_post ───────────────────────────────────────────────────────────

describe('cms_patch_post', () => {
  it('updates title without touching other fields', async () => {
    const seed = await seedPost('mine')
    const tool = registry().cms_patch_post
    await tool.handler({ id: seed._id, fields: { title: 'Renamed' } } satisfies PatchPostInput)
    const row = await testHandle.db.collection<PostDoc>('posts').findOne({ _id: seed._id })
    expect(row?.title).toBe('Renamed')
    expect(row?.slug).toBe('mine')
  })

  it('replaces content_json wholesale when markdown is supplied', async () => {
    const seed = await seedPost('mine')
    const tool = registry().cms_patch_post
    await tool.handler({
      id: seed._id,
      fields: { markdown: '## New body' },
    } satisfies PatchPostInput)
    const row = await testHandle.db.collection<PostDoc>('posts').findOne({ _id: seed._id })
    expect(row?.content_json.length).toBe(1)
    expect(row?.content_json[0].type).toBe('heading')
  })

  it('rejects slug change on a published post (VALIDATION_FAILED)', async () => {
    const seed = await seedPost('locked', 'published')
    const tool = registry().cms_patch_post
    await expect(async () => {
      await tool.handler({
        id: seed._id,
        fields: { slug: 'new-slug' },
      } satisfies PatchPostInput)
    }).rejects.toMatchObject({ appCode: 'VALIDATION_FAILED', field: 'slug' })
  })

  it('NOT_FOUND when the id does not exist', async () => {
    const tool = registry().cms_patch_post
    await expect(async () => {
      await tool.handler({
        id: '11111111-1111-4111-a111-111111111111',
        fields: { title: 'x' },
      } satisfies PatchPostInput)
    }).rejects.toMatchObject({ appCode: 'NOT_FOUND' })
  })
})

// ── cms_upload_image ─────────────────────────────────────────────────────────

describe('cms_upload_image', () => {
  it('uploads from base64 source and returns id/blob_url/width/height', async () => {
    const jpeg = await makeJpeg(40, 20)
    const tool = registry().cms_upload_image
    const out = await tool.handler({
      source:   { base64: jpeg.toString('base64'), content_type: 'image/jpeg' },
      alt:      'green box',
      filename: 'g.jpg',
    } satisfies UploadImageInput) as { id: string; width: number; height: number; blob_url: string }
    expect(out.width).toBe(40)
    expect(out.height).toBe(20)
    expect(out.blob_url).toMatch(/\.webp$/)

    const row = await testHandle.db.collection<ImageDoc>('images').findOne({ _id: out.id })
    expect(row).toBeTruthy()
  })

  it('uploads from a data: URL source', async () => {
    const jpeg = await makeJpeg()
    const dataUrl = `data:image/jpeg;base64,${jpeg.toString('base64')}`
    const tool = registry().cms_upload_image
    const out = await tool.handler({
      source:   { url: dataUrl },
      alt:      'via data url',
      filename: 'g.jpg',
    } satisfies UploadImageInput) as { id: string }
    expect(out.id).toMatch(/^[0-9a-f-]{36}$/i)
  })

  it('UPLOAD_BAD_TYPE when bytes are not a recognised image', async () => {
    const tool = registry().cms_upload_image
    await expect(async () => {
      await tool.handler({
        source:   { base64: Buffer.from('not-an-image').toString('base64'), content_type: 'image/jpeg' },
        alt:      'x',
        filename: 'x.jpg',
      } satisfies UploadImageInput)
    }).rejects.toMatchObject({ appCode: 'UPLOAD_BAD_TYPE' })
  })

  it('UPLOAD_TOO_LARGE when payload exceeds 8 MB', async () => {
    const tool = registry().cms_upload_image
    const huge = Buffer.alloc(9 * 1024 * 1024, 0x77).toString('base64')
    await expect(async () => {
      await tool.handler({
        source:   { base64: huge, content_type: 'image/jpeg' },
        alt:      'x',
        filename: 'x.jpg',
      } satisfies UploadImageInput)
    }).rejects.toBeInstanceOf(ToolError)
  })
})

// ── cms_list_posts / cms_get_post ────────────────────────────────────────────

describe('cms_list_posts', () => {
  it('returns posts filtered by status with the total count', async () => {
    await seedPost('a-draft', 'draft')
    await seedPost('b-pub',   'published')
    await seedPost('c-draft', 'draft')
    const tool = registry().cms_list_posts

    const all   = await tool.handler({} satisfies ListPostsInput)            as { posts: unknown[]; total: number }
    const drafts = await tool.handler({ status: 'draft' } satisfies ListPostsInput) as { posts: unknown[]; total: number }
    expect(all.total).toBe(3)
    expect(drafts.total).toBe(2)
    expect(drafts.posts.length).toBe(2)
  })

  it('respects limit and offset', async () => {
    for (let i = 0; i < 5; i++) await seedPost(`p${i}`)
    const tool = registry().cms_list_posts
    const page1 = await tool.handler({ limit: 2, offset: 0 } satisfies ListPostsInput) as { posts: unknown[]; total: number }
    const page2 = await tool.handler({ limit: 2, offset: 2 } satisfies ListPostsInput) as { posts: unknown[] }
    expect(page1.total).toBe(5)
    expect(page1.posts.length).toBe(2)
    expect(page2.posts.length).toBe(2)
  })
})

describe('cms_get_post', () => {
  it('returns the full post (drafts visible)', async () => {
    const seed = await seedPost('readable', 'draft')
    const tool = registry().cms_get_post
    const out = await tool.handler({ id: seed._id } satisfies GetPostInput) as { post: { slug: string; status: string } }
    expect(out.post.slug).toBe('readable')
    expect(out.post.status).toBe('draft')
  })

  it('NOT_FOUND for an unknown id', async () => {
    const tool = registry().cms_get_post
    await expect(async () => {
      await tool.handler({ id: '11111111-1111-4111-a111-111111111111' } satisfies GetPostInput)
    }).rejects.toMatchObject({ appCode: 'NOT_FOUND' })
  })
})
