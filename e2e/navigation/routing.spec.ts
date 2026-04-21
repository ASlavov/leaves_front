import { test, expect } from '@playwright/test';
import { BASE, waitForHomeReady, waitForSettingsReady } from '../helpers/auth';

test.describe('Sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/home`);
    // Wait for permissions so sidebar nav links are fully rendered
    await waitForHomeReady(page);
  });

  test('shows Προφίλ, Ημερολόγιο and Ρυθμίσεις links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Προφίλ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ημερολόγιο' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ρυθμίσεις' })).toBeVisible();
  });

  test('clicking Ημερολόγιο navigates to /calendar', async ({ page }) => {
    await page.getByRole('link', { name: 'Ημερολόγιο' }).click();
    await expect(page).toHaveURL(`${BASE}/calendar`);
  });

  test('clicking Ρυθμίσεις navigates to /settings', async ({ page }) => {
    await page.getByRole('link', { name: 'Ρυθμίσεις' }).click();
    await expect(page).toHaveURL(`${BASE}/settings`);
  });

  test('clicking Προφίλ from another page returns to /home', async ({ page }) => {
    await page.goto(`${BASE}/calendar`);
    await page.getByRole('link', { name: 'Προφίλ' }).click();
    await expect(page).toHaveURL(`${BASE}/home`);
  });
});

test.describe('Direct page access', () => {
  test('/calendar loads', async ({ page }) => {
    await page.goto(`${BASE}/calendar`);
    await expect(page).toHaveURL(`${BASE}/calendar`);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('/settings loads and shows tab list', async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await waitForSettingsReady(page);
    await expect(page.getByRole('tablist')).toBeVisible();
  });

  test('/yearly-leaves loads', async ({ page }) => {
    await page.goto(`${BASE}/yearly-leaves`);
    await expect(page).toHaveURL(`${BASE}/yearly-leaves`);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
