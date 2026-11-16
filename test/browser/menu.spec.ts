import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { open } from './page.js';

const links = [
  { href: 'https://ko-fi.com/example', label: 'Ko-fi', icon: 'coffee' },
  { href: 'https://github.com/sponsors/example', label: 'GitHub Sponsors', icon: 'heart' },
  { href: 'https://github.com/example/project', label: 'Star on GitHub', icon: 'star', count: 1204 },
];

test.describe('menu', () => {
  for (const position of ['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const) {
    test(`${position}: opens on click, ${position.startsWith('bottom') ? 'above' : 'below'} the button, lined up with it`, async ({
      page,
    }) => {
      await open(page, { buttons: [{ links, position, compact: 'never' }] });
      const list = page.locator('.tipjar-list');
      await expect(list).toBeHidden();
      await page.locator('button.tipjar').click();
      await expect(list).toBeVisible();
      const button = await page.locator('button.tipjar').boundingBox();
      const box = await list.boundingBox();
      if (!button || !box) throw new Error('no box');
      if (position.startsWith('bottom')) expect(box.y + box.height).toBeLessThanOrEqual(button.y);
      else expect(box.y).toBeGreaterThanOrEqual(button.y + button.height);
      if (position.endsWith('right')) expect(Math.abs(box.x + box.width - (button.x + button.width))).toBeLessThan(1);
      else expect(Math.abs(box.x - button.x)).toBeLessThan(1);
    });
  }

  test('an inline menu opens below its button', async ({ page }) => {
    await open(page, { buttons: [{ links, position: 'inline' }] });
    await page.locator('button.tipjar').click();
    const button = await page.locator('button.tipjar').boundingBox();
    const box = await page.locator('.tipjar-list').boundingBox();
    expect(box?.y).toBeGreaterThanOrEqual((button?.y ?? 0) + (button?.height ?? 0));
  });

  test('works from the keyboard, and Escape or a click outside closes it', async ({ page }) => {
    await open(page, { buttons: [{ links }] });
    const button = page.locator('button.tipjar');
    const list = page.locator('.tipjar-list');
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(list).toBeVisible();
    // The browser tells screen readers the button is expanded. Playwright's role queries only read
    // aria-expanded, so ask Chromium's own accessibility tree.
    const cdp = await page.context().newCDPSession(page);
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const opener = nodes.find((node) => node.role?.value === 'button');
    expect(opener?.properties?.find((prop) => prop.name === 'expanded')?.value.value).toBe(true);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Ko-fi' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(list).toBeHidden();
    await expect(button).toBeFocused();
    await button.click();
    await expect(list).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(list).toBeHidden();
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`passes axe while open, on a ${colorScheme} page`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await open(page, { buttons: [{ links, newTab: true }] });
      await page.locator('button.tipjar').click();
      const { violations } = await new AxeBuilder({ page }).include('.tipjar-menu').analyze();
      expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      await expect(page.getByRole('link', { name: 'Star on GitHub (opens in a new tab) 1,204' })).toBeVisible();
    });
  }

  test('closes when the button tucks away', async ({ page }) => {
    await open(page, { footer: true, buttons: [{ links, hideWhenVisible: 'footer' }] });
    await page.locator('button.tipjar').click();
    await expect(page.locator('.tipjar-list')).toBeVisible();
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('.tipjar-list')).toBeHidden();
  });
});
