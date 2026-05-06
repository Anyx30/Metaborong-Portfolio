// Robots.txt tests — production rules vs preview/dev "Disallow: /".
//
// The SUT reads NEXT_PUBLIC_VERCEL_ENV at module load — which Vitest
// re-evaluates per test thanks to vi.resetModules() between cases.

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'

const ORIGINAL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV

beforeEach(() => {
  vi.resetModules()
})
afterEach(() => {
  if (ORIGINAL_ENV === undefined) delete process.env.NEXT_PUBLIC_VERCEL_ENV
  else process.env.NEXT_PUBLIC_VERCEL_ENV = ORIGINAL_ENV
})

async function loadRobots() {
  return (await import('@/app/robots')).default
}

describe('app/robots.ts', () => {
  it('emits production rules when NEXT_PUBLIC_VERCEL_ENV=production', async () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'production'
    const robots = await loadRobots()
    const out = robots()
    expect(out.sitemap).toBe('https://www.metaborong.com/sitemap.xml')
    expect(Array.isArray(out.rules)).toBe(true)
    const rules = Array.isArray(out.rules) ? out.rules[0] : out.rules
    expect(rules?.userAgent).toBe('*')
    expect(rules?.allow).toBe('/')
    expect(rules?.disallow).toEqual([
      '/admin/',
      '/api/',
      '/admin/posts/*/preview',
    ])
  })

  it('emits "Disallow: /" everywhere else (preview)', async () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview'
    const robots = await loadRobots()
    const out = robots()
    expect(out.sitemap).toBeUndefined()
    const rules = Array.isArray(out.rules) ? out.rules[0] : out.rules
    expect(rules?.userAgent).toBe('*')
    expect(rules?.disallow).toBe('/')
  })

  it('emits "Disallow: /" when NEXT_PUBLIC_VERCEL_ENV is unset (dev)', async () => {
    delete process.env.NEXT_PUBLIC_VERCEL_ENV
    const robots = await loadRobots()
    const out = robots()
    const rules = Array.isArray(out.rules) ? out.rules[0] : out.rules
    expect(rules?.disallow).toBe('/')
  })

  it('emits "Disallow: /" when NEXT_PUBLIC_VERCEL_ENV is "development"', async () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'development'
    const robots = await loadRobots()
    const out = robots()
    const rules = Array.isArray(out.rules) ? out.rules[0] : out.rules
    expect(rules?.disallow).toBe('/')
  })
})
