import { test, expect } from '@playwright/test';
import { BASE, waitForSettingsReady } from '../helpers/auth';

test('edit profile — first name round-trip', async ({ page }) => {
  await page.goto(`${BASE}/settings`);
  await waitForSettingsReady(page);

  // edit-profile is the first tab — it should be active by default.
  // Wait for the form skeleton to clear (profile data loads async too)
  const panel = page.getByRole('tabpanel');
  await panel
    .locator('.animate-pulse')
    .first()
    .waitFor({ state: 'detached', timeout: 10000 })
    .catch(() => {});

  // The edit-profile tab renders EditUser which has firstName/lastName fields.
  // We also need to confirm the data is loaded by checking the email field
  // contains the logged-in user's email (not empty/default placeholder).
  const emailField = panel.getByLabel('Email');
  if ((await emailField.count()) > 0) {
    await expect(emailField).not.toHaveValue('', { timeout: 10000 });
  }

  const firstNameField = panel.getByLabel('Όνομα');
  const originalName = await firstNameField.inputValue();

  await firstNameField.fill('devs');
  await panel.getByRole('button', { name: 'Αποθήκευση Αλλαγών' }).click();
  await expect(page.getByText('Το προφίλ του χρήστη ενημερώθηκε επιτυχώς!')).toBeVisible({
    timeout: 10000,
  });

  // Restore
  await firstNameField.fill(originalName);
  await panel.getByRole('button', { name: 'Αποθήκευση Αλλαγών' }).click();
  await expect(page.getByText('Το προφίλ του χρήστη ενημερώθηκε επιτυχώς!')).toBeVisible({
    timeout: 10000,
  });
});
