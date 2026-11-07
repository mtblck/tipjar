// The shape of an icon drawing, and helpers for drawing one. All drawings are tipjar's own, in
// `currentColor`. Changing how a drawing looks is noted in CHANGELOG; splitting it into parts
// that look the same is not.

/** A moving part of an icon, drawn on top of the rest. Its class names the animation in style.css. */
export interface Part {
  /** The part's name: `tipjar-<name>` is its class. */
  name: string;
  /** Path data for the 24x24 flat icon, filled. */
  flat: string;
  /** In the flat icon, the width of a same-colour round stroke that softens the part's points. */
  soften?: number;
  /** Path data for the 24x24 outline icon, stroked. */
  outline: string;
  /** Rows of the 12x12 pixel grid, from the top; `#` is filled. */
  pixel: readonly string[];
}

/** One icon, in each style. Its parts, drawn after it, complete the still picture. */
export interface Drawing {
  /** Inner markup for the 24x24 flat icon; empty when the parts are the whole picture. */
  flat: string;
  /** Path data for the 24x24 outline icon, stroked. */
  outline: string;
  /** Rows of the 12x12 pixel grid, from the top; `#` is filled. */
  pixel: readonly string[];
  /** Moving parts, if any. */
  parts?: readonly Part[];
}

/**
 * A flat shape that is just a filled outline, with a same-colour round stroke to soften its points.
 * @param d - Path data.
 * @param width - The stroke's width.
 * @returns A `<path>` element.
 */
export const soft = (d: string, width = 1.5): string =>
  `<path fill="currentColor" stroke="currentColor" stroke-width="${width}" stroke-linejoin="round" d="${d}"/>`;

/**
 * A flat, filled shape.
 * @param d - Path data.
 * @returns A `<path>` element.
 */
export const solid = (d: string): string => `<path fill="currentColor" d="${d}"/>`;

/**
 * Pads a pixel part's rows with empty rows above, so it can be written from the row it starts on.
 * @param top - The row the part starts on.
 * @param rows - The part's rows.
 * @returns Rows from the top of the grid.
 */
export const from = (top: number, rows: readonly string[]): string[] => [...Array(top).fill(''), ...rows];
