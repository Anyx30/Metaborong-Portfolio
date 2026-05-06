import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'

/**
 * M4 golden-path E2E.
 *
 * Login → New post → fill title → land on edit → open the cover image
 * picker → upload e2e/fixtures/test-image.png → set alt → Use → cover
 * preview shows → save → publish → visit /blog/[slug] → confirm cover
 * renders via next/image (its `<img srcSet>` is the giveaway).
 *
 * Gated on E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD just like M3.
 *
 * Also gated on BLOB_READ_WRITE_TOKEN being present in the dev server's
 * environment — without it /api/admin/images POST returns 502 from
 * @vercel/blob and the spec can't make progress. The skip guards keep
 * the rest of the suite green when running on a machine without Blob
 * credentials.
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const hasCreds = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD)

const FIXTURE_PATH = path.resolve(__dirname, 'fixtures/test-image.png')

const RUN_TAG = `e2e-m4-${Date.now().toString(36)}`
const POST_TITLE = `M4 Images ${RUN_TAG}`
function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'untitled'
}
const POST_SLUG = slugify(POST_TITLE)

async function signIn(page: Page) {
  await page.context().clearCookies()
  // Same fix as the M3 spec — pre-set the consent cookie so the privacy
  // banner never mounts and the picker's focus trap is the only modal in
  // the document.
  await page.context().addInitScript(() => {
    document.cookie = 'mb_consent=rejected; path=/; SameSite=Lax'
  })
  await page.goto('/admin/login')
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL!)
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/admin\/?$/)
}

test.describe('M4 — image picker + cover/og + inline image block', () => {
  test.skip(!hasCreds, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run M4 spec.')
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

  test('login → new draft → upload cover via picker → publish', async ({ page }) => {
    await signIn(page)

    await page.getByRole('link', { name: /new post/i }).click()
    await expect(page).toHaveURL(/\/admin\/posts\/new$/)

    await page.getByLabel(/^title$/i).fill(POST_TITLE)
    await page.getByRole('button', { name: /create draft/i }).click()
    await expect(page).toHaveURL(/\/admin\/posts\/[0-9a-f-]{36}$/)
    postId = new URL(page.url()).pathname.split('/').pop()
    expect(postId).toMatch(/^[0-9a-f-]{36}$/)

    // Form fields.
    await page.getByLabel(/author name/i).fill('M4 Tester')
    await page.getByLabel(/^excerpt$/i).fill(`Image picker smoke test ${RUN_TAG}.`)

    // Open the cover picker.
    await page.getByRole('button', { name: /choose cover image/i }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute('aria-modal', 'true')

    // Switch to Upload tab and pick the fixture.
    await dialog.getByRole('tab', { name: /upload/i }).click()
    const fileInput = dialog.locator('input[type="file"]')
    await fileInput.setInputFiles(FIXTURE_PATH)

    // Alt is required → Use button stays disabled until we type.
    const useBtn = dialog.getByRole('button', { name: /^use$/i })
    await expect(useBtn).toBeVisible({ timeout: 15_000 })
    await expect(useBtn).toBeDisabled()

    await dialog.getByLabel(/alt text/i).fill('A 1x1 fixture image')
    await expect(useBtn).toBeEnabled()
    await useBtn.click()

    // Picker closes; cover preview appears with Change/Remove.
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('button', { name: /^change$/i }).first()).toBeVisible()

    // Save + publish.
    await expect(page.getByText(/saved|unsaved/i).first()).toBeVisible({ timeout: 8_000 })
    await page.getByRole('button', { name: /^publish$/i }).click()
    await expect(page.getByRole('status', { name: /status: published/i })).toBeVisible()
  })

  test('public /blog/[slug] renders the cover via next/image', async ({ browser }) => {
    test.skip(!postId, 'Previous step did not produce a post id.')
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    try {
      let cover = false
      for (let i = 0; !cover && i < 5; i++) {
        await page.goto(`/blog/${POST_SLUG}`)
        cover = await page.locator('img[alt="A 1x1 fixture image"], img[src*="vercel-storage.com"]').first().isVisible().catch(() => false)
        if (!cover) await page.waitForTimeout(800)
      }
      // next/image emits a srcSet; assert that at least one image on the
      // page is sourced from the Vercel Blob domain (the cover row).
      const blobImg = page.locator('img[src*="vercel-storage.com"]').first()
      await expect(blobImg).toBeVisible()
      const srcset = await blobImg.getAttribute('srcset')
      expect(srcset).toBeTruthy()
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
    const dialog = page.getByRole('dialog', { name: /delete this post/i })
    await dialog.getByLabel(/type the slug/i).fill(POST_SLUG)
    await dialog.getByRole('button', { name: /^delete$/i }).click()
    await expect(page).toHaveURL(/\/admin\/?$/)
  })
})
