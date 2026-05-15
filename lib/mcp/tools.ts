// Tool registry for the Claude MCP server.
//
// Each tool registers a name, a Zod input schema, an optional output
// JSON-Schema (for tools/list documentation only — we do NOT validate
// output), and a handler. The route layer (app/api/mcp/route.ts) gates
// on bearer auth + JSON-RPC envelope parsing; from here on we trust the
// input is structurally well-formed and validate the application-level
// shape with the tool's own Zod schema.

import 'server-only'
import { z } from 'zod'
import type { Db } from 'mongodb'
import {
  contentJsonSchema,
  semanticRoleSchema,
  slugRegex,
  tagRegex,
  type Post,
  type PostSummary,
  type SemanticRole,
} from '../blog-schema'
import {
  createPost,
  getDraftPostById,
  listAllPostsForAdmin,
  updatePost,
  type UpdatePostFields,
} from '../posts'
import {
  createImageFromBytes,
  type CreateImageInput,
} from '../images'
import { markdownToBlocks } from '../markdown/markdown-to-blocks'
import {
  APP_BLOB_UPLOAD_FAILED,
  APP_INTERNAL,
  APP_INVALID_CONTENT,
  APP_NOT_FOUND,
  APP_SLUG_CONFLICT,
  APP_UPLOAD_BAD_TYPE,
  APP_UPLOAD_TOO_LARGE,
  APP_VALIDATION_FAILED,
  type ToolDescriptor,
  type ToolListEntry,
} from './types'

// ── domain error class ───────────────────────────────────────────────────────
//
// Tools throw ToolError to signal an application-level failure. The route
// layer catches and maps to a JSON-RPC error envelope, preserving the
// machine-readable CMS error code in error.data.code.

export class ToolError extends Error {
  readonly code:    number
  /** Machine-readable CMS error code (mirrors lib/api error envelopes). */
  readonly appCode: string
  readonly field?: string

  constructor(code: number, appCode: string, message: string, field?: string) {
    super(message)
    this.name    = 'ToolError'
    this.code    = code
    this.appCode = appCode
    if (field !== undefined) this.field = field
  }
}

// ── shared helpers ───────────────────────────────────────────────────────────

const DEFAULT_AUTHOR_NAME = 'Metaborong Editorial'

const blockRolesMap = z.record(
  z.string().regex(/^\d+$/, 'block_roles keys must be zero-based integer indices'),
  semanticRoleSchema,
)

function normaliseBlockRoles(
  input: Record<string, SemanticRole> | undefined,
): Record<number, SemanticRole> | undefined {
  if (!input) return undefined
  const out: Record<number, SemanticRole> = {}
  for (const [k, v] of Object.entries(input)) {
    out[Number(k)] = v
  }
  return out
}

// ── 5.1 cms_create_draft ─────────────────────────────────────────────────────

const createDraftInputSchema = z.object({
  title:            z.string().trim().min(1).max(200),
  slug:             z.string().regex(slugRegex).min(1).max(80).optional(),
  markdown:         z.string(),
  excerpt:          z.string().max(500).optional(),
  tags:             z.array(z.string().regex(tagRegex).max(40)).max(10).optional(),
  author_name:      z.string().min(1).max(120).optional(),
  author_url:       z.string().url().optional(),
  meta_title:       z.string().max(200).optional(),
  meta_description: z.string().max(160).optional(),
  cover_image_id:   z.string().uuid().optional(),
  og_image_id:      z.string().uuid().optional(),
  block_roles:      blockRolesMap.optional(),
}).strict()

export type CreateDraftInput = z.infer<typeof createDraftInputSchema>
export interface CreateDraftOutput {
  id:   string
  slug: string
}

