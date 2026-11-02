import { expect, type Locator, test } from '@playwright/test';
import { open } from './page.js';

const style = (locator: Locator, prop: string): Promise<string> =>
  locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

test('tucks under the footer with the real IntersectionObserver, and comes back', async ({ page }) => {
  await open(page, { footer: true, buttons: [{ hideWhenVisible: 'footer' }] });
  const button = page.locator('.tipjar');
  await expect(button).toBeVisible();
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(button).toHaveAttribute('data-tucked', '');
  await expect(button).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(button).not.toHaveAttribute('data-tucked');
  await expect(button).toBeVisible();
});

test('a tucked button is out of the tab order', async ({ page }) => {
  await open(page, { footer: true, buttons: [{ hideWhenVisible: 'footer' }] });
  await page.locator('footer').scrollIntoViewIfNeeded();
  // Hidden once the 0.2s fade ends; visibility: hidden takes it out of the tab order.
  await expect(page.locator('.tipjar')).toBeHidden();
  // The only other link on the page is the footer's.
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.classList.contains('tipjar'))).toBe(false);
  }
});

test('lifts on hover, but not for people who ask for less motion', async ({ page }) => {
  await open(page, { buttons: [{}] });
  const button = page.locator('.tipjar');
  await button.hover();
  await expect.poll(() => style(button, 'transform')).not.toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => style(button, 'transform')).toBe('none');
  expect(await style(button, 'transition-duration')).toBe('0s');
});

test('is hidden in print', async ({ page }) => {
  await open(page, { buttons: [{}] });
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.tipjar')).toBeHidden();
});

test.describe('colours', () => {
  test('dark pages get the light button', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await open(page, { buttons: [{}] });
    expect(await style(page.locator('.tipjar'), 'background-color')).toBe('rgb(244, 241, 234)');
  });

  test("a site's own --tipjar-* values win over the dark defaults", async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await open(page, { theme: true, buttons: [{}] });
    const button = page.locator('.tipjar');
    expect(await style(button, 'background-color')).toBe('rgb(58, 38, 201)');
    expect(await style(button, 'color')).toBe('rgb(255, 255, 255)');
  });

  test('forced colours draw a border', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await open(page, { buttons: [{}] });
    expect(await style(page.locator('.tipjar'), 'border-top-width')).toBe('2px');
  });
});
