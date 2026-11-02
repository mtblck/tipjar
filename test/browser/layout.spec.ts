import { expect, test } from '@playwright/test';
import { open } from './page.js';

const DESKTOP = { width: 1024, height: 700 };
const PHONE = { width: 375, height: 667 };
const OFFSET = 16;

test.describe('position', () => {
  test.use({ viewport: DESKTOP });

  for (const [position, edges] of [
    ['bottom-right', { right: true, bottom: true }],
    ['bottom-left', { right: false, bottom: true }],
    ['top-right', { right: true, bottom: false }],
    ['top-left', { right: false, bottom: false }],
  ] as const) {
    test(`${position} sits ${OFFSET}px from its corner`, async ({ page }) => {
      await open(page, { buttons: [{ position }] });
      const box = await page.locator('.tipjar').boundingBox();
      if (!box) throw new Error('no button');
      const x = edges.right ? DESKTOP.width - (box.x + box.width) : box.x;
      const y = edges.bottom ? DESKTOP.height - (box.y + box.height) : box.y;
      expect(Math.round(x)).toBe(OFFSET);
      expect(Math.round(y)).toBe(OFFSET);
    });
  }

  test('inline flows with the page', async ({ page }) => {
    await open(page, { buttons: [{ position: 'inline' }] });
    expect(await page.locator('.tipjar').evaluate((el) => getComputedStyle(el).position)).toBe('relative');
  });
});

for (const [name, viewport] of [
  ['phone', PHONE],
  ['desktop', DESKTOP],
] as const) {
  test.describe(`compact on a ${name}`, () => {
    test.use({ viewport });

    for (const compact of ['auto', 'always', 'never'] as const) {
      const folded = compact === 'always' || (compact === 'auto' && name === 'phone');
      test(`${compact} ${folded ? 'folds to a 44px circle' : 'shows the label'}`, async ({ page }) => {
        await open(page, { buttons: [{ compact }] });
        const box = await page.locator('.tipjar').boundingBox();
        expect(box?.height).toBe(44);
        if (folded) expect(box?.width).toBe(44);
        else expect(box?.width).toBeGreaterThan(80);
        // Folded or not, the label names the link.
        await expect(page.getByRole('link', { name: 'Support' })).toBeVisible();
      });
    }
  });
}

test.describe('screenshots', () => {
  test.use({ viewport: { width: 480, height: 200 } });

  test('every icon in every style', async ({ page }) => {
    await open(page, { grid: true });
    await expect(page.locator('.grid')).toHaveScreenshot('icons.png');
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`the default button, ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await open(page, { buttons: [{ position: 'top-left', compact: 'never' }] });
      await expect(page).toHaveScreenshot(`button-${colorScheme}.png`);
    });
  }

  test('forced colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await open(page, { buttons: [{ position: 'top-left', compact: 'never', icon: 'coffee', iconStyle: 'pixel' }] });
    await expect(page).toHaveScreenshot('forced-colors.png');
  });
});
