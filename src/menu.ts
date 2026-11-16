import { countMarkup } from './count.js';
import { escapeHtml, safeHref } from './escape.js';
import type { IconName, IconStyle } from './icons.js';

/** One way to support, in the menu the button opens: see `links` in {@link TipjarOptions}. */
export interface TipjarLink {
  /** Where it goes: http, https, mailto or a relative URL. */
  href: string;
  /** The visible text, such as "Buy me a coffee". */
  label: string;
  /** A built-in icon, `false` for none, or `{ svg }` with your own trusted SVG markup. Defaults to none. */
  icon?: IconName | false | { svg: string };
  /** Extra words for screen readers, read after the label. */
  description?: string;
  /** A number after the label, such as stars from `githubStars()`. */
  count?: number | string;
}

/** What the menu takes from the button's own options. */
export interface MenuParts {
  /** The button's class and data attributes, already escaped, starting with a space. */
  attrs: string;
  /** The button's icon and label markup. */
  inner: string;
  /** The menu's id, linking the button to it. */
  id: string;
  /** The button's position, for where the menu opens. */
  position: string;
  /** Extra attributes for the list, such as `data-animate`. */
  listAttrs: string;
  /** The `target` and `rel` for each link, or nothing. */
  target: string;
  /** Words for screen readers when links open a new tab, or nothing. */
  hint: string;
  /** Draws a link's icon. */
  drawIcon: (choice: TipjarLink['icon'], style: IconStyle) => string;
  /** The style for the links' built-in icons. */
  iconStyle: IconStyle;
}

let made = 0;

/**
 * A fresh id for a menu, unique on the page as long as one script renders every button.
 * @returns An id such as `tipjar-menu-1`.
 */
export function menuId(): string {
  made += 1;
  return `tipjar-menu-${made}`;
}

function item(link: TipjarLink, parts: MenuParts): string {
  if (!link || typeof link.label !== 'string' || !link.label) throw new TypeError('tipjar: every link needs a label');
  const href = safeHref(link.href);
  const extra = [link.description, parts.hint].filter(Boolean).join(' ');
  const sr = extra ? `<span class="tipjar-sr"> ${escapeHtml(extra)}</span>` : '';
  const ico = link.icon === undefined ? '' : parts.drawIcon(link.icon, parts.iconStyle);
  return (
    `<li><a class="tipjar-item" href="${escapeHtml(href)}"${parts.target}>${ico}` +
    `<span class="tipjar-label">${escapeHtml(link.label)}${sr}</span>${countMarkup(link.count)}</a></li>`
  );
}

/**
 * Builds a button that opens a list of links, with the browser's popover: no script, so it works
 * under a strict CSP and from server-rendered markup. Escape and a click outside close it.
 * @param links - The ways to support, in order.
 * @param parts - The button's markup and settings.
 * @returns The button and its list, in a `.tipjar-menu` wrapper.
 */
export function menuMarkup(links: readonly TipjarLink[], parts: MenuParts): string {
  if (!Array.isArray(links) || links.length === 0) throw new TypeError('tipjar: `links` needs at least one link');
  const id = escapeHtml(parts.id);
  return (
    `<div class="tipjar-menu"><button type="button" popovertarget="${id}"${parts.attrs}>` +
    `${parts.inner}</button><ul class="tipjar-list" id="${id}" popover data-position="${escapeHtml(parts.position)}"` +
    `${parts.listAttrs}>${links.map((link) => item(link, parts)).join('')}</ul></div>`
  );
}
