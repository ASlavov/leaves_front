import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://localhost:3000';
const AUTH_FILE = path.join(__dirname, '.auth/user.json');

/**
 * Runs once before the entire test suite.
 * Logs in and saves the session cookies to disk so every test can start
 * pre-authenticated via storageState — no per-test login overhead.
 *
 * NOTE: Do NOT add route warmup here using waitUntil:'networkidle'.
 * The app starts polling for notifications on every authenticated page,
 * which means networkidle never resolves — the setup would hang forever.
 * With the preview server (production build) compilation overhead is gone
 * anyway, so warmup is pointless.
 */
export default async function globalSetup() {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n[global-setup] Logging in…');
  await page.goto(`${BASE}/auth/login`);
  await page.fill('input[name="email"]', 'developers@whyagency.gr');
  await page.fill('input[name="password"]', '@@developers@@');
  await page.getByRole('button', { name: 'Σύνδεση' }).click();

  // waitUntil:'load' (the default) is enough — don't use networkidle,
  // the notification poller keeps the network permanently busy.
  await page.waitForURL(`${BASE}/home`, { timeout: 30000 });

  await context.storageState({ path: AUTH_FILE });
  await browser.close();

  console.log('[global-setup] Auth state saved ✓\n');
}
