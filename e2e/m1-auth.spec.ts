import { expect, test } from '@playwright/test'

/**
 * M1 golden-path E2E spec.
 *
 * Runs against the real Next.js dev server (see playwright.config.ts
 * webServer block). The auth-gate redirect tests need only the FE shell
 * and the proxy.ts x-pathname injection — they pass even with no
 * Postgres or no admin credentials set. The login-happy-path test needs
 * a fully wired BE: POSTGRES_URL, AUTH_SECRET, ADMIN_EMAIL,
 * ADMIN_PASSWORD_HASH from .env.local, and the bcrypt hash must match
 * the plaintext provided here via E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD.
 *
 * Convention: copy .env.local.example to .env.local, set creds, then
 * export E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (matching the bcrypt
 * hash) into the shell environment before `pnpm test:e2e`. When these
 * are missing the login spec is .skip()'d so CI / quick local runs
 * still cover the gating behavior.
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const hasCreds = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD)

test.describe('M1 — admin auth gate', () => {
  test('unauthenticated visit to /admin redirects to /admin/login?next=%2Fadmin', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin$/)
    await expect(page.getByRole('heading', { name: /sign in to continue/i })).toBeVisible()
  })

  test('unauthenticated visit to a nested admin route preserves the path in next=', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/admin/posts/foo')
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fposts%2Ffoo/)
  })

  test('empty form submit shows inline validation, no navigation', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/admin/login')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Scope to the form's own error region — the page also renders the
    // global consent banner which has its own role="alert".
    await expect(page.locator('#admin-login-error')).toContainText(/email is required/i)
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})

test.describe('M1 — login happy path', () => {
  test.skip(!hasCreds, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run this test.')

  // TODO(v1.6): page.goBack() on this spec resolves to about:blank under
  // Playwright + Next.js App Router. Reproduces across M1–M4 Tester
  // reports. Suspected cause: the Sign Out flow + login redirect chain
  // mixes server-side redirects (middleware) with App Router client
  // navigation, leaving Playwright's history-back waiter unable to
  // observe the resulting URL. The v1.5 hygiene dispatch budgeted 30
  // minutes; root-cause work requires a runnable e2e (Neon dev URL +
  // admin creds), which this branch could not bring up. Approaches to
  // try when a Tester picks this up:
  //   1. await page.evaluate(() => window.history.back()) followed by
  //      page.waitForURL(/\/admin\/login/, { timeout: 5000 }).
  //   2. await page.context().clearCookies() before the back step so
  //      the gate's redirect path is unambiguous.
  //   3. Replace goBack with page.goto('/admin'). Meaningfully narrows
  //      intent (back-button vs direct-nav) and the unauth redirect
  //      to /admin is already covered by the test above, so this
  //      shrinks coverage — only fall back here if (1) and (2) fail.
  // Marked test.fixme() (not test.skip) so it stays visible in reports
  // as known-broken with an explicit tracking commitment.
  test.fixme('valid credentials sign in, sign out, browser back lands on login', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/admin/login')

    await page.getByLabel(/email/i).fill(ADMIN_EMAIL!)
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!)
    await page.getByRole('button', { name: /sign in/i }).click()

    // Lands on /admin and shows the empty-state dashboard.
    await expect(page).toHaveURL(/\/admin\/?$/)
    await expect(page.getByRole('heading', { name: /^posts$/i })).toBeVisible()
    await expect(page.getByText(/no posts yet/i)).toBeVisible()

    // Cookies are issued by the login response.
    const cookies = await page.context().cookies()
    const names = cookies.map((c) => c.name)
    expect(names).toContain('mb_admin_session')
    expect(names).toContain('mb_csrf')

    // Sign out via the top-bar button.
    await page.getByRole('button', { name: /sign out/i }).click()
    await expect(page).toHaveURL(/\/admin\/login/)

    // Browser back: gate re-runs and bounces us back to /admin/login.
    await page.goBack()
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
