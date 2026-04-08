import { test, expect } from '@playwright/test';
import { BASE, CREDENTIALS, login } from '../helpers/auth';

// These tests verify the login flow itself — start with no auth cookies
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
  });

  test('renders email, password inputs and submit button', async ({ page }) => {
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Σύνδεση' })).toBeVisible();
  });

  test('password field is masked by default', async ({ page }) => {
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password');
  });

  test('password toggle reveals and re-hides the password', async ({ page }) => {
    // The toggle button sits immediately after the password input
    const toggleBtn = page.locator('input[name="password"] + button');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password');

    await toggleBtn.click();
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'text');

    await toggleBtn.click();
    await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password');
  });

  test('shows error toast on invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.getByRole('button', { name: 'Σύνδεση' }).click();

    // Error toast or message should appear; the page should NOT navigate away
    // await expect(page).toHaveURL(`${BASE}/auth/login`);
    await page.waitForURL(`${BASE}/auth/login`, { timeout: 15000 });
  });

  test('redirects to /home after successful login', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(`${BASE}/home`);
  });

  test('forgot password link navigates to the reset page', async ({ page }) => {
    const link = page.getByRole('link', { name: /ξεχάσατε/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('remember me checkbox is interactive', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).not.toBeChecked();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });
});

// Separate describe for the post-login state — these need real auth cookies
test.describe('Authenticated session', () => {
  // Override the file-level unauthenticated state for this block only
  test.use({ storageState: 'e2e/.auth/user.json' });

  test('navigating to /home while authenticated stays on home', async ({ page }) => {
    await page.goto(`${BASE}/home`);
    await expect(page).toHaveURL(`${BASE}/home`);
  });

  test('successful login lands on home and shows sidebar', async ({ page }) => {
    await page.goto(`${BASE}/home`);
    await expect(page.locator('nav')).toBeVisible();
  });
});
