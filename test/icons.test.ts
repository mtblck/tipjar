import { describe, expect, it } from 'vitest';
import { ICON_NAMES, ICON_STYLES, icon, pixelPath } from '../src/icons.js';

describe('icon', () => {
  it('draws every icon in every style', () => {
    for (const name of ICON_NAMES) {
      for (const style of ICON_STYLES) {
        const svg = icon(name, style);
        expect(svg).toMatch(/^<svg class="tipjar-icon" aria-hidden="true"/);
        expect(svg).toContain('currentColor');
        expect(svg.endsWith('</svg>')).toBe(true);
      }
    }
  });

  it('keeps the drawings stable', () => {
    expect(Object.fromEntries(ICON_NAMES.map((n) => [n, ICON_STYLES.map((s) => icon(n, s))]))).toMatchSnapshot();
  });

  it('draws moving parts last, with a class that names their animation', () => {
    expect(icon('coffee', 'flat')).toMatch(/(<path class="tipjar-part tipjar-steam" d="[^"]+"\/>){2}<\/svg>$/);
    expect(icon('jar', 'outline')).toMatch(/<path class="tipjar-part tipjar-coin" d="[^"]+"\/><\/svg>$/);
    // Pixel parts step a whole cell at a time.
    expect(icon('jar', 'pixel')).toContain('class="tipjar-part tipjar-coin tipjar-step"');
  });

  it('gives every icon a moving part, and draws no empty paths', () => {
    for (const name of ICON_NAMES) {
      for (const style of ICON_STYLES) {
        expect(icon(name, style)).toContain('tipjar-part');
        expect(icon(name, style)).not.toMatch(/d=""/);
      }
    }
  });

  it('defaults to flat', () => {
    expect(icon('heart')).toBe(icon('heart', 'flat'));
  });

  it('draws pixel icons on a crisp 12x12 grid', () => {
    expect(icon('star', 'pixel')).toContain('viewBox="0 0 12 12" shape-rendering="crispEdges"');
  });

  it('rejects unknown names and styles', () => {
    // @ts-expect-error not an icon
    expect(() => icon('rocket')).toThrow(/unknown icon "rocket"/);
    // @ts-expect-error not a style
    expect(() => icon('heart', 'neon')).toThrow(/unknown icon style "neon"/);
  });
});

describe('pixelPath', () => {
  it('merges each run of cells into one rectangle', () => {
    expect(pixelPath(['.##.', '#..#'])).toBe('M1 0h2v1H1zM0 1h1v1H0zM3 1h1v1H3z');
  });
});
