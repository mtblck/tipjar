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

test.describe('compact hover', () => {
  test.use({ viewport: { width: 1024, height: 700 } });

  test('is a circle that opens into the full button on hover, and closes again', async ({ page }) => {
    await open(page, { buttons: [{ compact: 'hover', label: 'Buy me a coffee', icon: 'coffee' }] });
    const button = page.locator('.tipjar');
    const label = page.locator('.tipjar-label');
    await expect.poll(async () => (await button.boundingBox())?.width).toBe(44);
    const iconBefore = await page.locator('.tipjar-icon').boundingBox();
    await button.hover();
    await expect.poll(async () => (await button.boundingBox())?.width).toBeGreaterThan(120);
    await expect.poll(() => style(label, 'opacity')).toBe('1');
    // It opens sideways only: no lift.
    expect(await style(button, 'transform')).toBe('none');
    // The button grows away from its corner, so the right edge stays put.
    const box = await button.boundingBox();
    expect(Math.round(1024 - ((box?.x ?? 0) + (box?.width ?? 0)))).toBe(16);
    // The icon keeps its place at the left of the circle's padding.
    const iconAfter = await page.locator('.tipjar-icon').boundingBox();
    expect(Math.round((iconAfter?.x ?? 0) - (box?.x ?? 0))).toBe(Math.round((iconBefore?.x ?? 0) - (1024 - 16 - 44)));
    await page.mouse.move(0, 0);
    await expect.poll(async () => (await button.boundingBox())?.width).toBe(44);
  });

  test('opens for keyboard focus too', async ({ page }) => {
    await open(page, { buttons: [{ compact: 'hover' }] });
    await page.keyboard.press('Tab');
    await expect.poll(async () => (await page.locator('.tipjar').boundingBox())?.width).toBeGreaterThan(80);
  });

  test('still opens with reduced motion, all at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, { buttons: [{ compact: 'hover' }] });
    const button = page.locator('.tipjar');
    await button.hover();
    expect((await button.boundingBox())?.width).toBeGreaterThan(80);
    expect(await style(page.locator('.tipjar-label'), 'transition-duration')).toBe('0s');
  });
});

test.describe('touch', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 667 } });

  test('a compact hover button stays a circle where nothing can hover', async ({ page }) => {
    await open(page, { buttons: [{ compact: 'hover' }] });
    expect(await page.evaluate(() => matchMedia('(hover: hover)').matches)).toBe(false);
    expect((await page.locator('.tipjar').boundingBox())?.width).toBe(44);
  });
});

