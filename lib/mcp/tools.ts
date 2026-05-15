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
  type SemanticRole,
} from '../blog-schema'
import { createPost } from '../posts'
import { markdownToBlocks } from '../markdown/markdown-to-blocks'
import {
  APP_INTERNAL,
  APP_INVALID_CONTENT,
  APP_SLUG_CONFLICT,
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
  }
}

// ── tools/list serializer ────────────────────────────────────────────────────

/**
 * Build the tools/list payload (MCP standard) from the registry. We
 * surface only the top-level JSON-Schema shape (input + output) since
 * Zod 4's `.toJSONSchema()` isn't surfaced uniformly across versions.
 * The runtime contract is the Zod schema; this is documentation only.
 */
export function toolListEntries(registry: Record<string, ToolDescriptor>): ToolListEntry[] {
  return Object.values(registry).map((d) => ({
    name:        d.name,
    description: d.description,
    inputSchema: zodToJsonSchemaShape(d.inputSchema),
    outputSchema: d.outputJsonSchema,
  }))
}

function zodToJsonSchemaShape(_schema: z.ZodType): Record<string, unknown> {
  return {
    type:        'object',
    description: 'See lib/mcp/tools.ts for the authoritative Zod schema.',
  }
}
