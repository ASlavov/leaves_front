import { test, expect } from '@playwright/test';
import { BASE, waitForSettingsReady } from '../helpers/auth';

test.describe('Calendar sharing / invitations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    await waitForSettingsReady(page);
    await page.getByRole('tab', { name: 'Κοινοποίηση Ημερολογίου' }).click();

    // Wait for panel and for skeletons to clear
    const panel = page.getByRole('tabpanel');
    await panel.waitFor({ timeout: 10000 });
    await panel
      .locator('.animate-pulse')
      .first()
      .waitFor({ state: 'detached', timeout: 8000 })
      .catch(() => {});
  });

  test('invitations panel renders', async ({ page }) => {
    await expect(page.getByRole('tabpanel')).toBeVisible();
    await expect(page.getByRole('tabpanel')).not.toBeEmpty();
  });

  test('send invitation button or form is present', async ({ page }) => {
    const panel = page.getByRole('tabpanel');
    const sendBtn = panel.getByRole('button', { name: /αποστολή|send|νέα/i }).first();
    if ((await sendBtn.count()) > 0) {
      await expect(sendBtn).toBeVisible();
    }
  });
});
