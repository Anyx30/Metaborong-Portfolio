# Metaborong CMS — MCP Server Guide

The CMS exposes a Model Context Protocol (MCP) server at `POST /api/mcp` so
Claude (or any MCP-aware client) can author drafts, upload images, and read
existing posts via JSON-RPC 2.0. Publishing, unpublishing, and deletion are
deliberately admin-UI-only — the MCP surface is **draft-first** to keep a
human review step in the loop.

This doc is the canonical reference. For implementation context see
`docs/cms/handoffs/mcp-be-2026-05-15.md`; for the Tester report see
`docs/cms/reports/mcp-2026-05-15.md`.

---

## 1. When to use which surface

| Goal | Use |
|---|---|
| Draft a new post from prose / markdown | MCP `cms_create_draft` |
| Edit an existing draft or published post (text / metadata) | MCP `cms_patch_post` |
| Upload an image for use in a post | MCP `cms_upload_image` |
| List or read existing posts | MCP `cms_list_posts` / `cms_get_post` |
| Publish, unpublish, or delete a post | Admin UI at `/admin` only |
| Score AI Readiness of a published post | Admin UI editor → "Check AI readiness" |
| Configure geo variants (US / EU) | Admin UI editor → variant tabs |
| Score the homepage / non-post URLs | Outside the CMS — VerseOdin direct |

**Rule of thumb**: the MCP surface lets Claude *propose*. The admin UI lets a
human *commit*.

---

## 2. Setup

### 2.1 Generate a token (one time)

```bash
openssl rand -base64 32
```

### 2.2 Add to `.env.local` (local dev)

```
MCP_ADMIN_TOKEN=<paste-the-output-here>
```

No `\$`-escape needed: base64's alphabet (`A-Z a-z 0-9 + / =`) has no `$`.

### 2.3 Add to Vercel (staging / prod)

Project Settings → Environment Variables → `MCP_ADMIN_TOKEN` for the
Preview and/or Production environments.

### 2.4 Restart

Local: `pkill -f "next dev"; npm run dev`
Vercel: redeploys automatically on env-var change.

### 2.5 Verify

```bash
TOKEN=$(grep '^MCP_ADMIN_TOKEN=' .env.local | cut -d= -f2-)
/usr/bin/curl -s -X POST http://localhost:3000/api/mcp -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"initialize"}'
```

Expected:

```json
{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-03-26","capabilities":{"tools":{}},"serverInfo":{"name":"metaborong-cms","version":"1.0.0"}}}
```

If you instead see `{"error":{"code":-32001,"message":"MCP server is not configured.","data":{"code":"MCP_DISABLED"}}}` the env var didn't load — check for typos and that the dev server was restarted.

---

## 3. Wire-level basics

- **Transport**: Streamable HTTP (single POST → single JSON response). No SSE in v1.
- **Envelope**: JSON-RPC 2.0 — every request and response carries `jsonrpc:"2.0"` and an `id` for correlation.
- **Auth**: `Authorization: Bearer <MCP_ADMIN_TOKEN>` on every request. Constant-time compare server-side.
- **Content type**: `Content-Type: application/json` always.
- **GET requests**: return 405 — the server is POST-only.

### 3.1 Methods supported

| Method | Purpose |
|---|---|
| `initialize` | Handshake. Returns protocol version, capabilities, server info. |
| `tools/list` | Enumerate the 5 available tools with their input/output schemas. |
| `tools/call` | Invoke a tool. Params: `{ name, arguments }`. |

### 3.2 Success envelope

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{ "type": "json", "json": { /* tool output */ } }],
    "payload": { /* same tool output, mirrored at top level for convenience */ }
  }
}
```

Read either `result.content[0].json` (MCP-spec-canonical) or `result.payload`
(top-level shortcut) — they're identical.

### 3.3 Error envelope

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32602,
    "message": "title is required",
    "data": {
      "code": "VALIDATION_FAILED",
      "field": "title"
    }
  }
}
```

- `error.code` — JSON-RPC numeric code (`-32700` parse, `-32600` invalid request, `-32601` method not found, `-32602` invalid params, `-32603` internal). Custom CMS codes start at `-32000` and below.
- `error.data.code` — CMS machine code (`VALIDATION_FAILED`, `SLUG_CONFLICT`, `NOT_FOUND`, `UNAUTHORIZED`, `MCP_DISABLED`, `INVALID_CONTENT`, `INTERNAL`).
- `error.data.field` — optional pointer to the offending field (Zod path-style).

