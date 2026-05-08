import { expect, test, type BrowserContext, type Page, type Request } from '@playwright/test'

/**
 * M9-C golden-path E2E.
 *
 * Verifies the geo-variant authoring UI added in M9-C:
 *   1. Variant tab persistence: clicking US flips
 *      localStorage[`mb.editor.variant.<id>`] to "US" and survives reload.
 *   2. OVERRIDES BASE chip + Reset: typing on a variant tab surfaces the
 *      override chip; Reset clears it without touching the base title.
 *   3. Other-region preservation: editing US then EU via the form keeps
 *      both region payloads in the same PATCH body (asserted by sniffing
 *      the network request) and round-trips across a reload.
 *   4. Public route variant resolution: a published post with both
 *      variants returns the correct overlay title in <title>/<h1>
 *      depending on x-vercel-ip-country. The canonical <link> is
 *      identical across regions (same URL, different overlay).
 *   5. Dashboard chip row: /admin renders `variant-chip-US` and
 *      `variant-chip-EU` testids when the post carries variants; both
 *      disappear after the regions are wiped via a PATCH.
 *
 * Same env-gate pattern as M3/M4/M5/M9-AEO/M9-GEO specs: skip cleanly
 * when admin creds are absent so the suite stays green on machines
 * without a seeded admin DB.
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const hasCreds = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD)

const RUN_TAG = `e2e-m9c-${Date.now().toString(36)}`
const BASE_TITLE = `M9-C ${RUN_TAG} — base title`
const US_TITLE = `M9-C ${RUN_TAG} — US headline`
const EU_TITLE = `M9-C ${RUN_TAG} — EU headline`

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'untitled'
  )
}
const POST_SLUG = slugify(BASE_TITLE)

const CONTENT_JSON = [
  { id: 'h-1', type: 'heading',   data: { text: 'Variant smoke heading', level: 2 } },
  { id: 'p-1', type: 'paragraph', data: { text: `Variant smoke body for ${RUN_TAG}.` } },
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

test.describe('M9-C — geo-variant authoring UI', () => {
  test.skip(!hasCreds, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run M9-C spec.')
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

  test('seed a post + variant tab persists across reload', async ({ page }) => {
    await signIn(page)

    await page.getByRole('link', { name: /new post/i }).click()
    await page.getByLabel(/^title$/i).fill(BASE_TITLE)
    await page.getByRole('button', { name: /create draft/i }).click()
    await expect(page).toHaveURL(/\/admin\/posts\/[0-9a-f-]{36}$/)
    postId = new URL(page.url()).pathname.split('/').pop()
    expect(postId).toMatch(/^[0-9a-f-]{36}$/)

    // Seed body so /blog/[slug] renders something — the spec doesn't
    // care about block content, only that the post is publishable.
    const cookies = await page.context().cookies()
    const csrf = cookies.find((c) => c.name === 'mb_csrf')!.value
    const seedRes = await page.request.patch(`/api/admin/posts/${postId}`, {
      headers: { 'X-CSRF-Token': csrf },
      data: {
        content_json: CONTENT_JSON,
        author_name: 'M9-C Tester',
        excerpt: `Variant smoke ${RUN_TAG}.`,
        tags: ['e2e', 'm9c'],
      },
    })
    expect(seedRes.status()).toBe(200)
    await page.reload()

    // Default tab is Base (sentinel value 'OTHER').
    const variantKey = `mb.editor.variant.${postId}`
    const initialKey = await page.evaluate((k) => localStorage.getItem(k), variantKey)
    expect(initialKey).toBe('OTHER')

    // Click US → tab becomes selected, localStorage flips to "US".
    await page.getByRole('tab', { name: /^US$/ }).click()
    await expect(page.getByRole('tab', { name: /^US$/ })).toHaveAttribute('aria-selected', 'true')
    await expect.poll(
      async () => page.evaluate((k) => localStorage.getItem(k), variantKey),
      { timeout: 2_000 },
    ).toBe('US')

    // Reload → US tab is re-selected from localStorage.
    await page.reload()
    await expect(page.getByRole('tab', { name: /^US$/ })).toHaveAttribute('aria-selected', 'true')
  })

  test('override chip + Reset to base preserves the base title', async ({ page }) => {
    test.skip(!postId, 'Earlier seed step did not produce a post id.')
    await signIn(page)
    await page.goto(`/admin/posts/${postId}`)
    await page.getByRole('tab', { name: /^US$/ }).click()

    // Type a US-only title; the override chip surfaces immediately.
    await page.getByLabel(/^title$/i).fill(US_TITLE)
    await expect(page.getByTestId('override-chip-f-title')).toBeVisible()

    // Reset clears the chip + the input on the variant tab.
    await page.getByTestId('reset-override-f-title').click()
    await expect(page.getByTestId('override-chip-f-title')).toHaveCount(0)
    await expect(page.getByLabel(/^title$/i)).toHaveValue('')

    // Switch to Base — the original base title is intact.
    await page.getByRole('tab', { name: /^Base$/ }).click()
    await expect(page.getByLabel(/^title$/i)).toHaveValue(BASE_TITLE)
  })

  test('autosave on US then EU keeps both region payloads in the PATCH body', async ({ page }) => {
    test.skip(!postId, 'Earlier seed step did not produce a post id.')
    await signIn(page)
    await page.goto(`/admin/posts/${postId}`)

    // Capture every PATCH body for this post id; the assertion looks
    // at the latest one (the EU edit) which must include both regions.
    const patchBodies: Array<Record<string, unknown>> = []
    function onRequest(req: Request) {
      if (req.method() !== 'PATCH') return
      if (!req.url().includes(`/api/admin/posts/${postId}`)) return
      const body = req.postData()
      if (!body) return
      try { patchBodies.push(JSON.parse(body) as Record<string, unknown>) } catch {}
    }
    page.on('request', onRequest)

    try {
      // Edit US title → explicit Save (skips autosave debounce).
      await page.getByRole('tab', { name: /^US$/ }).click()
      await page.getByLabel(/^title$/i).fill(US_TITLE)
      await page.getByRole('button', { name: /^save$/i }).click()
      await expect(page.locator('text=/saved\\s+just now|saved\\s+\\d/i').first())
        .toBeVisible({ timeout: 8_000 })

      // Edit EU title → explicit Save.
      await page.getByRole('tab', { name: /^EU$/ }).click()
      await page.getByLabel(/^title$/i).fill(EU_TITLE)
      await page.getByRole('button', { name: /^save$/i }).click()
      await expect(page.locator('text=/saved\\s+just now|saved\\s+\\d/i').first())
        .toBeVisible({ timeout: 8_000 })
    } finally {
      page.off('request', onRequest)
    }

    expect(patchBodies.length).toBeGreaterThanOrEqual(2)
    const lastPatch = patchBodies[patchBodies.length - 1]
    const variants = (lastPatch.geo_variants ?? {}) as Record<string, { title?: string }>
    expect(variants.US?.title).toBe(US_TITLE)
    expect(variants.EU?.title).toBe(EU_TITLE)

    // Reload the editor — both region overlays survived the round-trip.
    await page.reload()
    await page.getByRole('tab', { name: /^US$/ }).click()
    await expect(page.getByLabel(/^title$/i)).toHaveValue(US_TITLE)
    await page.getByRole('tab', { name: /^EU$/ }).click()
    await expect(page.getByLabel(/^title$/i)).toHaveValue(EU_TITLE)
  })

  test('public route variant resolution: US/DE/no-header overlay the right title', async ({ page, browser }) => {
    test.skip(!postId, 'Earlier seed step did not produce a post id.')
    // Publish the post. The publish button is on the editor page.
    await signIn(page)
    await page.goto(`/admin/posts/${postId}`)
    await page.getByRole('button', { name: /^publish$/i }).click()
    await expect(page.getByRole('status', { name: /status: published/i })).toBeVisible()

    // Use a fresh request context so the admin session cookie isn't
    // carried into the public route — the resolver only reads the
    // x-vercel-ip-country header anyway, but a clean client makes the
    // intent obvious.
    const ctx: BrowserContext = await browser.newContext()
    try {
      // Some test runs hit a stale cache window after publish; retry up
      // to 5x at 500ms intervals to let revalidatePath catch up.
      async function fetchWithRetry(headers: Record<string, string>) {
        for (let i = 0; i < 5; i++) {
          const res = await ctx.request.get(`/blog/${POST_SLUG}/`, { headers })
          if (res.status() === 200) return res
          await new Promise((r) => setTimeout(r, 500))
        }
        return ctx.request.get(`/blog/${POST_SLUG}/`, { headers })
      }

      const usRes = await fetchWithRetry({ 'x-vercel-ip-country': 'US' })
      expect(usRes.status()).toBe(200)
      const usHtml = await usRes.text()
      expect(usHtml).toContain(US_TITLE)
      expect(usHtml).not.toContain(BASE_TITLE)

      const euRes = await fetchWithRetry({ 'x-vercel-ip-country': 'DE' })
      expect(euRes.status()).toBe(200)
      const euHtml = await euRes.text()
      expect(euHtml).toContain(EU_TITLE)
      expect(euHtml).not.toContain(BASE_TITLE)

      const baseRes = await fetchWithRetry({})
      expect(baseRes.status()).toBe(200)
      const baseHtml = await baseRes.text()
      expect(baseHtml).toContain(BASE_TITLE)
      expect(baseHtml).not.toContain(US_TITLE)
      expect(baseHtml).not.toContain(EU_TITLE)

      // Canonical <link> is identical across regions — variants share
      // one URL per PRD §5.6 to avoid SEO duplication.
      const canonicalRe = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/
      const usCanon = canonicalRe.exec(usHtml)?.[1]
      const euCanon = canonicalRe.exec(euHtml)?.[1]
      const baseCanon = canonicalRe.exec(baseHtml)?.[1]
      expect(usCanon).toBeTruthy()
      expect(usCanon).toBe(euCanon)
      expect(usCanon).toBe(baseCanon)
    } finally {
      await ctx.close()
    }
  })

  test('dashboard chip row reflects geo_variant_regions and clears after a wipe', async ({ page }) => {
    test.skip(!postId, 'Earlier seed step did not produce a post id.')
    await signIn(page)
    await page.goto('/admin')

    // Both chips should be present for our post (the only one with that slug).
    // Scope to the row that links to our post id to avoid colliding with
    // any other variant-bearing seed posts the suite may have left.
    const row = page.locator('li').filter({ has: page.locator(`a[href="/admin/posts/${postId}"]`) })
    await expect(row).toHaveCount(1)
    await expect(row.getByTestId('variant-chip-US')).toBeVisible()
    await expect(row.getByTestId('variant-chip-EU')).toBeVisible()

    // Wipe both regions via a direct PATCH (faster than driving Reset
    // through the editor twice; the form-level happy-dom test already
    // covers the Reset → empty-region prune path end-to-end).
    const cookies = await page.context().cookies()
    const csrf = cookies.find((c) => c.name === 'mb_csrf')!.value
    const wipeRes = await page.request.patch(`/api/admin/posts/${postId}`, {
      headers: { 'X-CSRF-Token': csrf },
      data: { geo_variants: {} },
    })
    expect(wipeRes.status()).toBe(200)

    await page.reload()
    const rowAfter = page.locator('li').filter({ has: page.locator(`a[href="/admin/posts/${postId}"]`) })
    await expect(rowAfter.getByTestId('variant-chip-US')).toHaveCount(0)
    await expect(rowAfter.getByTestId('variant-chip-EU')).toHaveCount(0)
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
