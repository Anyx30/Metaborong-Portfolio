// JSON-RPC 2.0 envelope types + MCP tool descriptor.
//
// We pin to the MCP "Streamable HTTP" transport spec (2025-03-26). The
// only deviation we make is that v1 NEVER streams — every tool returns
// synchronously, so the response body is always a single JSON-RPC envelope.
// A client that expects HTTP+SSE (the older transport) won't talk to us
// in v1; document and move on.

import { z } from 'zod'

// ── JSON-RPC envelope ────────────────────────────────────────────────────────

export const JSONRPC_VERSION = '2.0'

export type JsonRpcId = string | number | null

export interface JsonRpcRequest {
  jsonrpc: '2.0'
  id?:     JsonRpcId
  method:  string
  params?: unknown
}

export interface JsonRpcSuccess<T = unknown> {
  jsonrpc: '2.0'
  id:      JsonRpcId
  result:  T
}

export interface JsonRpcErrorObject {
  code:    number
  message: string
  data?:   unknown
}

export interface JsonRpcError {
  jsonrpc: '2.0'
  id:      JsonRpcId
  error:   JsonRpcErrorObject
}

export type JsonRpcResponse<T = unknown> = JsonRpcSuccess<T> | JsonRpcError

// ── MCP error codes ──────────────────────────────────────────────────────────
//
// JSON-RPC 2.0 reserves the -32xxx range. -32000..-32099 is "server error".
// MCP itself doesn't pin specific application codes; we mint a small set
// that map cleanly onto the existing /api/admin/** error vocabulary so a
// client receiving a JSON-RPC error.data.code can correlate to the same
// machine-readable string the admin UI shows.

export const JSON_RPC_PARSE_ERROR      = -32700
export const JSON_RPC_INVALID_REQUEST  = -32600
export const JSON_RPC_METHOD_NOT_FOUND = -32601
export const JSON_RPC_INVALID_PARAMS   = -32602
export const JSON_RPC_INTERNAL_ERROR   = -32603

// Application-level errors mapped from CMS error codes. Single namespace
// at -32000..-32008 so adding a new one doesn't collide with the
// JSON-RPC reserved space.
export const APP_UNAUTHORIZED        = -32000
export const APP_VALIDATION_FAILED   = -32001
export const APP_NOT_FOUND           = -32002
export const APP_SLUG_CONFLICT       = -32003
export const APP_UPLOAD_TOO_LARGE    = -32004
export const APP_UPLOAD_BAD_TYPE     = -32005
export const APP_INTERNAL            = -32006
export const APP_INVALID_CONTENT     = -32007
export const APP_BLOB_UPLOAD_FAILED  = -32008

// ── tool descriptor ──────────────────────────────────────────────────────────
//
// Each tool registers a name, JSON-Schema for its input, a JSON-Schema for
// the output (for documentation only — we do NOT validate output), a
// human-readable description, and a handler. The handler runs after the
// route layer has gated on bearer auth and parsed the JSON-RPC envelope.

export interface ToolDescriptor<TIn = unknown, TOut = unknown> {
  name:        string
  description: string
  inputSchema: z.ZodType<TIn>
  /**
   * JSON-Schema for the output, surfaced via tools/list so clients can
   * type-hint UIs against it. Not validated at runtime.
   */
  outputJsonSchema?: Record<string, unknown>
  handler:     (input: TIn) => Promise<TOut> | TOut
}

// ── tools/list response shape (MCP standard) ─────────────────────────────────

export interface ToolListEntry {
  name:        string
  description: string
  inputSchema: Record<string, unknown>
  outputSchema?: Record<string, unknown>
}

export interface ToolListResponse {
  tools: ToolListEntry[]
}

// ── initialize handshake (MCP 2025-03-26) ────────────────────────────────────

export interface InitializeResult {
  protocolVersion: string
  capabilities: {
    tools: Record<string, unknown>
  }
  serverInfo: {
    name:    string
    version: string
  }
}

export const SUPPORTED_PROTOCOL_VERSION = '2025-03-26'
export const SERVER_NAME    = 'metaborong-cms'
export const SERVER_VERSION = '1.0.0'
