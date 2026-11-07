import type { Drawing, Part } from './drawing.js';
import { FIRST_DRAWINGS } from './drawings.js';
import { MORE_DRAWINGS } from './drawings-more.js';

/** The built-in icons. Every drawing is tipjar's own, in `currentColor`. */
export const ICON_NAMES = [
  'heart',
  'coffee',
  'star',
  'gift',
  'sparkle',
  'jar',
  'coin',
  'tea',
  'pizza',
  'music',
] as const;
/** The three ways each icon is drawn. */
export const ICON_STYLES = ['flat', 'pixel', 'outline'] as const;

/** One of the built-in icons. */
export type IconName = (typeof ICON_NAMES)[number];
/** Flat (solid, softened corners), pixel (a 12x12 grid) or outline (a 2px stroke). */
export type IconStyle = (typeof ICON_STYLES)[number];

const DRAWINGS: Record<IconName, Drawing> = { ...FIRST_DRAWINGS, ...MORE_DRAWINGS };

/**
 * Turns a grid of `#` cells into one path, a rectangle per horizontal run.
 * @param rows - Rows of equal length; `#` marks a filled cell.
 * @returns SVG path data.
 */
export function pixelPath(rows: readonly string[]): string {
  let d = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== '#') continue;
      let end = x;
      while (row[end + 1] === '#') end++;
      d += `M${x} ${y}h${end - x + 1}v1H${x}z`;
      x = end;
    }
  });
  return d;
}

/**
 * Draws a built-in icon as an SVG string, hidden from screen readers (the label names the button).
 * @param name - Which icon.
 * @param style - Flat, pixel or outline. Defaults to flat.
 * @returns An `<svg>` element as a string, sized by CSS.
 */
export function icon(name: IconName, style: IconStyle = 'flat'): string {
  const drawing = DRAWINGS[name];
  if (!drawing) throw new TypeError(`tipjar: unknown icon "${String(name)}"`);
  const open = '<svg class="tipjar-icon" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"';
  // Moving parts go on top. Pixel parts move a whole cell at a time (tipjar-step in style.css).
  const parts = (draw: (part: Part) => string, extra = ''): string =>
    (drawing.parts ?? [])
      .map((part) => `<path class="tipjar-part tipjar-${part.name}${extra}" ${draw(part)}/>`)
      .join('');
  const body = (d: string): string => (d ? `<path d="${d}"/>` : '');
  if (style === 'pixel') {
    const moving = parts((part) => `d="${pixelPath(part.pixel)}"`, ' tipjar-step');
    return `${open} viewBox="0 0 12 12" shape-rendering="crispEdges" fill="currentColor">${body(pixelPath(drawing.pixel))}${moving}</svg>`;
  }
  if (style === 'outline') {
    const pen = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    return `${open} viewBox="0 0 24 24" ${pen}>${body(drawing.outline)}${parts((part) => `d="${part.outline}"`)}</svg>`;
  }
  if (style === 'flat') {
    const moving = parts((part) =>
      part.soften
        ? `stroke="currentColor" stroke-width="${part.soften}" stroke-linejoin="round" d="${part.flat}"`
        : `d="${part.flat}"`,
    );
    return `${open} viewBox="0 0 24 24" fill="currentColor">${drawing.flat}${moving}</svg>`;
  }
  throw new TypeError(`tipjar: unknown icon style "${String(style)}"`);
}
