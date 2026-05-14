import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// vitest.config.ts is loaded as ESM by Vitest 4 — __dirname is undefined
// in that context. Resolve the repo root from import.meta.url so the @/
// alias points at this directory regardless of where Vitest is invoked.
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// Backend-owned test config. The Frontend agent will extend this in their
// own milestone with: a happy-dom environment opt-in for *.test.tsx, an
// extra include glob for components/**, and any coverage paths under
// lib/api-client.ts and components/**.
//
// Why a regex alias and not a string alias: with `'@': /repo/.`, Vite's
// resolver short-circuits `@/foo` as a scoped npm package name. The regex
// form forces prefix-substitution, which works inside both the test files
// and any module they pull in.

const repoRoot = __dirname

export default defineConfig({
  test: {
    alias: [
      { find: /^@\/(.*)$/, replacement: repoRoot + '/$1' },
    ],
    // Default environment is Node (BE's server tests). Component tests
    // opt into happy-dom via the `// @vitest-environment happy-dom`
    // directive at the top of each *.test.tsx file.
    environment: 'node',
    include: [
      'lib/**/*.test.ts',
      'db/**/*.test.ts',
      // M5-core widened from `app/api/**/*.test.ts` to `app/**/*.test.ts`
      // so route-tests for sitemap.ts, robots.ts, /og, /blog/rss.xml, and
      // /blog/[slug]/raw.md run alongside the admin API tests.
      'app/**/*.test.ts',
      // FE-added: pick up component tests + lib/api-client.test.ts.
      'components/**/*.test.tsx',
      // M9-GEO: pick up page-level Server Component tests under app/.
      'app/**/*.test.tsx',
    ],
    exclude: [
      'node_modules/**',
      '.next/**',
      'e2e/**',
    ],
    // Each route-handler test instantiates its own database name on a
    // mongodb-memory-server booted once per Vitest worker; tests don't
    // share state via globals, so parallel runs are safe.
    pool: 'threads',
    // mongodb-memory-server boots take ~3-10s on a cold binary cache and
    // ~1s warm. Bump the per-test cap so a slow first test inside a worker
    // doesn't time out waiting for the server to start.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: [
        'lib/auth.ts',
        'lib/api.ts',
        'lib/api-client.ts',
        'lib/blog-schema.ts',
        'app/api/admin/**/route.ts',
        'db/schema.ts',
        'components/admin/**/*.tsx',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.d.ts',
      ],
      reporter: ['text', 'html'],
    },
  },
})
