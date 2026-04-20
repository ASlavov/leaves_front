import { test, expect } from '@playwright/test';
import { BASE, waitForHomeReady } from '../helpers/auth';

test.describe('New leave request', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/home`);
    // Block until the permissions store has resolved and the button exists
    await waitForHomeReady(page);
  });

  test('leave request button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Νέο αίτημα άδειας' })).toBeVisible();
  });

  test('clicking the button opens the leave request modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Νέο αίτημα άδειας' }).click();
    await expect(page.locator('#new-leave-modal')).toBeVisible({ timeout: 5000 });
  });

  test('modal contains leave-type selector, date inputs and send button', async ({ page }) => {
    await page.getByRole('button', { name: 'Νέο αίτημα άδειας' }).click();
    const modal = page.locator('#new-leave-modal');
    await modal.waitFor({ timeout: 5000 });

    await expect(modal.getByText('Τύπος άδειας')).toBeVisible();
    await expect(modal.locator('input[placeholder="Επιλέξτε ημ/νια"]').first()).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Αποστολή αιτήματος' })).toBeVisible();
  });

  test('submitting without selecting a leave type keeps the modal open', async ({ page }) => {
    await page.getByRole('button', { name: 'Νέο αίτημα άδειας' }).click();
    const modal = page.locator('#new-leave-modal');
    await modal.waitFor({ timeout: 5000 });

    await modal.getByRole('button', { name: 'Αποστολή αιτήματος' }).click();
    // No leave type selected → validation should prevent submission
    await expect(modal).toBeVisible();
  });

  test('selecting a leave type enables date pickers', async ({ page }) => {
    await page.getByRole('button', { name: 'Νέο αίτημα άδειας' }).click();
    const modal = page.locator('#new-leave-modal');
    await modal.waitFor({ timeout: 5000 });

    // The CustomSelect component renders a div trigger — click it to open
    const selectTrigger = modal.locator('[id*="select"], .cursor-pointer').first();
    await selectTrigger.click();

    // Options appear in a list; pick the first one
    const option = modal.locator('li, [role="option"]').first();
    if ((await option.count()) > 0) {
      await option.click();
      // After selection the leave type is set and date pickers should be active
      const dateInput = modal.locator('input[placeholder="Επιλέξτε ημ/νια"]').first();
      await expect(dateInput).toBeEnabled({ timeout: 5000 });
    }
  });

  test('flatpickr date input accepts a typed date (Y-m-d)', async ({ page }) => {
    await page.getByRole('button', { name: 'Νέο αίτημα άδειας' }).click();
    const modal = page.locator('#new-leave-modal');
    await modal.waitFor({ timeout: 5000 });

    // Select first available leave type
    const selectTrigger = modal.locator('[id*="select"], .cursor-pointer').first();
    await selectTrigger.click();
    const option = modal.locator('li, [role="option"]').first();
    if ((await option.count()) > 0) {
      await option.click();

      const startDate = modal.locator('input[placeholder="Επιλέξτε ημ/νια"]').first();
      await startDate.waitFor({ timeout: 5000 });
      await startDate.fill('2026-05-05');
      await startDate.press('Tab');
      // The value should be set (flatpickr reformats it in its own format)
      const val = await startDate.inputValue();
      expect(val).not.toBe('');
    }
  });

  test('escape closes the modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Νέο αίτημα άδειας' }).click();
    await page.locator('#new-leave-modal').waitFor({ timeout: 5000 });

    await page.keyboard.press('Escape');
    await expect(page.locator('#new-leave-modal')).toHaveCount(0, { timeout: 3000 });
  });
});

test.describe('Leave balance metrics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/home`);
    await waitForHomeReady(page);
  });

  test('leave balance section renders after permissions load', async ({ page }) => {
    // LeavesMetric renders balance info once the entitlement data arrives
    // Wait for skeletons in that section to clear
    await page
      .locator('.animate-pulse')
      .first()
      .waitFor({ state: 'detached', timeout: 10000 })
      .catch(() => {});

    // Something about balances should be visible
    await expect(page.getByText(/υπόλοιπο|διαθέσιμ|remaining/i).first()).toBeVisible({
      timeout: 10000,
    });
  });
});
