// /api/mcp — Claude MCP server endpoint
//
// Single POST that speaks the MCP "Streamable HTTP" transport (2025-03-26).
// Every request is JSON-RPC 2.0; every response is a single JSON envelope
// (we never SSE in v1 — all tools return synchronously). The full spec
// is at https://modelcontextprotocol.io but the slice we need is small:
//
//   - initialize     handshake; returns server info + capabilities
//   - tools/list     enumerate the 5 CMS tools
//   - tools/call     invoke a specific tool with arguments
//
// Auth: a single bearer token (MCP_ADMIN_TOKEN). Missing env var → 503
// MCP_DISABLED. Bad / missing header → 401 UNAUTHORIZED. Both emitted
// via the JSON-RPC error envelope (data.code carries the CMS-side
// machine code) so a client that's been built against /api/admin/**
// can map them with no new code.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { checkBearer } from '../../../lib/mcp/auth'
import {
  buildToolRegistry,
  toolListEntries,
  ToolError,
} from '../../../lib/mcp/tools'
import {
  APP_INTERNAL,
  APP_UNAUTHORIZED,
  APP_VALIDATION_FAILED,
  JSONRPC_VERSION,
  JSON_RPC_INVALID_PARAMS,
  JSON_RPC_INVALID_REQUEST,
  JSON_RPC_METHOD_NOT_FOUND,
  JSON_RPC_PARSE_ERROR,
  SERVER_NAME,
  SERVER_VERSION,
  SUPPORTED_PROTOCOL_VERSION,
  type InitializeResult,
  type JsonRpcError,
  type JsonRpcId,
  type JsonRpcRequest,
  type JsonRpcSuccess,
  type ToolListResponse,
} from '../../../lib/mcp/types'

export const runtime = 'nodejs'

const jsonRpcRequestSchema = z.object({
  jsonrpc: z.literal(JSONRPC_VERSION),
  id:      z.union([z.string(), z.number(), z.null()]).optional(),
  method:  z.string().min(1),
  params:  z.unknown().optional(),
}).strict()

const toolsCallParamsSchema = z.object({
  name:      z.string().min(1),
  arguments: z.unknown().optional(),
}).passthrough()

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // (1) Read the raw body once. JSON-RPC parse-error must still return a
  // JSON-RPC envelope with id=null per spec §5.1.
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return jsonError(null, JSON_RPC_PARSE_ERROR, 'Parse error: body is not valid JSON')
  }

  // (2) Validate the envelope. id is preserved so the client can correlate
  // even when the method or params are malformed.
  const parsed = jsonRpcRequestSchema.safeParse(raw)
  if (!parsed.success) {
    const id = isObjectWithId(raw) ? raw.id ?? null : null
    return jsonError(id, JSON_RPC_INVALID_REQUEST, 'Invalid Request: ' + (parsed.error.issues[0]?.message ?? 'envelope shape is wrong'))
  }
  const envelope: JsonRpcRequest = parsed.data
  const id = envelope.id ?? null

  // (3) Bearer auth. Disabled (env unset) → 503 with MCP_DISABLED; bad
  // token → 401 with UNAUTHORIZED. Both via the JSON-RPC error envelope.
  const auth = checkBearer(req.headers.get('authorization'))
  if (!auth.ok) {
    if (auth.reason === 'disabled') {
      return jsonError(id, APP_UNAUTHORIZED, auth.message, 503, { code: 'MCP_DISABLED' })
    }
    return jsonError(id, APP_UNAUTHORIZED, auth.message, 401, { code: 'UNAUTHORIZED' })
  }

  // (4) Method dispatch.
  switch (envelope.method) {
    case 'initialize':
      return handleInitialize(id)
    case 'tools/list':
      return handleToolsList(id)
    case 'tools/call':
      return handleToolsCall(id, envelope.params)
    default:
      return jsonError(id, JSON_RPC_METHOD_NOT_FOUND, `Method not found: ${envelope.method}`)
  }
}