async function createDraftHandler(
  input: CreateDraftInput,
  dbHandle?: Db,
): Promise<CreateDraftOutput> {
  const conv = markdownToBlocks(input.markdown, {
    blockRoles: normaliseBlockRoles(input.block_roles),
  })
  if (!conv.ok) {
    throw new ToolError(APP_INVALID_CONTENT, conv.code, conv.message, conv.field)
  }

  // Defensive: re-validate against the wire schema. The walker is
  // typed to produce well-formed blocks, but the contract lives in
  // lib/blog-schema.ts and we don't want a future bug in the walker
  // to slip past unnoticed.
  const parsedContent = contentJsonSchema.safeParse(conv.blocks)
  if (!parsedContent.success) {
    const issue = parsedContent.error.issues[0]
    throw new ToolError(
      APP_VALIDATION_FAILED,
      'VALIDATION_FAILED',
      issue?.message ?? 'invalid content_json',
      issue?.path?.join('.'),
    )
  }

  const result = await createPost(
    {
      title:            input.title,
      slug:             input.slug ?? null,
      excerpt:          input.excerpt ?? null,
      content_json:     parsedContent.data,
      tags:             input.tags,
      author_name:      input.author_name ?? DEFAULT_AUTHOR_NAME,
      author_url:       input.author_url ?? null,
      meta_title:       input.meta_title ?? null,
      meta_description: input.meta_description ?? null,
      cover_image_id:   input.cover_image_id ?? null,
      og_image_id:      input.og_image_id ?? null,
    },
    dbHandle,
  )

  if (!result.ok) {
    switch (result.code) {
      case 'SLUG_CONFLICT':
        throw new ToolError(APP_SLUG_CONFLICT, result.code, result.message, result.field)
      case 'VALIDATION_FAILED':
        throw new ToolError(APP_VALIDATION_FAILED, result.code, result.message, result.field)
      case 'INTERNAL':
        throw new ToolError(APP_INTERNAL, result.code, result.message)
    }
  }
  return { id: result.post.id, slug: result.post.slug }
}

// ── 5.2 cms_patch_post ───────────────────────────────────────────────────────

const patchPostInputSchema = z.object({
  id:     z.string().uuid(),
  fields: z.object({
    title:            z.string().trim().min(1).max(200).optional(),
    slug:             z.string().regex(slugRegex).min(1).max(80).optional(),
    excerpt:          z.string().max(500).nullable().optional(),
    markdown:         z.string().optional(),
    tags:             z.array(z.string().regex(tagRegex).max(40)).max(10).optional(),
    author_name:      z.string().min(1).max(120).optional(),
    author_url:       z.string().url().nullable().optional(),
    meta_title:       z.string().max(200).nullable().optional(),
    meta_description: z.string().max(160).nullable().optional(),
    cover_image_id:   z.string().uuid().nullable().optional(),
    og_image_id:      z.string().uuid().nullable().optional(),
    block_roles:      blockRolesMap.optional(),
  }).strict(),
}).strict()

export type PatchPostInput = z.infer<typeof patchPostInputSchema>
export interface PatchPostOutput {
  id: string
}

async function patchPostHandler(
  input: PatchPostInput,
  dbHandle?: Db,
): Promise<PatchPostOutput> {
  const fields: UpdatePostFields = {}

  // Direct passthrough — only set when the caller supplied it so we
  // never accidentally null-out something the caller didn't touch.
  const direct = [
    'title', 'slug', 'excerpt', 'tags', 'author_name', 'author_url',
    'meta_title', 'meta_description', 'cover_image_id', 'og_image_id',
  ] as const
  for (const k of direct) {
    if (input.fields[k] !== undefined) {
      (fields as Record<string, unknown>)[k] = input.fields[k]
    }
  }

  // markdown → content_json conversion. We re-run the converter from
  // scratch — partial-block diffs are too risky for v1 (a malformed
  // diff could corrupt the post irrecoverably).
  if (input.fields.markdown !== undefined) {
    const conv = markdownToBlocks(input.fields.markdown, {
      blockRoles: normaliseBlockRoles(input.fields.block_roles),
    })
    if (!conv.ok) {
      throw new ToolError(APP_INVALID_CONTENT, conv.code, conv.message, conv.field)
    }
    const parsedContent = contentJsonSchema.safeParse(conv.blocks)
    if (!parsedContent.success) {
      const issue = parsedContent.error.issues[0]
      throw new ToolError(
        APP_VALIDATION_FAILED,
        'VALIDATION_FAILED',
        issue?.message ?? 'invalid content_json',
        issue?.path?.join('.'),
      )
    }
    fields.content_json = parsedContent.data
  }

  const result = await updatePost(input.id, fields, dbHandle)
  if (!result.ok) {
    switch (result.code) {
      case 'NOT_FOUND':
        throw new ToolError(APP_NOT_FOUND, result.code, result.message)
      case 'VALIDATION_FAILED':
        throw new ToolError(APP_VALIDATION_FAILED, result.code, result.message, result.field)
      case 'SLUG_CONFLICT':
        throw new ToolError(APP_SLUG_CONFLICT, result.code, result.message, result.field)
      case 'INTERNAL':
        throw new ToolError(APP_INTERNAL, result.code, result.message)
    }
  }
  return { id: result.post.id }
}

