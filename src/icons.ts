import { DRAWINGS, type Part } from './drawings.js';

/** The built-in icons. Every drawing is tipjar's own, in `currentColor`. */
export const ICON_NAMES = ['heart', 'coffee', 'star', 'gift', 'sparkle', 'jar'] as const;
/** The three ways each icon is drawn. */
export const ICON_STYLES = ['flat', 'pixel', 'outline'] as const;

/** One of the built-in icons. */
export type IconName = (typeof ICON_NAMES)[number];
/** Flat (solid, softened corners), pixel (a 12x12 grid) or outline (a 2px stroke). */
export type IconStyle = (typeof ICON_STYLES)[number];

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
      .map((part) => `<path class="tipjar-part tipjar-${part.name}${extra}" d="${draw(part)}"/>`)
      .join('');
  if (style === 'pixel') {
    const grid = pixelPath(drawing.pixel);
    const moving = parts((part) => pixelPath(part.pixel), ' tipjar-step');
    return `${open} viewBox="0 0 12 12" shape-rendering="crispEdges" fill="currentColor"><path d="${grid}"/>${moving}</svg>`;
  }
  if (style === 'outline') {
    const pen = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    return `${open} viewBox="0 0 24 24" ${pen}><path d="${drawing.outline}"/>${parts((part) => part.outline)}</svg>`;
  }
  if (style === 'flat') {
    return `${open} viewBox="0 0 24 24" fill="currentColor">${drawing.flat}${parts((part) => part.flat)}</svg>`;
  }
  throw new TypeError(`tipjar: unknown icon style "${String(style)}"`);
}
