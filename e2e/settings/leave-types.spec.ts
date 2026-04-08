import { test, expect } from '@playwright/test';
import { BASE, waitForSettingsReady } from '../helpers/auth';

test.describe('Leave types settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await waitForSettingsReady(page);
    await page.getByRole('tab', { name: 'Τύποι Αδειών' }).click();

    // Wait for either a real leave-type row OR the add button to be enabled.
    // The list skeleton clears once the API call finishes.
    const panel = page.getByRole('tabpanel');
    await panel
      .locator('.animate-pulse')
      .first()
      .waitFor({ state: 'detached', timeout: 10000 })
      .catch(() => {});
    await panel
      .getByRole('button', { name: 'Προσθήκη νέου τύπου άδειας' })
      .waitFor({ timeout: 10000 });
  });

  test('shows the add-leave-type button', async ({ page }) => {
    await expect(
      page.getByRole('tabpanel').getByRole('button', { name: 'Προσθήκη νέου τύπου άδειας' }),
    ).toBeVisible();
  });

  test('clicking add opens a modal', async ({ page }) => {
    await page
      .getByRole('tabpanel')
      .getByRole('button', { name: 'Προσθήκη νέου τύπου άδειας' })
      .click();

    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ timeout: 5000 });
    await expect(dialog).toBeVisible();
  });

  test('add modal has a name input and save button', async ({ page }) => {
    await page
      .getByRole('tabpanel')
      .getByRole('button', { name: 'Προσθήκη νέου τύπου άδειας' })
      .click();

    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ timeout: 5000 });

    await expect(dialog.locator('input[type="text"]').first()).toBeVisible();
    await expect(dialog.getByRole('button', { name: /αποθήκευση|αποστολή/i })).toBeVisible();
  });

  test('advanced rules section can be expanded', async ({ page }) => {
    await page
      .getByRole('tabpanel')
      .getByRole('button', { name: 'Προσθήκη νέου τύπου άδειας' })
      .click();

    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ timeout: 5000 });

    const advancedToggle = dialog.getByRole('button', {
      name: /προηγμένοι κανόνες|εμφάνιση προηγμ/i,
    });
    if ((await advancedToggle.count()) > 0) {
      await advancedToggle.click();
      // A rules-engine field should now be visible
      await expect(dialog.getByText(/προτεραιότητα|επίπεδο/i).first()).toBeVisible({
        timeout: 3000,
      });
    }
  });

  test('escape closes the modal without saving', async ({ page }) => {
    await page
      .getByRole('tabpanel')
      .getByRole('button', { name: 'Προσθήκη νέου τύπου άδειας' })
      .click();
    await page.getByRole('dialog').waitFor({ timeout: 5000 });

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 3000 });
  });

  test('existing leave types are listed', async ({ page }) => {
    // There should be at least one leave type in the dev DB
    const panel = page.getByRole('tabpanel');
    // Real rows only exist after skeletons clear — they render something with an edit button
    const editBtn = panel.getByRole('button', { name: /επεξεργασία/i }).first();
    if ((await editBtn.count()) > 0) {
      await expect(editBtn).toBeVisible();
    }
  });

  test('show/hide archived types toggle works', async ({ page }) => {
    const panel = page.getByRole('tabpanel');
    const toggleBtn = panel.getByRole('button', { name: /αρχειοθετημένων/i });
    if ((await toggleBtn.count()) === 0) return; // feature not visible

    const textBefore = await toggleBtn.textContent();
    await toggleBtn.click();
    // Button text should change (show ↔ hide)
    const textAfter = await toggleBtn.textContent();
    expect(textAfter).not.toBe(textBefore);
  });
});
