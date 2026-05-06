import { expect, test, type BrowserContext, type Page } from '@playwright/test'

/**
 * M5-core golden-path E2E.
 *
 * Verifies the SEO surface added in M5-core:
 *   1. /blog/[slug] inlines TWO <script type="application/ld+json"> tags,
 *      both parse-valid; one is Article and one is BreadcrumbList.
 *   2. /blog/[slug] renders a TOC with an anchor link per heading and
 *      clicking one updates window.location.hash.
 *   3. /blog/rss.xml returns valid RSS 2.0 with the published post listed.
 *
 * Same env-gate pattern as M2/M4 specs:
 *   E2E_ADMIN_EMAIL    — same value as ADMIN_EMAIL in .env.local
 *   E2E_ADMIN_PASSWORD — plaintext that bcrypts to ADMIN_PASSWORD_HASH
 *
 * When either is missing the spec is .skip()'d so unit tests stay green
 * and CI doesn't need a seeded admin DB to pass.
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const hasCreds = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD)

const RUN_TAG = `e2e-${Date.now().toString(36)}`
const POST_TITLE = `M5 ${RUN_TAG} — SEO smoke`
function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'untitled'
  )
}
const POST_SLUG = slugify(POST_TITLE)

const CONTENT_JSON = [
  { id: 'h1', type: 'heading',   data: { text: 'Why we shipped',     level: 2 } },
  { id: 'p1', type: 'paragraph', data: { text: 'Because the deadline was real.' } },
  { id: 'h2', type: 'heading',   data: { text: 'How we tested it',   level: 2 } },
  { id: 'h3', type: 'heading',   data: { text: 'Edge cases',         level: 3 } },
  { id: 'p2', type: 'paragraph', data: { text: 'We caught the obvious ones.' } },
]

async function signIn(page: Page) {
  await page.context().clearCookies()
  await page.goto('/admin/login')
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL!)
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/admin\/?$/)
}

test.describe('M5-core — SEO golden path', () => {
  test.skip(!hasCreds, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run M5-core spec.')
  test.describe.configure({ mode: 'serial' })

  let postId: string | undefined

  test.afterAll(async ({ browser }) => {
    if (!postId || !hasCreds) return
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    try {
      await page.goto('/admin/login')
      await page.getByLabel(/email/i).fill(ADMIN_EMAIL!)
      await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL(/\/admin\/?$/)
      const cookies = await ctx.cookies()
      const csrf = cookies.find((c) => c.name === 'mb_csrf')?.value
      if (csrf) {
        await page.request
          .delete(`/api/admin/posts/${postId}`, { headers: { 'X-CSRF-Token': csrf } })
          .catch(() => undefined)
      }
    } finally {
      await ctx.close()
    }
  })

  test('seed + publish a post with headings', async ({ page }) => {
    await signIn(page)
    await page.getByRole('link', { name: /new post/i }).click()
    await page.getByLabel(/^title$/i).fill(POST_TITLE)
    await page.getByRole('button', { name: /create draft/i }).click()
    await expect(page).toHaveURL(/\/admin\/posts\/[0-9a-f-]{36}$/)
    postId = new URL(page.url()).pathname.split('/').pop()
    expect(postId).toMatch(/^[0-9a-f-]{36}$/)

    const cookies = await page.context().cookies()
    const csrf = cookies.find((c) => c.name === 'mb_csrf')!.value
    const patchRes = await page.request.patch(`/api/admin/posts/${postId}`, {
      headers: { 'X-CSRF-Token': csrf },
      data: {
        content_json: CONTENT_JSON,
        author_name: 'E2E Test',
        excerpt: `Seo smoke ${RUN_TAG}.`,
        tags: ['e2e', 'seo'],
      },
    })
    expect(patchRes.status()).toBe(200)
    await page.reload()

    await page.getByRole('button', { name: /^publish$/i }).click()
    await expect(page.getByRole('status', { name: /status: published/i })).toBeVisible()
  })

  test('public /blog/[slug] inlines Article + BreadcrumbList JSON-LD', async ({ browser }) => {
    test.skip(!postId, 'Seed step did not produce a post id.')
    const context: BrowserContext = await browser.newContext()
    const page = await context.newPage()

    let attempts = 0
    while (attempts < 5) {
      const res = await page.goto(`/blog/${POST_SLUG}`)
      if (res && res.status() === 200) break
      attempts++
      await page.waitForTimeout(500)
    }

    const scripts = await page.locator('script[type="application/ld+json"]').all()
    expect(scripts.length, 'expected at least 2 JSON-LD scripts').toBeGreaterThanOrEqual(2)
    const parsed = await Promise.all(
      scripts.map(async (s) => JSON.parse((await s.textContent()) ?? 'null')),
    )
    const types = parsed.map((p) => p?.['@type'])
    expect(types).toContain('Article')
    expect(types).toContain('BreadcrumbList')

    const article = parsed.find((p) => p?.['@type'] === 'Article')!
    expect(article['@context']).toBe('https://schema.org')
    expect(typeof article.headline).toBe('string')
    expect(typeof article.datePublished).toBe('string')
    expect(article.image).toMatch(/\/og\?slug=/)

    const breadcrumb = parsed.find((p) => p?.['@type'] === 'BreadcrumbList')!
    expect(breadcrumb.itemListElement).toHaveLength(3)
    expect(breadcrumb.itemListElement[2].name).toBe(POST_TITLE)

    await context.close()
  })

  test('TOC anchor click updates URL hash', async ({ browser }) => {
    test.skip(!postId, 'Seed step did not produce a post id.')
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(`/blog/${POST_SLUG}`)

    const tocNav = page.getByRole('navigation', { name: /table of contents/i }).first()
    await expect(tocNav).toBeVisible()

    const link = tocNav.getByRole('link', { name: /how we tested it/i })
    await expect(link).toBeVisible()
    await link.click()

    await page.waitForFunction(
      () => window.location.hash === '#how-we-tested-it',
      undefined,
      { timeout: 2000 },
    )
    expect(await page.evaluate(() => window.location.hash)).toBe('#how-we-tested-it')

    await ctx.close()
  })

  test('/blog/rss.xml returns valid RSS 2.0 with the post listed', async ({ browser }) => {
    test.skip(!postId, 'Seed step did not produce a post id.')
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    const res = await page.goto('/blog/rss.xml')
    expect(res?.status()).toBe(200)
    const ct = res?.headers()['content-type'] ?? ''
    expect(ct).toMatch(/application\/rss\+xml|application\/xml|text\/xml/)

    const body = (await res?.text()) ?? ''
    expect(body.startsWith('<?xml')).toBe(true)
    expect(body).toContain('<rss version="2.0"')
    expect(body).toContain('<channel>')
    expect(body).toContain(POST_TITLE.replace(/&/g, '&amp;'))
    expect(body).toContain(`/blog/${POST_SLUG}/`)

    await ctx.close()
  })
})
