import { expect, test, type Page } from '@playwright/test'

/**
 * M3 golden-path E2E.
 *
 * Hits the real Next.js dev server (see playwright.config.ts webServer).
 * Needs the M2 BE route handlers AND seeded admin credentials. When
 * either is missing the spec is .skip()'d so the rest of the suite stays
 * green.
 *
 *   E2E_ADMIN_EMAIL    — same value as ADMIN_EMAIL in .env.local
 *   E2E_ADMIN_PASSWORD — plaintext that bcrypts to ADMIN_PASSWORD_HASH
 *
 * Flow:
 *   login → New post → fill title → land on edit → use the slash menu to
 *   insert heading H3 + paragraph + FAQ → set role='tldr' on a paragraph
 *   via the inspector → wait for autosave → publish → visit /blog/[slug]
 *   → confirm the rendered HTML carries the right heading levels and the
 *   FAQ <details> element → unpublish → delete (cleanup).
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const hasCreds = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD)

const RUN_TAG = `e2e-m3-${Date.now().toString(36)}`
const POST_TITLE = `M3 Block Editor ${RUN_TAG}`
function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'untitled'
}
const POST_SLUG = slugify(POST_TITLE)

async function signIn(page: Page) {
  await page.context().clearCookies()
  // Pre-set the consent cookie so the privacy banner never renders.
  // Otherwise on a fresh context (no mb_consent) the banner mounts at
  // z-[60] over the lower-right of the page; even though it doesn't
  // visually overlap the editor canvas, it adds focusable buttons to
  // the document and made the M3 spec flake on slow first compiles.
  // addInitScript runs before any page JS so useConsent's
  // useState(() => readConsent()) sees the cookie on first render and
  // <ConsentBanner> short-circuits to null.
  await page.context().addInitScript(() => {
    document.cookie = 'mb_consent=rejected; path=/; SameSite=Lax'
  })
  await page.goto('/admin/login')
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL!)
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/admin\/?$/)
}

async function focusEditor(page: Page) {
  // The Tiptap editor's contentEditable surface is data-testid wrapped by
  // the editor canvas. Clicking lands the caret inside the empty
  // paragraph created on first boot.
  const canvas = page.getByTestId('editor-canvas')
  await canvas.click()
}

async function insertViaSlash(page: Page, type: string) {
  // Type "/" then the block label, press Enter to insert. Keyboard
  // navigation lives in components/admin/editor/slash-menu.tsx.
  await page.keyboard.type('/')
  await page.keyboard.type(type)
  await page.keyboard.press('Enter')
}

test.describe('M3 — block editor + live preview pane golden path', () => {
  test.skip(!hasCreds, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run M3 spec.')
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
        await page.request.delete(`/api/admin/posts/${postId}`, {
          headers: { 'X-CSRF-Token': csrf },
        }).catch(() => undefined)
      }
    } finally {
      await ctx.close()
    }
  })

  test('login → new draft → block editor edits → autosave → publish', async ({ page }) => {
    await signIn(page)

    await page.getByRole('link', { name: /new post/i }).click()
    await expect(page).toHaveURL(/\/admin\/posts\/new$/)

    await page.getByLabel(/^title$/i).fill(POST_TITLE)
    await page.getByRole('button', { name: /create draft/i }).click()
    await expect(page).toHaveURL(/\/admin\/posts\/[0-9a-f-]{36}$/)
    postId = new URL(page.url()).pathname.split('/').pop()
    expect(postId).toMatch(/^[0-9a-f-]{36}$/)

    // Fill the form-level fields so validation is satisfied.
    await page.getByLabel(/author name/i).fill('M3 Tester')
    await page.getByLabel(/^excerpt$/i).fill(`Smoke test ${RUN_TAG}.`)

    await focusEditor(page)

    // Slash-menu insert: heading.
    await insertViaSlash(page, 'heading')
    await page.keyboard.type('Why we shipped')

    // Bump heading level to H3 via the in-NodeView dropdown so the
    // public render emits an <h3>.
    await page.getByLabel(/heading level/i).first().selectOption('3')

    // selectOption leaves focus on the <select>; without restoring the
    // caret to the contentEditable, the next `/` keystroke never
    // reaches editor.view.dom (where slash-menu's keydown listener is
    // bound), the slash menu silently no-ops, and the typed text
    // ("/paragraph", "/faq") lands inside the heading as plain
    // content. Click the heading's text *inside the editor canvas*
    // (the same string also appears in the live preview pane after
    // its 150ms debounce, which would resolve to a non-editable target
    // under strict mode) and End jumps to the line end so the next
    // slash menu opens at the right caret position.
    const canvas = page.getByTestId('editor-canvas')
    await canvas.getByText('Why we shipped').click()
    await page.keyboard.press('End')

    // Slash-menu insert: paragraph. The slash menu's deleteRange +
    // insertContent path inserts the new paragraph as a sibling after
    // the heading and lands the caret inside it — no manual Enter
    // needed (Tiptap's default splitBlock would have created another
    // heading instead of a paragraph).
    await insertViaSlash(page, 'paragraph')
    await page.keyboard.type('We chipped away at the deadline.')

    // Same focus-restoration trick before the FAQ insert. The
    // preview's 150ms debounce has long since fired by now so the
    // bare paragraph text matches in two places.
    await canvas.getByText('We chipped away at the deadline.').click()
    await page.keyboard.press('End')

    // Slash-menu insert: faq (atom — fill the inline inputs).
    await insertViaSlash(page, 'faq')
    await page.getByPlaceholder(/what is geo/i).fill('What are blocks?')
    await page
      .getByPlaceholder(/generative engine/i)
      .fill('Typed JSON nodes the editor and renderer share.')

    // Click the paragraph block and assign role='tldr' via the inspector.
    // Scope to the editor canvas so the live preview's matching paragraph
    // (same text, post-debounce) doesn't trip strict-mode click on a
    // non-editable target.
    await canvas.getByText('We chipped away at the deadline.').click()
    await page.getByLabel(/^block role$/i).selectOption('tldr')

    // Autosave fires 2s after the last edit; wait for the saved indicator.
    await expect(page.getByText(/saved/i).first()).toBeVisible({ timeout: 8_000 })

    // Publish.
    await page.getByRole('button', { name: /^publish$/i }).click()
    await expect(page.getByRole('status', { name: /status: published/i })).toBeVisible()
  })

  test('public /blog/[slug] renders the H3 heading, paragraph, and FAQ <details>', async ({ browser }) => {
    test.skip(!postId, 'Previous step did not produce a post id.')
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    try {
      // ISR may briefly serve a stale render; retry a few times.
      let visible = false
      for (let i = 0; !visible && i < 5; i++) {
        await page.goto(`/blog/${POST_SLUG}`)
        visible = await page.getByRole('heading', { level: 3, name: /why we shipped/i }).isVisible().catch(() => false)
        if (!visible) await page.waitForTimeout(800)
      }
      await expect(page.getByRole('heading', { level: 3, name: /why we shipped/i })).toBeVisible()
      await expect(page.getByText('We chipped away at the deadline.')).toBeVisible()
      // FAQ block renders as <details><summary>question</summary>answer</details>.
      await expect(page.locator('details summary', { hasText: /what are blocks/i })).toBeVisible()
    } finally {
      await ctx.close()
    }
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