---

## 4. Tools

### 4.1 `cms_create_draft`

Create a new draft post from markdown.

**Arguments**

| field | type | required | notes |
|---|---|---|---|
| `title` | string | yes | becomes the H1; do NOT include H1 in markdown |
| `markdown` | string | yes | body — see §5 for syntax |
| `slug` | string | no | kebab-case; auto-derived from title if absent |
| `excerpt` | string | no | listing + RSS + OG description |
| `tags` | string[] | no | lowercase-with-hyphens |
| `author_name` | string | no | defaults to `Metaborong Editorial` |
| `author_url` | string | no | link to bio |
| `meta_title` | string | no | overrides title in browser tab / search snippet |
| `meta_description` | string | no | overrides excerpt in search snippet |
| `cover_image_id` | string (UUID) | no | must already exist via `cms_upload_image` |
| `og_image_id` | string (UUID) | no | falls back to cover when unset |
| `block_roles` | `{ <index>: SemanticRole }` | no | applies roles to blocks by zero-based index; see §5.4 |

**Returns**: `{ id: string, slug: string }` — both UUIDs/strings.

**Status is always `'draft'`.** Never publishes. There is no way to publish via MCP — by design.

**Errors**

| `error.data.code` | trigger |
|---|---|
| `VALIDATION_FAILED` | bad input shape |
| `SLUG_CONFLICT` | slug already in use |
| `INVALID_CONTENT` | markdown converts to invalid blocks (e.g. H1 used, image without alt, image with non-UUID src) |
| `INTERNAL` | unexpected — check server logs |

**Example**

```bash
/usr/bin/curl -s -X POST http://localhost:3000/api/mcp -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"cms_create_draft","arguments":{"title":"How MCP servers work","markdown":"## Why\n\nMCP is a contract between LLM hosts and tool servers.\n\n> [!tip] Read the spec at modelcontextprotocol.io","tags":["mcp","ai-tools"]}}}'
```

---

### 4.2 `cms_patch_post`

Edit an existing post (draft or published).

**Arguments**

| field | type | required | notes |
|---|---|---|---|
| `id` | string (UUID) | yes | the post's `_id` |
| `fields` | object | yes | partial — only sent fields are touched |

`fields` can contain any of: `title`, `slug`, `excerpt`, `markdown`, `tags`,
`author_name`, `author_url`, `meta_title`, `meta_description`,
`cover_image_id`, `og_image_id`, `block_roles`.

**Cannot patch**:
- `status` (silently dropped — no publish/unpublish via MCP)
- `slug` on a *published* post (returns `SLUG_LOCKED`)
- `id`, `_id`, `created_at`, `published_at` (silently dropped)

**`markdown` replaces `content_json` wholesale.** No partial block diffing in
v1. To make a small change, fetch with `cms_get_post`, modify the markdown
locally, then patch with the full new markdown.

**Returns**: `{ id: string }`.

**Example**

```bash
/usr/bin/curl -s -X POST http://localhost:3000/api/mcp -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"cms_patch_post","arguments":{"id":"<post-uuid>","fields":{"excerpt":"Updated copy"}}}}'
```

---

### 4.3 `cms_upload_image`

Upload an image to the library so it can be referenced from markdown.

**Arguments**

| field | type | required | notes |
|---|---|---|---|
| `source` | `{ url: string }` OR `{ base64: string, content_type: string }` | yes | one of |
| `alt` | string | yes | min 1 char — schema-enforced |
| `filename` | string | yes | sanitized server-side |
| `focal_x` | number 0–1 | no | default 0.5 (center) |
| `focal_y` | number 0–1 | no | default 0.5 |

**URL mode**: server fetches with a 10s timeout. Rejects non-200 responses,
non-image content types, or payloads >8 MB.

**Base64 mode**: server decodes, magic-byte-validates, transcodes via
`sharp`, and stores the WebP in Vercel Blob.

**Returns**: `{ id, blob_url, width, height }` — `id` is what you reference
in markdown as `![alt](<id>)`.

