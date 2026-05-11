import { test, expect } from '@playwright/test';
import { BASE, waitForSettingsReady } from '../helpers/auth';

const TEST_HOLIDAY_NAME = 'E2E Test Holiday';

test.describe('Public holidays', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await waitForSettingsReady(page);
    await page.getByRole('tab', { name: 'Επίσημες αργίες' }).click();

    // Wait for the year indicator and the Add button — both appear once the
    // component mounts and the API call completes
    const panel = page.getByRole('tabpanel');
    await panel.getByRole('button', { name: 'Προσθήκη αργίας' }).waitFor({ timeout: 10000 });
  });

  test('displays the current year', async ({ page }) => {
    const panel = page.getByRole('tabpanel');
    await expect(panel.getByText(new Date().getFullYear().toString())).toBeVisible();
  });

  test('year navigation changes the displayed year', async ({ page }) => {
    const panel = page.getByRole('tabpanel');
    const currentYear = new Date().getFullYear();

    // Find a button that contains ">" or a right-chevron svg near the year
    // The component renders prev/next year navigation buttons
    const buttons = panel.locator('button');
    const count = await buttons.count();

    // Look for the chevron-right / next button (typically last of the nav pair)
    let nextBtn = panel.locator('button[aria-label*="next"], button[aria-label*="επόμ"]').first();
    if ((await nextBtn.count()) === 0) {
      // Fallback: try the last button in the year-nav row
      nextBtn = panel.locator('button').nth(count - 1);
    }

    await nextBtn.click();
    await expect(panel.getByText((currentYear + 1).toString())).toBeVisible({ timeout: 5000 });

    // Navigate back
    let prevBtn = panel.locator('button[aria-label*="prev"], button[aria-label*="προηγ"]').first();
    if ((await prevBtn.count()) === 0) {
      prevBtn = panel.locator('button').first();
    }
    await prevBtn.click();
    await expect(panel.getByText(currentYear.toString())).toBeVisible({ timeout: 5000 });
  });

  test('clicking Add opens a modal with name field and date input', async ({ page }) => {
    const panel = page.getByRole('tabpanel');
    await panel.getByRole('button', { name: 'Προσθήκη αργίας' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ timeout: 5000 });

    // Holiday name text input
    await expect(dialog.locator('input[type="text"]').first()).toBeVisible();
    // Date input (flatpickr — has a placeholder)
    await expect(dialog.locator('input[placeholder]').first()).toBeVisible();
    // Save button
    await expect(dialog.getByRole('button', { name: /αποθήκευση|προσθήκη/i })).toBeVisible();
  });

  test('submitting add modal without a name stays open (required field)', async ({ page }) => {
    const panel = page.getByRole('tabpanel');
    await panel.getByRole('button', { name: 'Προσθήκη αργίας' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ timeout: 5000 });

    // Click save without filling anything
    await dialog.getByRole('button', { name: /αποθήκευση|προσθήκη/i }).click();

    // Modal must still be open
    await expect(dialog).toBeVisible();
  });

  test('escape closes the add modal', async ({ page }) => {
    const panel = page.getByRole('tabpanel');
    await panel.getByRole('button', { name: 'Προσθήκη αργίας' }).click();
    await page.getByRole('dialog').waitFor({ timeout: 5000 });

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 3000 });
  });

  test('create a holiday then immediately delete it', async ({ page }) => {
    const panel = page.getByRole('tabpanel');
    await panel.getByRole('button', { name: 'Προσθήκη αργίας' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ timeout: 5000 });

    await dialog.locator('input[type="text"]').first().fill(TEST_HOLIDAY_NAME);
    // Use Y-m-d format (flatpickr dateFormat: 'Y-m-d')
    const dateInput = dialog.locator('input[placeholder]').first();
    await dateInput.fill('2026-12-28');
    await dateInput.press('Tab');

    await dialog.getByRole('button', { name: /αποθήκευση|προσθήκη/i }).click();

    // Dialog should close and success toast appear
    await expect(dialog).toHaveCount(0, { timeout: 8000 });
    await expect(page.getByText('Η αργία προστέθηκε επιτυχώς!')).toBeVisible({ timeout: 8000 });

    // Find the row and delete it
    const row = panel.locator('tr, [class*="row"]', { hasText: TEST_HOLIDAY_NAME });
    if ((await row.count()) > 0) {
      const deleteBtn = row.getByRole('button', { name: /διαγραφή/i });
      if ((await deleteBtn.count()) > 0) {
        await deleteBtn.click();
        // Confirm if a confirmation prompt appears
        const confirmBtn = page.getByRole('button', { name: /επιβεβαίωση|διαγραφή/i }).last();
        if ((await confirmBtn.count()) > 0) await confirmBtn.click();
        await expect(panel.getByText(TEST_HOLIDAY_NAME)).toHaveCount(0, { timeout: 8000 });
      }
    }
  });
});
