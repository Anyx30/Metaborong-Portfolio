import { expect, test, type BrowserContext, type Page } from '@playwright/test'

/**
 * M9-AEO golden-path E2E.
 *
 * Verifies the answer-engine optimization JSON-LD bundle wired in M9-AEO:
 * a published post with the right block roles emits FAQPage, HowTo, and
 * Speakable JSON-LD on top of the M5-core Article + BreadcrumbList — five
 * <script type="application/ld+json"> tags in total. Each parses as
 * valid JSON and carries the expected @type.
 *
 * Same env-gate pattern as M3/M4/M5 specs:
 *   E2E_ADMIN_EMAIL    — same value as ADMIN_EMAIL in .env.local
 *   E2E_ADMIN_PASSWORD — plaintext that bcrypts to ADMIN_PASSWORD_HASH
 *
 * When either is missing the spec is .skip()'d so unit tests stay green
 * and CI doesn't need a seeded admin DB to pass.
 *
 * The post is seeded by PATCHing content_json directly via the admin API
 * (same approach as e2e/m5-core-seo.spec.ts) rather than driving the
 * editor + inspector for each role assignment — the editor + inspector
 * paths are covered by e2e/m3-block-editor.spec.ts; here we only care
 * about the JSON-LD wiring on the public surface.
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const hasCreds = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD)

const RUN_TAG = `e2e-m9-${Date.now().toString(36)}`
const POST_TITLE = `M9 ${RUN_TAG} — AEO smoke`
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

// Heading + tldr paragraph + 3 step paragraphs + 1 faq. The trigger
// matrix exercised here:
//   · faq blocks > 0          → faqPageSchema returns FAQPage
//   · step-role blocks ≥ 3    → howToSchema returns HowTo (3 steps)
//   · tldr|intro role present → speakableSchema returns WebPage/Speakable
const CONTENT_JSON = [
  { id: 'h-1', type: 'heading',   data: { text: 'How to deploy in three steps', level: 2 } },
  { id: 't-1', type: 'paragraph', role: 'tldr', data: { text: 'Three short steps from zero to a published post on the production network.' } },
  { id: 's-1', type: 'paragraph', role: 'step', data: { text: 'First, write the post in the admin editor.' } },
  { id: 's-2', type: 'paragraph', role: 'step', data: { text: 'Then, hit publish to flip the status flag.' } },
  { id: 's-3', type: 'paragraph', role: 'step', data: { text: 'Finally, share the canonical URL.' } },
  { id: 'q-1', type: 'faq',       data: { question: 'How long does the e2e cycle take?', answer: 'About a minute on a warm dev server.' } },
]

async function signIn(page: Page) {
  await page.context().clearCookies()
  // Same fix as the M3/M4 specs — pre-set the consent cookie so the
  // privacy banner never mounts and never adds focusable buttons that
  // could intercept clicks during editor / publish flows.
  await page.context().addInitScript(() => {
    document.cookie = 'mb_consent=rejected; path=/; SameSite=Lax'
  })
  await page.goto('/admin/login')
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL!)
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/admin\/?$/)
}

test.describe('M9-AEO — FAQPage / HowTo / Speakable JSON-LD on /blog/[slug]', () => {
  test.skip(!hasCreds, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run M9-AEO spec.')
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

  test('seed + publish a post with faq + 3 steps + tldr', async ({ page }) => {
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
        excerpt: `AEO smoke ${RUN_TAG}.`,
        tags: ['e2e', 'aeo'],
      },
    })
    expect(patchRes.status()).toBe(200)
    await page.reload()

    await page.getByRole('button', { name: /^publish$/i }).click()
    await expect(page.getByRole('status', { name: /status: published/i })).toBeVisible()
  })

  test('public /blog/[slug] inlines all 5 JSON-LD scripts (Article + Breadcrumb + FAQPage + HowTo + Speakable)', async ({ browser }) => {
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
    expect(scripts.length, 'expected exactly 5 JSON-LD scripts (Article + Breadcrumb + FAQPage + HowTo + Speakable)').toBe(5)

    const parsed = await Promise.all(
      scripts.map(async (s) => JSON.parse((await s.textContent()) ?? 'null') as Record<string, unknown>),
    )
    const types = parsed.map((p) => p?.['@type'])
    expect(types).toContain('Article')
    expect(types).toContain('BreadcrumbList')
    expect(types).toContain('FAQPage')
    expect(types).toContain('HowTo')
    // Speakable rides on a top-level WebPage shape per schema.org.
    expect(types).toContain('WebPage')

    const faqPage = parsed.find((p) => p['@type'] === 'FAQPage')!
    const mainEntity = faqPage.mainEntity as Array<Record<string, unknown>>
    expect(mainEntity).toHaveLength(1)
    expect(mainEntity[0].name).toBe('How long does the e2e cycle take?')

    const howTo = parsed.find((p) => p['@type'] === 'HowTo')!
    const steps = howTo.step as Array<Record<string, unknown>>
    expect(steps).toHaveLength(3)
    expect(steps.map((s) => s.position)).toEqual([1, 2, 3])

    const webPage = parsed.find((p) => p['@type'] === 'WebPage')!
    const spec = webPage.speakable as Record<string, unknown>
    expect(spec['@type']).toBe('SpeakableSpecification')
    expect(spec.cssSelector).toEqual(['[data-block-id="t-1"]'])

    // Spot-check that the rendered DOM actually carries the
    // data-block-id attributes Speakable references.
    await expect(page.locator('[data-block-id="t-1"]')).toBeVisible()
    await expect(page.locator('[data-block-id="s-1"]')).toBeVisible()

    await context.close()
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
