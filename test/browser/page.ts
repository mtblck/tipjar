import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import type { Page } from '@playwright/test';

/** What the fixture page builds: see fixture.js. */
export interface Fixture {
  buttons?: Record<string, unknown>[];
  footer?: boolean;
  grid?: boolean;
  theme?: boolean;
}

const ORIGIN = 'http://tipjar.test';
const TYPES: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const ROOT = join(import.meta.dirname, '..', '..');
const FILES: Record<string, string> = {
  '/': 'test/browser/fixture.html',
  '/fixture.js': 'test/browser/fixture.js',
  '/fixture.css': 'test/browser/fixture.css',
  '/theme.css': 'test/browser/theme.css',
  '/style.css': 'style.css',
};

/**
 * Opens the fixture page with the built package, served under a strict CSP (no inline script or
 * style), so every test also checks that tipjar works on a strict-CSP site.
 * @param page - The Playwright page.
 * @param fixture - The buttons and page parts to build.
 * @returns Once the buttons are mounted.
 */
export async function open(page: Page, fixture: Fixture): Promise<void> {
  await page.route(`${ORIGIN}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname;
    const file = FILES[path] ?? (path.startsWith('/dist/') ? path.slice(1) : undefined);
    if (!file) return route.fulfill({ status: 404 });
    await route.fulfill({
      body: await readFile(join(ROOT, file)),
      headers: {
        'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
        'content-security-policy': "default-src 'self'",
      },
    });
  });
  await page.goto(`${ORIGIN}/#${encodeURIComponent(JSON.stringify(fixture))}`);
  await page.locator('html[data-ready]').waitFor({ state: 'attached' });
}
