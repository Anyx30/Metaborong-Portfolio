// M8-core BE — CSRF coverage audit.
//
// Statically asserts that every non-GET handler under /api/admin/** invokes
// requireCsrf() before any DB read or side effect. Login is the only
// exempt route — see lib/auth.ts requireCsrf jsdoc.
//
// This is a structural test, not a runtime test. It walks the route files
// on disk and checks that:
//   1. each non-GET export (POST/PATCH/PUT/DELETE) calls requireCsrf
//      somewhere in its body, AND
//   2. the requireCsrf call is the first guard, before any `db.` usage or
//      `revalidatePath`.
//
// If a future contributor adds a new admin route handler and forgets the
// guard, this test fails with the exact route + method that was missed.

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ADMIN_ROOT = join(process.cwd(), 'app/api/admin')
const LOGIN_ROUTE = 'login/route.ts' // exempt by design (no cookie yet)

function findRouteFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      out.push(...findRouteFiles(full))
    } else if (name === 'route.ts') {
      out.push(full)
    }
  }
  return out
}

const MUTATING_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'] as const

function extractHandlerBody(source: string, method: string): string | null {
  const re = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*\\{`, 'm')
  const match = re.exec(source)
  if (!match) return null
  const start = match.index + match[0].length
  // Find the matching closing brace.
  let depth = 1
  let i = start
  while (i < source.length && depth > 0) {
    const ch = source[i]
    if (ch === '{') depth++
    else if (ch === '}') depth--
    i++
  }
  return source.slice(start, i - 1)
}

describe('CSRF coverage on /api/admin/** routes', () => {
  const files = findRouteFiles(ADMIN_ROOT)

  it('discovers route files', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const file of files) {
    const rel = relative(ADMIN_ROOT, file)
    const isLogin = rel === LOGIN_ROUTE
    const source = readFileSync(file, 'utf8')

    for (const method of MUTATING_METHODS) {
      const body = extractHandlerBody(source, method)
      if (!body) continue

      it(`${rel} ${method} ${isLogin ? 'is exempt (login)' : 'calls requireCsrf before any DB read or side effect'}`, () => {
        if (isLogin) {
          // Login carve-out: no mb_csrf cookie can pre-exist on the very
          // first attempt. Documented in lib/auth.ts.
          expect(body).not.toContain('requireCsrf(')
          return
        }

        expect(body, `${rel} ${method} must call requireCsrf()`).toContain('requireCsrf(')

        // The CSRF call must precede any DB usage or revalidatePath.
        const csrfIdx = body.indexOf('requireCsrf(')
        const sideEffectMarkers = [
          'db.',
          'await db',
          'revalidatePath(',
        ]
        for (const marker of sideEffectMarkers) {
          const idx = body.indexOf(marker)
          if (idx !== -1) {
            expect(
              csrfIdx,
              `${rel} ${method}: requireCsrf() must run before "${marker}"`,
            ).toBeLessThan(idx)
          }
        }
      })
    }
  }
})
