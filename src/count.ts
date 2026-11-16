import { escapeHtml } from './escape.js';

function trimmed(value: number, unit: string): string {
  // Round down, so a count never shows more than there is: 12,399 is 12.3k, not 12.4k.
  const tenths = Math.floor(value * 10) / 10;
  return `${tenths.toFixed(1).replace(/\.0$/, '')}${unit}`;
}

/**
 * Shortens a count the way GitHub does: 999, 1,204, 12.3k, 1.2M.
 * @param count - A whole number, 0 or more.
 * @returns The count as short text.
 */
export function formatCount(count: number): string {
  if (!Number.isFinite(count) || count < 0) throw new TypeError(`tipjar: invalid count "${count}"`);
  const whole = Math.floor(count);
  if (whole >= 1_000_000) return trimmed(whole / 1_000_000, 'M');
  if (whole >= 10_000) return trimmed(whole / 1_000, 'k');
  return whole.toLocaleString('en-US');
}

/**
 * The count's markup, placed after the label's text: a number is shortened, text is shown as is.
 * @param count - A number, your own text such as "1 204", or nothing.
 * @returns The count's HTML, or an empty string.
 */
export function countMarkup(count: number | string | undefined): string {
  if (count === undefined || count === '') return '';
  const text = typeof count === 'number' ? formatCount(count) : String(count);
  return ` <span class="tipjar-count">${escapeHtml(text)}</span>`;
}