// ── 5.3 cms_upload_image ─────────────────────────────────────────────────────

const DATA_URL_RE = /^data:([a-z]+\/[a-z0-9+.-]+);base64,([A-Za-z0-9+/=]+)\s*$/i
const FETCH_TIMEOUT_MS = 10_000
const FETCH_MAX_BYTES  = 8 * 1024 * 1024

const uploadImageInputSchema = z.object({
  source: z.union([
    z.object({ url: z.string().url() }).strict(),
    z.object({
      base64:       z.string().min(1),
      content_type: z.string().min(1),
    }).strict(),
  ]),
  alt:      z.string().min(1).max(500),
  filename: z.string().min(1).max(200),
  focal_x:  z.number().min(0).max(1).optional(),
  focal_y:  z.number().min(0).max(1).optional(),
}).strict()

export type UploadImageInput = z.infer<typeof uploadImageInputSchema>
export interface UploadImageOutput {
  id:       string
  blob_url: string
  width:    number
  height:   number
}

async function uploadImageHandler(
  input: UploadImageInput,
  dbHandle?: Db,
): Promise<UploadImageOutput> {
  let buffer: Buffer

  if ('base64' in input.source) {
    try {
      buffer = Buffer.from(input.source.base64, 'base64')
    } catch {
      throw new ToolError(APP_VALIDATION_FAILED, 'VALIDATION_FAILED', 'malformed base64 payload', 'source.base64')
    }
    if (buffer.length === 0) {
      throw new ToolError(APP_VALIDATION_FAILED, 'VALIDATION_FAILED', 'decoded payload is empty', 'source.base64')
    }
  } else {
    buffer = await fetchImageBytes(input.source.url)
  }

  const helperInput: CreateImageInput = {
    buffer,
    alt:      input.alt,
    filename: input.filename,
    focal_x:  input.focal_x,
    focal_y:  input.focal_y,
  }

  const result = await createImageFromBytes(helperInput, dbHandle)
  if (!result.ok) {
    switch (result.code) {
      case 'UPLOAD_TOO_LARGE':
        throw new ToolError(APP_UPLOAD_TOO_LARGE, result.code, result.message)
      case 'UPLOAD_BAD_TYPE':
        throw new ToolError(APP_UPLOAD_BAD_TYPE, result.code, result.message)
      case 'BLOB_UPLOAD_FAILED':
        throw new ToolError(APP_BLOB_UPLOAD_FAILED, 'INTERNAL', result.message)
      case 'DB_INSERT_FAILED':
        throw new ToolError(APP_INTERNAL, 'INTERNAL', result.message)
    }
  }

  return {
    id:       result.image.id,
    blob_url: result.image.blob_url,
    width:    result.image.width,
    height:   result.image.height,
  }
}

/**
 * Fetch an image by URL with a 10s timeout and an 8 MB cap. data: URLs
 * are decoded inline so callers don't need to construct an HTTP fetch
 * for embedded base64. Plain http(s):// goes through fetch().
 */
