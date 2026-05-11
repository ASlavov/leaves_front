import { test, expect } from '@playwright/test';
import { BASE, waitForSettingsReady } from '../helpers/auth';

const DAYS_EL = ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή'];

test.describe('Work week settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await waitForSettingsReady(page);
    await page.getByRole('tab', { name: 'Εβδομάδα εργασίας' }).click();

    // Wait for the panel to render real checkboxes (not the skeleton)
    const panel = page.getByRole('tabpanel');
    await panel.locator('input[type="checkbox"]').first().waitFor({ timeout: 10000 });
  });

  test('renders a labelled checkbox for each day of the week', async ({ page }) => {
    const panel = page.getByRole('tabpanel');
    for (const day of DAYS_EL) {
      await expect(panel.getByText(day, { exact: true })).toBeVisible();
    }
    // Exactly 7 checkboxes
    await expect(panel.locator('input[type="checkbox"]')).toHaveCount(7);
  });

  test('day checkboxes are toggleable', async ({ page }) => {
    const panel = page.getByRole('tabpanel');
    const first = panel.locator('input[type="checkbox"]').first();
    const wasChecked = await first.isChecked();

    await first.click();
    await expect(first).toBeChecked({ checked: !wasChecked });

    // Restore
    await first.click();
    await expect(first).toBeChecked({ checked: wasChecked });
  });

  test('deselecting all days shows a validation error on save', async ({ page }) => {
    const panel = page.getByRole('tabpanel');
    const checkboxes = panel.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    // Remember initial states so we can restore them
    const initial: boolean[] = [];
    for (let i = 0; i < count; i++) {
      initial.push(await checkboxes.nth(i).isChecked());
    }

    // Uncheck everything
    for (let i = 0; i < count; i++) {
      if (initial[i]) await checkboxes.nth(i).click();
    }

    const saveBtn = panel.getByRole('button', { name: /αποθήκευση/i });
    await saveBtn.click();

    await expect(page.getByText('Πρέπει να επιλεγεί τουλάχιστον μία εργάσιμη ημέρα.')).toBeVisible({
      timeout: 5000,
    });

    // Restore original state
    for (let i = 0; i < count; i++) {
      const isNow = await checkboxes.nth(i).isChecked();
      if (isNow !== initial[i]) await checkboxes.nth(i).click();
    }
  });

  test('saving the current configuration shows a success toast', async ({ page }) => {
    const panel = page.getByRole('tabpanel');
    // Ensure at least one day is checked (the test above may have left state clean,
    // but let's be defensive)
    const checkboxes = panel.locator('input[type="checkbox"]');
    const anyChecked = await checkboxes.locator(':checked').count();
    if (anyChecked === 0) {
      await checkboxes.first().click();
    }

    await panel.getByRole('button', { name: /αποθήκευση/i }).click();

    await expect(page.getByText('Οι ρυθμίσεις εβδομάδας εργασίας αποθηκεύτηκαν!')).toBeVisible({
      timeout: 10000,
    });
  });
});
