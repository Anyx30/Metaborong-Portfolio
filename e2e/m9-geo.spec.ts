import { expect, test, type BrowserContext, type Page } from '@playwright/test'

/**
 * M9-GEO golden-path E2E.
 *
 * Verifies the generative-engine optimization surface added in M9-GEO:
 *   1. Homepage `<head>` carries a <link rel="alternate" type="text/plain"
 *      href=".../llms.txt"> hinting at the LLM-readable index.
 *   2. /blog/[slug] `<head>` carries a <link rel="alternate"
 *      type="text/markdown" href=".../raw.md"> pointing at the per-post
 *      markdown rendition.
 *   3. /llms.txt returns text/plain and contains the "## Posts" section
 *      header from the llmstxt.org-format index.
 *   4. /llms-full.txt returns text/plain and includes at least one
 *      "### " post heading (proves post bodies are inlined).
 *   5. /blog listing surfaces a low-emphasis "LLMs.txt" link beside RSS.
 *
 * Same env-gate pattern as M5/M9-AEO: skip when admin creds are absent
 * so unit tests stay green without a seeded admin DB.
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const hasCreds = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD)

const RUN_TAG = `e2e-m9geo-${Date.now().toString(36)}`
const POST_TITLE = `M9 ${RUN_TAG} — GEO smoke`
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

// A heading + paragraph is enough to make /llms-full.txt emit a "### "
// block for this post. The /llms.txt index emits its own bullet line
// for every published post regardless of body content.
const CONTENT_JSON = [
  { id: 'h-1', type: 'heading',   data: { text: 'GEO smoke heading', level: 2 } },
  { id: 'p-1', type: 'paragraph', data: { text: `GEO smoke body for ${RUN_TAG}.` } },
]

async function signIn(page: Page) {
  await page.context().clearCookies()
  await page.context().addInitScript(() => {
    document.cookie = 'mb_consent=rejected; path=/; SameSite=Lax'
  })
  await page.goto('/admin/login')
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL!)
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/admin\/?$/)
}

test.describe('M9-GEO — llms.txt + markdown alternate links', () => {
  test.skip(!hasCreds, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run M9-GEO spec.')
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

  test('seed + publish a post for the GEO surface', async ({ page }) => {
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
        excerpt: `GEO smoke ${RUN_TAG}.`,
        tags: ['e2e', 'geo'],
      },
    })
    expect(patchRes.status()).toBe(200)
    await page.reload()

    await page.getByRole('button', { name: /^publish$/i }).click()
    await expect(page.getByRole('status', { name: /status: published/i })).toBeVisible()
  })

  test('homepage <head> carries <link rel="alternate" type="text/plain" href=".../llms.txt">', async ({ browser }) => {
    const ctx: BrowserContext = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/')

    const link = page.locator('link[rel="alternate"][type="text/plain"]')
    await expect(link).toHaveCount(1)
    // metadataBase absolutizes the relative `/llms.txt` value to the
    // production origin; match the suffix to keep the assertion stable
    // whether it's served absolute or relative.
    await expect(link).toHaveAttribute('href', /\/llms\.txt$/)

    await ctx.close()
  })

  test('/blog/[slug] <head> carries <link rel="alternate" type="text/markdown" href=".../raw.md">', async ({ browser }) => {
    test.skip(!postId, 'Seed step did not produce a post id.')
    const ctx: BrowserContext = await browser.newContext()
    const page = await ctx.newPage()

    let attempts = 0
    while (attempts < 5) {
      const res = await page.goto(`/blog/${POST_SLUG}`)
      if (res && res.status() === 200) break
      attempts++
      await page.waitForTimeout(500)
    }

    const link = page.locator('link[rel="alternate"][type="text/markdown"]')
    await expect(link).toHaveCount(1)
    await expect(link).toHaveAttribute(
      'href',
      new RegExp(`/blog/${POST_SLUG}/raw\\.md$`),
    )

    await ctx.close()
  })

  test('GET /llms.txt is text/plain and contains "## Posts"', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    const res = await page.goto('/llms.txt')
    expect(res?.status()).toBe(200)
    const ct = res?.headers()['content-type'] ?? ''
    expect(ct).toMatch(/text\/plain/)

    const body = (await res?.text()) ?? ''
    expect(body).toContain('## Posts')

    await ctx.close()
  })

  test('GET /llms-full.txt is text/plain and includes at least one "### " post heading', async ({ browser }) => {
    test.skip(!postId, 'Seed step did not produce a post id (no post block expected).')
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    const res = await page.goto('/llms-full.txt')
    expect(res?.status()).toBe(200)
    const ct = res?.headers()['content-type'] ?? ''
    expect(ct).toMatch(/text\/plain/)

    const body = (await res?.text()) ?? ''
    // `### ` at the start of a line proves at least one post block was
    // inlined (the per-post title heading).
    expect(body).toMatch(/^### /m)

    await ctx.close()
  })

  test('/blog listing renders a low-emphasis "LLMs.txt" link beside RSS', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/blog')

    const llmsLink = page.getByRole('link', { name: /llm-readable index/i })
    await expect(llmsLink).toBeVisible()
    await expect(llmsLink).toHaveAttribute('href', '/llms.txt')

    // Confirms the LLMs.txt link sits in the same header block as the
    // RSS link rather than tucked into the footer or a sidebar.
    const rssLink = page.getByRole('link', { name: /subscribe to the rss feed/i })
    await expect(rssLink).toBeVisible()

    await ctx.close()
  })

  test('cleanup: unpublish + delete', async ({ page }) => {
    test.skip(!postId, 'No post id from earlier steps.')
    await signIn(page)
    await page.goto(`/admin/posts/${postId}`)
    await page.getByRole('button', { name: /^unpublish$/i }).click()
    await expect(page.getByRole('status', { name: /status: draft/i })).toBeVisible()
    await page.getByRole('button', { name: /^delete$/i }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel(/type the slug/i).fill(POST_SLUG)
    await dialog.getByRole('button', { name: /^delete$/i }).click()
    await expect(page).toHaveURL(/\/admin\/?$/)
  })
})