// ── method handlers ──────────────────────────────────────────────────────────

function handleInitialize(id: JsonRpcId): NextResponse {
  const result: InitializeResult = {
    protocolVersion: SUPPORTED_PROTOCOL_VERSION,
    capabilities:    { tools: {} },
    serverInfo:      { name: SERVER_NAME, version: SERVER_VERSION },
  }
  return jsonResult(id, result)
}

function handleToolsList(id: JsonRpcId): NextResponse {
  const registry = buildToolRegistry()
  const body: ToolListResponse = { tools: toolListEntries(registry) }
  return jsonResult(id, body)
}

async function handleToolsCall(id: JsonRpcId, params: unknown): Promise<NextResponse> {
  const parsed = toolsCallParamsSchema.safeParse(params ?? {})
  if (!parsed.success) {
    return jsonError(id, JSON_RPC_INVALID_PARAMS, 'Invalid params for tools/call: ' + (parsed.error.issues[0]?.message ?? 'shape mismatch'))
  }
  const { name, arguments: args } = parsed.data

  const registry = buildToolRegistry()
  const tool = registry[name]
  if (!tool) {
    return jsonError(id, JSON_RPC_METHOD_NOT_FOUND, `Unknown tool: ${name}`)
  }

  const argsParse = tool.inputSchema.safeParse(args ?? {})
  if (!argsParse.success) {
    const issue = argsParse.error.issues[0]
    return jsonError(
      id,
      APP_VALIDATION_FAILED,
      issue?.message ?? 'invalid tool arguments',
      undefined,
      {
        code:  'VALIDATION_FAILED',
        field: issue?.path?.join('.') || undefined,
      },
    )
  }

  try {
    const result = await tool.handler(argsParse.data)
    // MCP standard wraps tool results in a content array. We use a single
    // application/json item so clients can parse the JSON directly without
    // tripping over the legacy "text" wrapper.
    return jsonResult(id, {
      content: [
        { type: 'json', json: result },
      ],
      // Convenience: also surface the raw payload at the top level. The
      // MCP spec lets us add extra fields and most clients read both.
      payload: result,
    })
  } catch (err) {
    if (err instanceof ToolError) {
      return jsonError(id, err.code, err.message, undefined, {
        code:  err.appCode,
        field: err.field,
      })
    }
    console.error('[/api/mcp tools/call] unhandled error:', err)
    return jsonError(id, APP_INTERNAL, 'Internal server error', undefined, {
      code: 'INTERNAL',
    })
  }
}

// ── envelope helpers ─────────────────────────────────────────────────────────

function jsonResult<T>(id: JsonRpcId, result: T): NextResponse {
  const body: JsonRpcSuccess<T> = { jsonrpc: '2.0', id, result }
  return NextResponse.json(body)
}

function jsonError(
  id: JsonRpcId,
  code: number,
  message: string,
  httpStatus = 200,
  data?: Record<string, unknown>,
): NextResponse {
  const body: JsonRpcError = {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(data !== undefined ? { data } : {}),
    },
  }
  return NextResponse.json(body, { status: httpStatus })
}

function isObjectWithId(raw: unknown): raw is { id?: JsonRpcId } {
  if (!raw || typeof raw !== 'object') return false
  const r = raw as { id?: unknown }
  const t = typeof r.id
  return t === 'string' || t === 'number' || r.id === null || t === 'undefined'
}

// ── GET (not allowed) ────────────────────────────────────────────────────────
//
// Some clients probe with GET to check for SSE support. We're streamable-
// only and synchronous, so the answer is 405 with a JSON-RPC error body
// telling them to use POST.

export function GET() {
  return jsonError(null, JSON_RPC_INVALID_REQUEST, 'MCP server speaks JSON-RPC over POST only', 405, {
    code: 'METHOD_NOT_ALLOWED',
  })
}
