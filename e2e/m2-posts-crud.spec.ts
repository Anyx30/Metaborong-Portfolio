import { expect, test, type BrowserContext, type Page } from '@playwright/test'

/**
 * M2 golden-path E2E.
 *
 * Hits the real Next.js dev server (see playwright.config.ts webServer).
 * Needs the BE M2 route handlers (/api/admin/posts/**) AND seeded admin
 * credentials. When either is missing the spec is .skip()'d so M1 runs
 * stay green.
 *
 *   E2E_ADMIN_EMAIL    — same value as ADMIN_EMAIL in .env.local
 *   E2E_ADMIN_PASSWORD — plaintext that bcrypts to ADMIN_PASSWORD_HASH
 *
 * Flow:
 *   login → New post → fill title → land on edit → seed content_json /
 *   author / excerpt via the admin PATCH API → Publish → public render
 *   in incognito → admin Unpublish → refresh public → expect 404 →
 *   Delete → confirm modal → dashboard shows zero of that slug.
 *
 * Why API instead of typing in the editor: M3 replaced the content
 * <textarea> with the Tiptap-backed <EditorShell />. Editor UX (slash
 * menu, node views, autosave, etc) is covered end-to-end by
 * e2e/m3-block-editor.spec.ts; this spec only needs server-side state
 * to verify publish + public render + unpublish + delete, so we PATCH
 * the row directly.
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const hasCreds = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD)

// A unique title per run avoids slug collisions when the spec is repeated
// against a long-lived dev DB.
const RUN_TAG = `e2e-${Date.now().toString(36)}`
const POST_TITLE = `E2E ${RUN_TAG} — Field notes`
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled'
}
const POST_SLUG = slugify(POST_TITLE)

const VALID_CONTENT = JSON.stringify(
  [
    { id: 'h1', type: 'heading',   data: { text: 'Why we shipped',  level: 2 } },
    { id: 'p1', type: 'paragraph', data: { text: 'Because the deadline was real.' } },
    { id: 'k1', type: 'key-takeaway', data: { text: 'Real deadlines beat perfect specs.' } },
  ],
  null,
  2,
)

async function signIn(page: Page) {
  await page.context().clearCookies()
  await page.goto('/admin/login')
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL!)
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/admin\/?$/)
}

test.describe('M2 — posts CRUD golden path', () => {
  test.skip(!hasCreds, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run M2 CRUD spec.')
  // The whole flow is one long sequence — keep workers: 1 (configured at
  // playwright.config.ts) so cookie + DB state doesn't collide across tests.
  test.describe.configure({ mode: 'serial' })

  let postId: string | undefined

  // Best-effort cleanup so a mid-suite failure can't leak a post into the
  // dev DB (which would make the M1 "no posts yet" assumption fail on the
  // next run). Uses the API directly with a fresh login + CSRF cookie.
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
      // Hand the request the mb_csrf cookie that login just issued.
      const cookies = await ctx.cookies()
      const csrf = cookies.find((c) => c.name === 'mb_csrf')?.value
      if (csrf) {
        await page.request.delete(`/api/admin/posts/${postId}`, {
          headers: { 'X-CSRF-Token': csrf },
        }).catch(() => undefined)
      }
    } finally {
      await ctx.close()
    }
  })

  test('login → new draft → edit → save → publish', async ({ page }) => {
    await signIn(page)

    await page.getByRole('link', { name: /new post/i }).click()
    await expect(page).toHaveURL(/\/admin\/posts\/new$/)

    await page.getByLabel(/^title$/i).fill(POST_TITLE)
    await page.getByRole('button', { name: /create draft/i }).click()

    await expect(page).toHaveURL(/\/admin\/posts\/[0-9a-f-]{36}$/)
    const url = new URL(page.url())
    const segments = url.pathname.split('/')
    postId = segments[segments.length - 1]
    expect(postId).toMatch(/^[0-9a-f-]{36}$/)

    // Seed content_json + author + excerpt directly via PATCH. The M3
    // editor owns its own UI tests; here we only need the row in DB to
    // be publishable so the public render + unpublish + delete steps
    // below have something real to chew on.
    const cookies = await page.context().cookies()
    const csrf = cookies.find((c) => c.name === 'mb_csrf')?.value
    expect(csrf, 'login should have set the mb_csrf cookie').toBeTruthy()
    const patchRes = await page.request.patch(`/api/admin/posts/${postId}`, {
      headers: { 'X-CSRF-Token': csrf! },
      data: {
        content_json: JSON.parse(VALID_CONTENT),
        author_name: 'E2E Test',
        excerpt: `Smoke check ${RUN_TAG}.`,
      },
    })
    expect(patchRes.status(), `PATCH /api/admin/posts/${postId} should 200`).toBe(200)

    // Reload so the editor hydrates from the patched row before publish.
    // Without this, the Tiptap autosave loop could overwrite content_json
    // with whatever the editor mounted with (empty doc) on debounce.
    await page.reload()

    await page.getByRole('button', { name: /^publish$/i }).click()
    await expect(page.getByRole('status', { name: /status: published/i })).toBeVisible()
  })

  test('public /blog/[slug] renders the published post, /blog lists it', async ({ browser }) => {
    test.skip(!postId, 'Previous step did not produce a post id — see prior failure.')

    const context: BrowserContext = await browser.newContext()
    const page = await context.newPage()
    const titleRegex = new RegExp(POST_TITLE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

    // Slug page first — single-route revalidation lands fastest after
    // publish (BE calls revalidatePath('/blog/<slug>', 'page')).
    await page.goto(`/blog/${POST_SLUG}`)
    await expect(page.getByRole('heading', { level: 1, name: titleRegex })).toBeVisible()
    await expect(page.getByText('Why we shipped')).toBeVisible()
    await expect(page.getByText('Real deadlines beat perfect specs.')).toBeVisible()

    // Listing page can lag the ISR window briefly; hard-reload up to a
    // few times before failing.
    await page.goto('/blog')
    const link = page.getByRole('link', { name: titleRegex })
    let visible = await link.isVisible().catch(() => false)
    for (let i = 0; !visible && i < 5; i++) {
      await page.waitForTimeout(800)
      await page.reload()
      visible = await link.isVisible().catch(() => false)
    }
    await expect(link).toBeVisible({ timeout: 5_000 })

    await context.close()
  })

  test('admin unpublish → public /blog/[slug] returns 404', async ({ page, browser }) => {
    test.skip(!postId, 'No post id from earlier steps.')

    await signIn(page)
    await page.goto(`/admin/posts/${postId}`)
    await page.getByRole('button', { name: /^unpublish$/i }).click()
    await expect(page.getByRole('status', { name: /status: draft/i })).toBeVisible()

    const context = await browser.newContext()
    const publicPage = await context.newPage()

    // Public route may briefly serve the cached published render — retry
    // a few times before failing.
    let status = 200
    for (let i = 0; status !== 404 && i < 6; i++) {
      const res = await publicPage.goto(`/blog/${POST_SLUG}`, { waitUntil: 'domcontentloaded' })
      status = res?.status() ?? 0
      if (status !== 404) await publicPage.waitForTimeout(800)
    }
    expect(status).toBe(404)
    await context.close()
  })

  test('admin delete → dashboard list no longer contains the slug', async ({ page }) => {
    test.skip(!postId, 'No post id from earlier steps.')

    await signIn(page)
    await page.goto(`/admin/posts/${postId}`)

    await page.getByRole('button', { name: /^delete$/i }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel(/type the slug/i).fill(POST_SLUG)
    await dialog.getByRole('button', { name: /^delete$/i }).click()

    await expect(page).toHaveURL(/\/admin\/?$/)
    await expect(page.getByText(`/${POST_SLUG}`)).not.toBeVisible()
  })
})
