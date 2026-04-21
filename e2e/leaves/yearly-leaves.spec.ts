import { test, expect } from '@playwright/test';
import { BASE, waitForYearlyLeavesReady } from '../helpers/auth';

test.describe('Yearly leaves page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/yearly-leaves`);
    await waitForYearlyLeavesReady(page);
  });

  test('page loads and shows the leaves table or empty state', async ({ page }) => {
    // Skeleton is gone — either rows or an empty message must exist
    const hasRows = (await page.locator('table tbody tr, [class*="leave-row"]').count()) > 0;
    const hasEmpty = (await page.getByText(/δεν υπάρχουν άδειες/i).count()) > 0;
    expect(hasRows || hasEmpty).toBe(true);
  });

  test('year selector is present and shows current year', async ({ page }) => {
    const currentYear = new Date().getFullYear().toString();
    await expect(page.getByText(currentYear).first()).toBeVisible();
  });

  test('status filter labels are visible', async ({ page }) => {
    // The filter area should show status options after load
    await expect(page.getByText(/κατάσταση|status/i).first()).toBeVisible();
  });

  test('admin account sees the "Record Administrative Leave" button', async ({ page }) => {
    // Only admin/HR see this button — our test account is admin
    await expect(page.getByRole('button', { name: /καταχώρηση διοικ/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test('filter inputs accept text input', async ({ page }) => {
    const inputs = page.locator('input[type="text"], input[type="search"]');
    if ((await inputs.count()) === 0) return;

    const first = inputs.first();
    await first.fill('test');
    await expect(first).toHaveValue('test');
    await first.clear();
  });
});
