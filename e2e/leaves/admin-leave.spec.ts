import { test, expect } from '@playwright/test';
import { BASE, waitForYearlyLeavesReady } from '../helpers/auth';

test.describe('Administrative leave recording (admin only)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/yearly-leaves`);
    // The "Record Leave" button only appears after permissions resolve
    await waitForYearlyLeavesReady(page);
    // Extra wait for the admin button specifically
    await page.getByRole('button', { name: /καταχώρηση διοικ/i }).waitFor({ timeout: 15000 });
  });

  test('Record Leave button is visible for admin', async ({ page }) => {
    await expect(page.getByRole('button', { name: /καταχώρηση διοικ/i })).toBeVisible();
  });

  test('clicking Record Leave opens the modal', async ({ page }) => {
    await page.getByRole('button', { name: /καταχώρηση διοικ/i }).click();

    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ timeout: 5000 });
    await expect(dialog.getByText(/καταχώρηση διοικητικής/i)).toBeVisible();
  });

  test('modal contains employee selector, leave type, dates and submit', async ({ page }) => {
    await page.getByRole('button', { name: /καταχώρηση διοικ/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ timeout: 5000 });

    await expect(dialog.getByText(/επιλογή εργαζόμενου/i)).toBeVisible();
    // Date inputs (flatpickr)
    await expect(dialog.locator('input[placeholder]').first()).toBeVisible();
    await expect(dialog.getByRole('button', { name: /καταχώρηση άδειας/i })).toBeVisible();
  });

  test('escape closes the modal', async ({ page }) => {
    await page.getByRole('button', { name: /καταχώρηση διοικ/i }).click();
    await page.getByRole('dialog').waitFor({ timeout: 5000 });

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 3000 });
  });
});
