import { test, expect } from '@playwright/test';
import { BASE, waitForHomeReady } from '../helpers/auth';

test.describe('Color mode toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/home`);
    await waitForHomeReady(page);
  });

  test('color mode toggle is present in the sidebar', async ({ page }) => {
    // ColorModeSwitcher renders a div.relative.inline-block.w-12.h-6.cursor-pointer
    await expect(page.locator('.w-12.h-6.cursor-pointer').first()).toBeVisible();
  });

  test('toggle switches dark/light class on <html>', async ({ page }) => {
    const toggle = page.locator('.w-12.h-6.cursor-pointer').first();
    const html = page.locator('html');

    const before = ((await html.getAttribute('class')) ?? '').includes('dark');
    await toggle.click();
    await page.waitForTimeout(350); // CSS transition

    const after = ((await html.getAttribute('class')) ?? '').includes('dark');
    expect(after).not.toBe(before);

    // Restore
    await toggle.click();
  });

  test('dark mode persists after navigating to settings', async ({ page }) => {
    const toggle = page.locator('.w-12.h-6.cursor-pointer').first();
    const html = page.locator('html');

    // Make sure we're in dark mode
    const isDark = ((await html.getAttribute('class')) ?? '').includes('dark');
    if (!isDark) await toggle.click();
    await page.waitForTimeout(350);
    await expect(html).toHaveClass(/dark/);

    await page.goto(`${BASE}/settings`);
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Restore to light for subsequent tests
    await page.locator('.w-12.h-6.cursor-pointer').first().click();
  });

  test('toggling twice returns to original mode', async ({ page }) => {
    const toggle = page.locator('.w-12.h-6.cursor-pointer').first();
    const initial = ((await page.locator('html').getAttribute('class')) ?? '').includes('dark');

    await toggle.click();
    await page.waitForTimeout(300);
    await toggle.click();
    await page.waitForTimeout(300);

    const final = ((await page.locator('html').getAttribute('class')) ?? '').includes('dark');
    expect(final).toBe(initial);
  });
});
