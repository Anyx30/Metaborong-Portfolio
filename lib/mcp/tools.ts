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
import type { ToolDescriptor, ToolListEntry } from './types'

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

// ── registry ─────────────────────────────────────────────────────────────────
//
// Built lazily so tests that swap @/db/client between runs can still wire
// the helpers to a fresh handle. The exported tools are added incrementally
// in subsequent commits — this file is the registration point.

export interface RegistryOptions {
  dbHandle?: Db
}

export function buildToolRegistry(_opts: RegistryOptions = {}): Record<string, ToolDescriptor> {
  return {}
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