async function fetchImageBytes(url: string): Promise<Buffer> {
  const dataMatch = url.match(DATA_URL_RE)
  if (dataMatch) {
    let bytes: Buffer
    try {
      bytes = Buffer.from(dataMatch[2], 'base64')
    } catch {
      throw new ToolError(APP_VALIDATION_FAILED, 'VALIDATION_FAILED', 'malformed data: URL payload', 'source.url')
    }
    if (bytes.length === 0) {
      throw new ToolError(APP_VALIDATION_FAILED, 'VALIDATION_FAILED', 'data: URL decoded to empty bytes', 'source.url')
    }
    if (bytes.length > FETCH_MAX_BYTES) {
      throw new ToolError(APP_UPLOAD_TOO_LARGE, 'UPLOAD_TOO_LARGE', 'data: URL exceeds 8MB limit', 'source.url')
    }
    return bytes
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(url, { signal: controller.signal })
  } catch (err) {
    clearTimeout(timer)
    const isAbort = err instanceof Error && err.name === 'AbortError'
    throw new ToolError(
      APP_INTERNAL,
      'INTERNAL',
      isAbort ? 'image fetch timed out' : 'image fetch failed',
      'source.url',
    )
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) {
    throw new ToolError(
      APP_INTERNAL,
      'INTERNAL',
      `image fetch returned ${res.status}`,
      'source.url',
    )
  }
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType && !contentType.toLowerCase().startsWith('image/')) {
    throw new ToolError(
      APP_UPLOAD_BAD_TYPE,
      'UPLOAD_BAD_TYPE',
      `unexpected content-type ${contentType}`,
      'source.url',
    )
  }
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length > FETCH_MAX_BYTES) {
    throw new ToolError(APP_UPLOAD_TOO_LARGE, 'UPLOAD_TOO_LARGE', 'fetched image exceeds 8MB limit', 'source.url')
  }
  return buf
}

// ── 5.4 cms_list_posts ───────────────────────────────────────────────────────

const listPostsInputSchema = z.object({
  status: z.enum(['draft', 'published']).optional(),
  limit:  z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
}).strict()

export type ListPostsInput = z.infer<typeof listPostsInputSchema>
export interface ListPostsOutput {
  posts: Array<{
    id:         string
    slug:       string
    title:      string
    status:     'draft' | 'published'
    updated_at: string
    tags:       string[]
  }>
  total: number
}

async function listPostsHandler(input: ListPostsInput, dbHandle?: Db): Promise<ListPostsOutput> {
  const limit  = input.limit  ?? 20
  const offset = input.offset ?? 0
  // listAllPostsForAdmin returns the full set ordered by updated_at DESC.
  // For v1 the dashboard does the same and the catalog is small enough
  // (low hundreds) that fetching all + slicing is cheaper than paging
  // with a cursor — switch to a real Mongo-side paginated query if/when
  // the post count grows past ~10k.
  const all = await listAllPostsForAdmin(input.status ?? 'all', dbHandle)
  const slice = all.slice(offset, offset + limit)
  return {
    posts: slice.map(toListEntry),
    total: all.length,
  }
}

function toListEntry(p: PostSummary): ListPostsOutput['posts'][number] {
  return {
    id:         p.id,
    slug:       p.slug,
    title:      p.title,
    status:     p.status,
    updated_at: p.updated_at,
    tags:       p.tags,
  }
}

// ── 5.5 cms_get_post ─────────────────────────────────────────────────────────

const getPostInputSchema = z.object({
  id: z.string().uuid(),
}).strict()

export type GetPostInput = z.infer<typeof getPostInputSchema>
export interface GetPostOutput {
  post: Post
}

async function getPostHandler(input: GetPostInput, dbHandle?: Db): Promise<GetPostOutput> {
  const post = await getDraftPostById(input.id, dbHandle)
  if (!post) {
    throw new ToolError(APP_NOT_FOUND, 'NOT_FOUND', 'post not found')
  }
  return { post }
}

// ── registry ─────────────────────────────────────────────────────────────────
//
// Built lazily so tests that swap @/db/client between runs can still wire
// the helpers to a fresh handle. Additional tools register here in
// subsequent commits.