**Errors**

| `error.data.code` | trigger |
|---|---|
| `VALIDATION_FAILED` | bad input shape, missing alt |
| `INVALID_CONTENT` | non-image content type, decode failure, magic-byte mismatch |
| `PAYLOAD_TOO_LARGE` | >8 MB |
| `UPSTREAM_FETCH_FAILED` | URL fetch returned non-200, timed out, or DNS failed |

**Example (URL)**

```bash
/usr/bin/curl -s -X POST http://localhost:3000/api/mcp -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"cms_upload_image","arguments":{"source":{"url":"https://placecats.com/600/400"},"alt":"A cat sitting","filename":"cat.jpg"}}}'
```

**Example (base64)**

```bash
B64=$(base64 -i ./local.png | tr -d '\n')
/usr/bin/curl -s -X POST http://localhost:3000/api/mcp -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"jsonrpc\":\"2.0\",\"id\":4,\"method\":\"tools/call\",\"params\":{\"name\":\"cms_upload_image\",\"arguments\":{\"source\":{\"base64\":\"$B64\",\"content_type\":\"image/png\"},\"alt\":\"A diagram\",\"filename\":\"diagram.png\"}}}"
```

---

### 4.4 `cms_list_posts`

Browse posts.

**Arguments**

| field | type | required | default |
|---|---|---|---|
| `status` | `'draft'` \| `'published'` | no | both |
| `limit` | number | no | 20; max 100 |
| `offset` | number | no | 0 |

**Returns**

```json
{
  "posts": [
    {
      "id": "...",
      "slug": "...",
      "title": "...",
      "status": "draft",
      "updated_at": "2026-05-16T05:24:25.337Z",
      "tags": ["..."]
    }
  ],
  "total": 1
}
```

**Note**: returns post **summaries** only. Use `cms_get_post` for full
content.

---

### 4.5 `cms_get_post`

Fetch a single post including `content_json`.

**Arguments**: `{ id: string }`.

**Returns**: the full post document with dates as ISO strings:

```json
{
  "post": {
    "id": "...",
    "slug": "...",
    "title": "...",
    "status": "draft",
    "content_json": [/* blocks */],
    "excerpt": "...",
    "tags": [],
    "geo_variants": {},
    "ai_readiness_score": null,
    "created_at": "...",
    "updated_at": "...",
    "published_at": null
  }
}
```

**Errors**: `NOT_FOUND` if no post with that id.

---

## 5. Markdown syntax

The converter parses markdown via `mdast-util-from-markdown` and emits
blocks matching `lib/blog-schema.ts`. Anything not in this table is either
silently dropped or stripped to plain text.

### 5.1 Supported

| Markdown | Block |
|---|---|
| `## Text` … `###### Text` | heading, level 2–6 |
| `# Text` | **REJECTED** with `INVALID_CONTENT` — H1 is reserved for `title` |
| plain paragraph | paragraph |
| `- item` / `* item` | unordered list |
| `1. item` | ordered list |
| <code>```lang</code>…<code>```</code> | code block (lang is a hint; full highlighting is roadmap) |
| `> body` | quote |
| `> body\n> — author` | quote with `cite = author` |
| `> [!tip] body` | callout, tone=tip |
| `> [!note] body` | callout, tone=note |
| `> [!warn] body` | callout, tone=warn |
| `> [!faq] Question\n> Answer text` | faq |
| `> [!takeaway] body` | key-takeaway |
| `![alt](<image-uuid>)` | image (src MUST be a UUID; URLs rejected) |

**Admonition markers are case-insensitive** (v2.2+). `> [!TIP]`, `> [!Tip]`,
and `> [!tip]` all resolve the same way, matching GitHub's own admonition
syntax.

### 5.2 Inline formatting

`**bold**`, `*italic*`, and `[link](url)` are **collapsed to plain text** in
v1. The block schema doesn't carry rich inline structure; the block-level
semantic role (`role: 'definition'`, etc.) is the primary lever.

### 5.3 Images

`![alt](image-uuid)` — the `src` must be a UUID of an image already in the
library. There is no URL passthrough — first call `cms_upload_image`, get
back the `id`, then reference it from markdown.

`alt` text is required (`min(1)` in the schema). Markdown without alt is
rejected with `INVALID_CONTENT`.

