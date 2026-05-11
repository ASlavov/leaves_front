import { test, expect } from '@playwright/test';
import { BASE, waitForSettingsReady } from '../helpers/auth';

// Tabs that are always visible (no permission gate)
const ALWAYS_VISIBLE_TABS = [
  { name: 'edit-profile', label: 'Επεξεργασία Προφίλ' },
  { name: 'security', label: 'Ασφάλεια' },
  { name: 'users', label: 'Χρήστες' },
  { name: 'groups', label: 'Γκρουπς' },
] as const;

// Tabs that only appear after permissionsStore resolves (admin account)
const PERMISSION_GATED_TABS = [
  { name: 'leave-types', label: 'Τύποι Αδειών' },
  { name: 'entitlement-days', label: 'Ημέρες Αδειών' },
  { name: 'work-week', label: 'Εβδομάδα εργασίας' },
  { name: 'public-holidays', label: 'Επίσημες αργίες' },
  { name: 'invitations', label: 'Κοινοποίηση Ημερολογίου' },
] as const;

test.describe('Settings tab navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/settings`);
    // Block until permissionsStore has resolved and all admin tabs are rendered
    await waitForSettingsReady(page);
  });

  test('always-visible tabs are rendered immediately', async ({ page }) => {
    for (const tab of ALWAYS_VISIBLE_TABS) {
      await expect(page.getByRole('tab', { name: tab.label })).toBeVisible();
    }
  });

  test('permission-gated tabs are rendered for admin account', async ({ page }) => {
    // waitForSettingsReady already guaranteed these exist — just assert visibility
    for (const tab of PERMISSION_GATED_TABS) {
      await expect(page.getByRole('tab', { name: tab.label })).toBeVisible();
    }
  });

  test('default active tab is edit-profile', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Επεξεργασία Προφίλ' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('clicking a tab activates it and deactivates the previous one', async ({ page }) => {
    const editProfileTab = page.getByRole('tab', { name: 'Επεξεργασία Προφίλ' });
    const securityTab = page.getByRole('tab', { name: 'Ασφάλεια' });

    await expect(editProfileTab).toHaveAttribute('aria-selected', 'true');

    await securityTab.click();
    await expect(securityTab).toHaveAttribute('aria-selected', 'true');
    await expect(editProfileTab).toHaveAttribute('aria-selected', 'false');
  });

  test('each tab click renders its panel', async ({ page }) => {
    await page.getByRole('tab', { name: 'Χρήστες' }).click();
    await expect(page.getByRole('tabpanel')).toBeVisible();
    // Panel is not empty — skeleton or real content
    await expect(page.getByRole('tabpanel')).not.toBeEmpty();
  });

  test('navigating with hash activates the correct tab', async ({ page }) => {
    // Navigate directly to a permission-gated tab via hash
    await page.goto(`${BASE}/settings#work-week`);
    await waitForSettingsReady(page);
    await expect(page.getByRole('tab', { name: 'Εβδομάδα εργασίας' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
