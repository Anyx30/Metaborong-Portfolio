import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for the Metaborong CMS E2E suite.
 *
 * Scope decisions for v1 (M1):
 *   - Chromium only. Firefox / WebKit are easy to add later but every
 *     extra runtime triples the per-spec wall time, so we wait until a
 *     spec actually depends on engine differences.
 *   - workers: 1. Each spec mutates session cookies and admin DB state;
 *     parallelism would create auth-state contention. Plenty fast for
 *     M1's single spec.
 *   - webServer launches `pnpm dev` so specs hit the real Next.js
 *     route handlers. No mocking at the network boundary in E2E.
 *   - Reuses an already-running dev server in local dev (faster
 *     iteration); always starts fresh in CI (deterministic).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