test.describe('hover effects', () => {
  test('pop scales the button up', async ({ page }) => {
    await open(page, { buttons: [{ hover: 'pop' }] });
    const button = page.locator('.tipjar');
    await button.hover();
    await expect.poll(() => style(button, 'transform')).toMatch(/^matrix\(1\.06, 0, 0, 1\.06/);
  });

  test('wiggle tilts the whole button', async ({ page }) => {
    await open(page, { buttons: [{ hover: 'wiggle' }] });
    const button = page.locator('.tipjar');
    await button.hover();
    expect(await style(button, 'animation-name')).toBe('none, tipjar-wiggle');
  });

  test('wiggle leaves the entrance alone: it does not play again after a hover', async ({ page }) => {
    await open(page, { buttons: [{ hover: 'wiggle', enter: 'fade' }] });
    const button = page.locator('.tipjar');
    await expect.poll(() => style(button, 'opacity'), { timeout: 3000 }).toBe('1');
    await page.waitForTimeout(600);
    await button.hover();
    expect(await style(button, 'animation-name')).toBe('tipjar-fade, tipjar-wiggle');
    await page.mouse.move(0, 0);
    await page.waitForTimeout(50);
    expect(await style(button, 'opacity')).toBe('1');
  });

  for (const hover of ['pop', 'wiggle'] as const) {
    test(`a compact hover button only opens: no ${hover}`, async ({ page }) => {
      await open(page, { buttons: [{ hover, compact: 'hover' }] });
      const button = page.locator('.tipjar');
      await button.hover();
      await page.waitForTimeout(350);
      expect(await style(button, 'transform')).toBe('none');
      expect(await style(button, 'animation-name')).toBe('none');
      expect((await button.boundingBox())?.width).toBeGreaterThan(80);
    });
  }

  test('fill wipes a second colour in under the label', async ({ page }) => {
    await open(page, { buttons: [{ hover: 'fill' }] });
    const button = page.locator('.tipjar');
    const layer = () => button.evaluate((el) => getComputedStyle(el, '::before').clipPath);
    expect(await layer()).toBe('inset(0px 100% 0px 0px)');
    await button.hover();
    await expect.poll(layer).toBe('inset(0px)');
  });

  test('shine sweeps a highlight across', async ({ page }) => {
    await open(page, { buttons: [{ hover: 'shine' }] });
    const button = page.locator('.tipjar');
    const at = () => button.evaluate((el) => getComputedStyle(el, '::before').backgroundPositionX);
    expect(await at()).toBe('120%');
    await button.hover();
    await expect.poll(at).toBe('-30%');
  });

  test('none stays still', async ({ page }) => {
    await open(page, { buttons: [{ hover: 'none' }] });
    const button = page.locator('.tipjar');
    await button.hover();
    await page.waitForTimeout(250);
    expect(await style(button, 'transform')).toBe('none');
  });

  test('squishes while pressed', async ({ page }) => {
    await open(page, { buttons: [{}] });
    const button = page.locator('.tipjar');
    await button.hover();
    await page.mouse.down();
    await expect.poll(() => style(button, 'scale')).toBe('0.96');
    await page.mouse.up();
  });

  test('none of it moves with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, { buttons: [{ hover: 'pop' }, { hover: 'wiggle', position: 'inline' }] });
    const pop = page.locator('.tipjar').first();
    const wiggle = page.locator('.tipjar').nth(1);
    await pop.hover();
    expect(await style(pop, 'transform')).toBe('none');
    await wiggle.hover();
    expect(await style(wiggle, 'animation-name')).toBe('none');
  });
});

test.describe('entrance', () => {
  for (const enter of ['fade', 'slide', 'pop'] as const) {
    test(`${enter} arrives after the delay and ends at rest`, async ({ page }) => {
      await open(page, { buttons: [{ enter }] });
      const button = page.locator('.tipjar');
      // Still waiting for the 0.6s delay: the first frame is held.
      expect(Number(await style(button, 'opacity'))).toBe(0);
      await expect.poll(() => style(button, 'opacity'), { timeout: 3000 }).toBe('1');
      await expect.poll(() => button.evaluate((el) => el.getAnimations().length)).toBe(0);
      expect(await style(button, 'translate')).toBe('none');
      expect(await style(button, 'scale')).toBe('none');
    });
  }

  test('a button tucked when the page loads stays hidden', async ({ page }) => {
    await open(page, { footer: true, buttons: [{ enter: 'fade', hideWhenVisible: 'footer' }] });
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await expect(page.locator('.tipjar')).toBeHidden();
  });

  test('shows at once with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, { buttons: [{ enter: 'slide' }] });
    expect(await style(page.locator('.tipjar'), 'opacity')).toBe('1');
  });
});

