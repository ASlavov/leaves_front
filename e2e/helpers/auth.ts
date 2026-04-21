import type { Page } from '@playwright/test';

export const BASE = 'http://localhost:3000';

export const CREDENTIALS = {
  email: 'developers@whyagency.gr',
  password: '@@developers@@',
};

export async function login(
  page: Page,
  email = CREDENTIALS.email,
  password = CREDENTIALS.password,
) {
  await page.goto(`${BASE}/auth/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.getByRole('button', { name: 'Σύνδεση' }).click();
  await page.waitForURL(`${BASE}/home`, { timeout: 30000 });
}

/**
 * Wait for the settings page to be fully ready for an admin user.
 *
 * The `visibleTabs` computed in settings.vue depends on permissionsStore.can().
 * Until the permissions API call returns, only the 4 no-permission tabs are
 * rendered. The "Τύποι Αδειών" tab requires leave_types.view — its presence
 * in the DOM means both the page hydrated AND the permission check resolved.
 *
 * Call this immediately after page.goto('/settings') before touching any tab.
 */
export async function waitForSettingsReady(page: Page) {
  await page.locator('#basic-tabs-item-leave-types').waitFor({ timeout: 15000 });
}

/**
 * After clicking a settings tab, wait for the panel content to finish loading.
 * Components render a skeleton (animate-pulse divs) while data fetches; we
 * wait for those to disappear AND for at least one real interactive element.
 */
export async function waitForTabPanel(page: Page) {
  const panel = page.getByRole('tabpanel');
  await panel.waitFor({ timeout: 10000 });
  // Wait for skeleton loaders to clear — if none exist that's fine too
  await panel
    .locator('.animate-pulse')
    .first()
    .waitFor({ state: 'detached', timeout: 10000 })
    .catch(() => {});
}

/**
 * Wait for the home page to be ready for an admin user.
 * The "Νέο αίτημα άδειας" button requires profile_leave_balance.request_leave
 * permission — its visibility means the permissions store has populated.
 */
export async function waitForHomeReady(page: Page) {
  await page.getByRole('button', { name: 'Νέο αίτημα άδειας' }).waitFor({ timeout: 15000 });
}

/**
 * Wait for the yearly-leaves page to finish loading its list.
 * The YearlyLeaves component shows a skeleton while fetching; we wait for
 * any actual table row OR the empty-state message to appear.
 */
export async function waitForYearlyLeavesReady(page: Page) {
  // Either a data row or the "no leaves" message — both mean loading is done
  await page
    .locator('table tr td, [class*="no-leaves"], [class*="empty"]')
    .first()
    .waitFor({ timeout: 15000 })
    .catch(async () => {
      // Fallback: skeletons gone = done
      await page
        .locator('.animate-pulse')
        .first()
        .waitFor({ state: 'detached', timeout: 10000 })
        .catch(() => {});
    });
}
