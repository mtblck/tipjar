/**
 * Escapes text for use in HTML content or a double-quoted attribute.
 * @param text - Any text.
 * @returns The text with `& < > " '` escaped.
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

const SAFE_SCHEME = /^(https?:|mailto:)/i;
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Checks a link target: http, https, mailto and relative URLs pass; any other scheme
 * (javascript:, data: and so on) throws, so a tip button can never run script.
 * @param href - The link target.
 * @returns The trimmed target.
 */
export function safeHref(href: string): string {
  const trimmed = String(href ?? '').trim();
  // Browsers ignore tabs and newlines inside a scheme, so judge the URL without them.
  const squeezed = trimmed.replace(/[\t\n\r]/g, '');
  if (!trimmed) throw new TypeError('tipjar: `href` is required');
  if (HAS_SCHEME.test(squeezed) && !SAFE_SCHEME.test(squeezed)) {
    throw new TypeError(`tipjar: unsupported link "${trimmed}"; use http, https, mailto or a relative URL`);
  }
  return trimmed;
}

/**
 * Checks a CSS value for an inline custom property: anything that could end the
 * declaration or the attribute (`; { } < > " ' \`) throws.
 * @param name - The option's name, for the error.
 * @param value - A CSS value such as `#3a26c9` or `12px`.
 * @returns The value as a string.
 */
export function safeCss(name: string, value: string | number): string {
  const text = typeof value === 'number' ? `${value}px` : String(value).trim();
  if (!text || /[;{}<>"'\\]/.test(text)) throw new TypeError(`tipjar: invalid CSS value for \`${name}\``);
  return text;
}