test.describe('animated icons', () => {
  const parts = (page: import('@playwright/test').Page) =>
    page.locator('.tipjar-part').evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));

  test('steam wafts over the coffee on hover, and stops after', async ({ page }) => {
    await open(page, { buttons: [{ icon: 'coffee' }] });
    expect(await parts(page)).toEqual(['none', 'none']);
    await page.locator('.tipjar').hover();
    expect(await parts(page)).toEqual(['tipjar-waft', 'tipjar-waft']);
    await page.mouse.move(0, 0);
    expect(await parts(page)).toEqual(['none', 'none']);
  });

  for (const [icon, animation] of [
    ['heart', 'tipjar-beat'],
    ['star', 'tipjar-spin'],
    ['gift', 'tipjar-hop'],
    ['sparkle', 'tipjar-glint tipjar-twinkle tipjar-twinkle'],
    ['coin', 'tipjar-turn tipjar-shine'],
    ['tea', 'tipjar-dangle'],
    ['pizza', 'tipjar-serve'],
    ['music', 'tipjar-bop'],
  ] as const) {
    test(`${icon} plays ${animation} on hover`, async ({ page }) => {
      await open(page, { buttons: [{ icon }] });
      await page.locator('.tipjar').hover();
      expect((await parts(page)).join(' ')).toBe(animation);
    });
  }

  test('pixel icons that would blur step instead', async ({ page }) => {
    await open(page, {
      buttons: [
        { icon: 'star', iconStyle: 'pixel' },
        { icon: 'tea', iconStyle: 'pixel', position: 'inline' },
      ],
    });
    await page.locator('.tipjar').first().hover();
    expect(await parts(page)).toEqual(['tipjar-beat', 'none']);
    await page.locator('.tipjar').nth(1).hover();
    expect(await parts(page)).toEqual(['none', 'tipjar-dangle-step']);
  });

  test('a pixel coin turns through its frames, which rest hidden', async ({ page }) => {
    await open(page, { buttons: [{ icon: 'coin', iconStyle: 'pixel' }] });
    const opacity = () =>
      page.locator('[class*="tipjar-turn-"]').evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
    expect(await opacity()).toEqual(['0', '0']);
    await page.locator('.tipjar').hover();
    expect(await parts(page)).toEqual(['tipjar-turn-0', 'tipjar-shine', 'tipjar-turn-1', 'tipjar-turn-2']);
  });

  test('plays on keyboard focus', async ({ page }) => {
    await open(page, { buttons: [{ icon: 'jar' }] });
    await page.keyboard.press('Tab');
    expect(await parts(page)).toEqual(['tipjar-drop']);
  });

  test('loop plays three times on load, then rests', async ({ page }) => {
    await open(page, { buttons: [{ icon: 'jar', animate: 'loop' }] });
    const count = await page.locator('.tipjar-coin').evaluate((el) => getComputedStyle(el).animationIterationCount);
    expect(count).toBe('3');
  });

  test('none never moves, and nor does anything with reduced motion', async ({ page }) => {
    await open(page, { buttons: [{ icon: 'coffee', animate: 'none' }] });
    await page.locator('.tipjar').hover();
    expect(await parts(page)).toEqual(['none', 'none']);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, { buttons: [{ icon: 'coffee', animate: 'loop' }] });
    await page.reload();
    await page.locator('html[data-ready]').waitFor({ state: 'attached' });
    await page.locator('.tipjar').hover();
    expect(await parts(page)).toEqual(['none', 'none']);
  });

  test('moving parts can reach past the button, which does not clip them', async ({ page }) => {
    await open(page, { buttons: [{ icon: 'coffee', compact: 'always' }] });
    expect(await style(page.locator('svg.tipjar-icon'), 'overflow')).toBe('visible');
    expect(await style(page.locator('.tipjar'), 'overflow')).toBe('visible');
  });
});

test.describe('nudge', () => {
  test('tilts the button and plays the icon once, after the wait', async ({ page }) => {
    await open(page, { buttons: [{ icon: 'coffee', nudgeAfter: 0.3 }] });
    const button = page.locator('.tipjar');
    await expect(button).toHaveAttribute('data-nudge', '');
    expect(await style(button, 'animation-name')).toBe('tipjar-nudge');
    const steam = page.locator('.tipjar-steam').first();
    expect(await style(steam, 'animation-name')).toBe('tipjar-waft');
    expect(await style(steam, 'animation-iteration-count')).toBe('1');
  });

  test('never with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, { buttons: [{ nudgeAfter: 0.1 }] });
    await page.waitForTimeout(400);
    await expect(page.locator('.tipjar')).not.toHaveAttribute('data-nudge');
  });
});
