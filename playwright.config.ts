import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  /* Logs in once, saves cookies — every test starts already authenticated */
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  /* Single worker — the preview server is single-threaded anyway */
  workers: 1,
  timeout: 30000,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3000',
    /* Auth cookies saved by global-setup — no per-test login */
    storageState: 'e2e/.auth/user.json',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /*
   * Use the PRODUCTION build, not the dev server.
   *
   * `nuxt dev` lazy-compiles plugins.server.mjs / plugins.client.mjs on every
   * new browser context — that is why you see those messages on every test step.
   * It is baked into Nuxt's dev architecture and cannot be suppressed with
   * watch.ignored or warmup configs.
   *
   * `nuxt preview` serves the already-compiled .output bundle — zero recompilation.
   *
   * Workflow:
   *   npm run build        ← do this once (or use `npm run test:e2e` which does it for you)
   *   npm run test:e2e:ui  ← or just `playwright test --ui` if preview is already running
   *
   * `reuseExistingServer: true` means if you already have `nuxt preview` on :3000
   * Playwright won't try to start a second one.
   */
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