export interface RegistryOptions {
  dbHandle?: Db
}

export function buildToolRegistry(opts: RegistryOptions = {}): Record<string, ToolDescriptor> {
  return {
    cms_create_draft: {
      name:        'cms_create_draft',
      description:
        'Create a new draft post from markdown. Status is forced to draft; publishing is admin-UI only.',
      inputSchema: createDraftInputSchema,
      outputJsonSchema: {
        type: 'object',
        properties: {
          id:   { type: 'string', format: 'uuid' },
          slug: { type: 'string' },
        },
        required: ['id', 'slug'],
      },
      handler: (input) => createDraftHandler(input as CreateDraftInput, opts.dbHandle),
    },
    cms_patch_post: {
      name:        'cms_patch_post',
      description:
        'Patch an existing post. Supplying `markdown` replaces content_json wholesale. Cannot patch status, published_at, or a published post\'s slug.',
      inputSchema: patchPostInputSchema,
      outputJsonSchema: {
        type: 'object',
        properties: { id: { type: 'string', format: 'uuid' } },
        required: ['id'],
      },
      handler: (input) => patchPostHandler(input as PatchPostInput, opts.dbHandle),
    },
    cms_upload_image: {
      name:        'cms_upload_image',
      description:
        'Upload an image from a URL or base64-encoded bytes. Returns the persisted image id which can be referenced from markdown as `![alt](<id>)`.',
      inputSchema: uploadImageInputSchema,
      outputJsonSchema: {
        type: 'object',
        properties: {
          id:       { type: 'string', format: 'uuid' },
          blob_url: { type: 'string', format: 'uri' },
          width:    { type: 'integer' },
          height:   { type: 'integer' },
        },
        required: ['id', 'blob_url', 'width', 'height'],
      },
      handler: (input) => uploadImageHandler(input as UploadImageInput, opts.dbHandle),
    },
    cms_list_posts: {
      name:        'cms_list_posts',
      description:
        'List posts, optionally filtered by status. Default page size 20, max 100. Ordered by updated_at DESC.',
      inputSchema: listPostsInputSchema,
      outputJsonSchema: {
        type: 'object',
        properties: {
          posts: {
            type:  'array',
            items: {
              type: 'object',
              properties: {
                id:         { type: 'string' },
                slug:       { type: 'string' },
                title:      { type: 'string' },
                status:     { type: 'string', enum: ['draft', 'published'] },
                updated_at: { type: 'string' },
                tags:       { type: 'array', items: { type: 'string' } },
              },
            },
          },
          total: { type: 'integer' },
        },
        required: ['posts', 'total'],
      },
      handler: (input) => listPostsHandler(input as ListPostsInput, opts.dbHandle),
    },
    cms_get_post: {
      name:        'cms_get_post',
      description:
        'Fetch a single post by id, including its full content_json. Use before patching so Claude can read the current content.',
      inputSchema: getPostInputSchema,
      outputJsonSchema: {
        type: 'object',
        properties: { post: { type: 'object' } },
        required: ['post'],
      },
      handler: (input) => getPostHandler(input as GetPostInput, opts.dbHandle),
    },
  }
}

// ── tools/list serializer ────────────────────────────────────────────────────

/**
 * Build the tools/list payload (MCP standard) from the registry. We
 * surface a stub `inputSchema` object — Zod 4's `.toJSONSchema()` isn't
 * surfaced uniformly across versions, and clients that need the full
 * schema can read lib/mcp/tools.ts directly. The runtime contract is
 * the Zod schema; this is documentation only.
 */
export function toolListEntries(registry: Record<string, ToolDescriptor>): ToolListEntry[] {
  return Object.values(registry).map((d) => ({
    name:        d.name,
    description: d.description,
    inputSchema: {
      type:        'object',
      description: 'See lib/mcp/tools.ts for the authoritative Zod schema.',
    },
    outputSchema: d.outputJsonSchema,
  }))
}
