import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { open } from './page.js';

const POSITIONS = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'inline'] as const;
const STYLES = ['flat', 'pixel', 'outline'] as const;

async function axe(page: import('@playwright/test').Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).include('.tipjar').analyze();
  return violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
}

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`axe, ${colorScheme}`, () => {
    test.use({ colorScheme });

    for (const position of POSITIONS) {
      test(`${position}: every icon style, compact and not, with and without a description`, async ({ page }) => {
        const buttons = STYLES.flatMap((iconStyle) =>
          (['always', 'never', 'hover'] as const).flatMap((compact) =>
            [undefined, 'this project on Ko-fi'].map((description) => ({
              position: 'inline',
              iconStyle,
              compact,
              ...(description ? { description } : {}),
            })),
          ),
        );
        // One button in the real position, the rest inline so they don't stack on each other.
        await open(page, { buttons: [{ position }, ...buttons] });
        expect(await axe(page)).toEqual([]);
      });
    }
  });
}

test('the accessible name includes the visible label, folded or not', async ({ page }) => {
  await open(page, {
    buttons: [{ compact: 'always', description: 'this project on Ko-fi', newTab: true }],
  });
  await expect(page.getByRole('link', { name: 'Support this project on Ko-fi (opens in a new tab)' })).toBeVisible();
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`a count passes axe and is read after the label, on a ${colorScheme} page`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await open(page, {
      buttons: [
        { label: 'Star', icon: 'star', count: 1204, description: 'tipjar on GitHub' },
        { label: 'Star', icon: 'star', count: 12_399, position: 'inline', compact: 'never' },
        { label: 'Star', icon: 'star', count: 5, position: 'inline', compact: 'hover' },
      ],
    });
    expect(await axe(page)).toEqual([]);
    await expect(page.getByRole('link', { name: 'Star 1,204 tipjar on GitHub' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Star 12.3k' })).toBeVisible();
  });
}

test('the compact target is at least 44px square', async ({ page }) => {
  await open(page, { buttons: [{ compact: 'always' }] });
  const box = await page.locator('.tipjar').boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`the focus ring shows on a ${colorScheme} page`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await open(page, { buttons: [{}] });
    await page.keyboard.press('Tab');
    const ring = await page.locator('.tipjar').evaluate((el) => {
      const s = getComputedStyle(el);
      const page = getComputedStyle(document.documentElement).backgroundColor;
      return { style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor, page };
    });
    expect(ring.style).toBe('solid');
    expect(ring.width).toBe('2px');
    expect(ring.color).not.toBe(ring.page);
  });
}