### 5.4 Semantic roles (the SEO/AEO/GEO lever)

Roles tag a block's intent so the renderer can shape JSON-LD, llms.txt, and
FAQPage output. The full role catalog: `intro`, `tldr`, `definition`,
`step`, `evidence`, `cta`.

Two ways to set roles in markdown:

**a) HTML comment hint** (per-block, lives in the markdown):

```markdown
<!-- role: tldr -->
This paragraph becomes the tldr block.
```

The comment must be on its own line, immediately before the block.

**b) `block_roles` argument** (index-based, in the tool call):

```json
{
  "title": "...",
  "markdown": "...",
  "block_roles": { "0": "intro", "3": "tldr" }
}
```

`block_roles` wins if both are specified for the same block.

**Special behaviors**:
- 3+ blocks carrying `role: 'step'` auto-aggregate into HowTo JSON-LD.
- At most one block per post may carry `role: 'tldr'`. Validation rejects
  more.

### 5.5 Silently dropped

- Tables
- Footnotes
- Raw HTML (except role-hint comments)
- YAML / TOML frontmatter
- Empty paragraphs

---

## 6. Wiring Claude Code

Drop a `.mcp.json` in the project root (or `~/.claude/settings.json` for
global):

```json
{
  "mcpServers": {
    "metaborong-cms": {
      "type": "http",
      "url": "http://localhost:3000/api/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_ADMIN_TOKEN>"
      }
    }
  }
}
```

For staging / prod, swap the URL to `https://<your-domain>/api/mcp`.

**Gitignore the file** — it contains your bearer token. Or commit it with an
env-var reference and resolve at runtime.

Once configured, Claude Code sessions opened in this repo see the 5 tools
and can author drafts in natural language: *"create a draft post about
WebSockets vs SSE, include a callout about reconnection handling"*.

---

## 7. Operational notes

- **Mongo timeout**: the driver is capped at `serverSelectionTimeoutMS: 5000`, so a Mongo outage fails fast instead of hanging the function timeout. Tester N3 fix from 2026-05-15.
- **Rate limiting**: none on `/api/mcp` in v1. Natural friction comes from the slug-uniqueness index and the 8 MB image cap. Add per-IP limiting before exposing the endpoint to untrusted clients.
- **No SSE**: the server is synchronous-only. Clients that probe for SSE via GET get a 405 with a helpful JSON body.
- **Token rotation**: change `MCP_ADMIN_TOKEN` in `.env.local` (and Vercel) and restart. Existing clients will need their config updated.

---

## 8. Common pitfalls

1. **Env var typo**. `MCP_ADMIN_TOKEn` ≠ `MCP_ADMIN_TOKEN`. The server returns 503 `MCP_DISABLED` on every request.
2. **Forgot to restart dev**. `.env.local` is read at startup, not per request. After editing, `pkill -f "next dev"; npm run dev`.
3. **Backslashes in pasted curl**. Multi-line `\`-continued curl commands get mangled in zsh when pasted as a block. Either keep them on a single line or use a heredoc.
4. **H1 in markdown**. The title comes from the `title` argument, not from `# Heading`. Markdown that starts with `# ...` is rejected.
5. **Image src is a URL, not a UUID**. Upload first with `cms_upload_image`, then reference the returned id.
6. **Patching `status: 'published'`**. Silently dropped. There is no MCP path to publish — open the admin UI.
7. **Unknown admonition keyword**. Only `tip`, `note`, `warn`, `faq`, `takeaway` are recognised. `> [!info] something` falls through to a plain quote. Casing doesn't matter, but the keyword does.

---

## 9. Reference

- Source: `app/api/mcp/route.ts`, `lib/mcp/*`, `lib/markdown/*`
- Tests: `app/api/mcp/route.test.ts`, `lib/mcp/tools.test.ts`, `lib/markdown/markdown-to-blocks.test.ts`, `e2e/mcp-regression.spec.ts`
- Block schema (the contract): `lib/blog-schema.ts`
- Handoff: `docs/cms/handoffs/mcp-be-2026-05-15.md`
- Tester report: `docs/cms/reports/mcp-2026-05-15.md`
- MCP spec: <https://modelcontextprotocol.io>
