import { test, expect } from '@playwright/test';
import { BASE, waitForHomeReady } from '../helpers/auth';

test.describe('Language switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/home`);
    await waitForHomeReady(page);
  });

  test('language button is visible (default is Greek → shows "Switch to English" title)', async ({
    page,
  }) => {
    await expect(page.getByTitle('Switch to English')).toBeVisible();
  });

  test('sidebar shows Greek nav labels by default', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Προφίλ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ρυθμίσεις' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ημερολόγιο' })).toBeVisible();
  });

  test('switching to English changes nav labels', async ({ page }) => {
    await page.getByTitle('Switch to English').click();
    await page.waitForTimeout(400); // i18n reactive update

    // Sidebar should now read English
    await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible({ timeout: 5000 });

    // Switch back so the next test starts clean
    await page.getByTitle('Αλλαγή σε Ελληνικά').click();
  });

  test('switching back to Greek restores Greek labels', async ({ page }) => {
    await page.getByTitle('Switch to English').click();
    await page.waitForTimeout(400);

    await page.getByTitle('Αλλαγή σε Ελληνικά').click();
    await page.waitForTimeout(400);

    await expect(page.getByRole('link', { name: 'Ρυθμίσεις' })).toBeVisible({ timeout: 5000 });
  });
});
