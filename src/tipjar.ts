import { escapeHtml, safeCss, safeHref } from './escape.js';
import { icon as drawIcon, type IconName, type IconStyle } from './icons.js';

/** Where the button sits: a corner of the screen, or `inline` to flow with the page. */
export type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'inline';

/**
 * When the label folds away, leaving the icon: under 600px wide (`auto`), always, never, or
 * `hover`: a circle that opens into the full button on hover or keyboard focus.
 */
export type Compact = 'auto' | 'always' | 'never' | 'hover';

/**
 * What the whole button does on hover: lift (the default), pop, wiggle, shine, fill, or nothing. The
 * icon's own moving part is `animate`. A `compact: 'hover'` button opens instead of lifting, popping
 * or wiggling.
 */
export type Hover = 'lift' | 'pop' | 'wiggle' | 'shine' | 'fill' | 'none';

/** When an icon's moving parts play: on hover or focus (the default), three times on load and on hover, or never. */
export type Animate = 'hover' | 'loop' | 'none';

/** How the button arrives when the page loads: no animation (the default), fade, slide or pop. */
export type Enter = 'none' | 'fade' | 'slide' | 'pop';

/** Colours and shape, written as inline CSS custom properties. Strict-CSP sites set the `--tipjar-*` properties in CSS instead. */
export interface TipjarLook {
  /** The button's fill. */
  background?: string;
  /** The label's colour. */
  label?: string;
  /** The icon's colour. Defaults to the label's. */
  icon?: string;
  /** Corner radius: a CSS length, or a number of pixels. */
  radius?: string | number;
}

/** Options for {@link tipjar}. */
export interface TipjarOptions {
  /** Where the button goes: your Ko-fi, Buy Me a Coffee, GitHub Sponsors or any page. */
  href: string;
  /** The visible text. Defaults to "Support". */
  label?: string;
  /** Extra words for screen readers, read after the label, such as "this project on Ko-fi". */
  description?: string;
  /** A built-in icon, `false` for none, or `{ svg }` with your own trusted SVG markup. Defaults to heart. */
  icon?:
    | IconName
    | false
    | {
        /** Your own SVG markup, inserted as is: pass only markup you trust. */
        svg: string;
      };
  /** How the built-in icon is drawn. Defaults to flat. */
  iconStyle?: IconStyle;
  /** Defaults to bottom-right. */
  position?: Position;
  /** Defaults to auto. */
  compact?: Compact;
  /** The hover effect. Defaults to lift. Only on devices that can hover; with reduced motion, nothing moves. */
  hover?: Hover;
  /**
   * When the built-in icon's moving part plays (the heart beats, the steam rises): `hover` (the
   * default, also on keyboard focus), `loop` (three times when the page loads, and on hover) or
   * `none`. Nothing moves for people who ask for less motion.
   */
  animate?: Animate;
  /** An entrance animation, after `--tipjar-enter-delay` (0.6s). Defaults to none. */
  enter?: Enter;
  /** Open the link in a new tab. Defaults to false. */
  newTab?: boolean;
  /**
   * With `newTab`, words read to screen readers after the label and description, so people know
   * a tab will open. Defaults to "(opens in a new tab)"; translate it, or pass `''` for none.
   */
  newTabHint?: string;
  /** Inline colours and radius. Leave out on strict-CSP sites and use CSS. */
  look?: TipjarLook;
  /** More classes for the link. */
  className?: string;
}

const LOOK_VARS: Record<keyof TipjarLook, string> = {
  background: '--tipjar-bg',
  label: '--tipjar-label',
  icon: '--tipjar-icon',
  radius: '--tipjar-radius',
};

const POSITIONS: readonly Position[] = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'inline'];
const COMPACTS: readonly Compact[] = ['auto', 'always', 'never', 'hover'];
const HOVERS: readonly Hover[] = ['lift', 'pop', 'wiggle', 'shine', 'fill', 'none'];
const ANIMATES: readonly Animate[] = ['hover', 'loop', 'none'];
const ENTERS: readonly Enter[] = ['none', 'fade', 'slide', 'pop'];

function oneOf<T extends string>(name: string, value: T, allowed: readonly T[]): T {
  if (!allowed.includes(value)) throw new TypeError(`tipjar: unknown ${name} "${String(value)}"`);
  return value;
}

function iconMarkup(choice: TipjarOptions['icon'], style: IconStyle): string {
  if (choice === false) return '';
  if (typeof choice === 'object' && choice !== null) {
    return `<span class="tipjar-icon" aria-hidden="true">${choice.svg}</span>`;
  }
  return drawIcon(choice ?? 'heart', style);
}

function styleAttr(look: TipjarLook | undefined): string {
  if (!look) return '';
  const decls = (Object.keys(LOOK_VARS) as (keyof TipjarLook)[])
    .filter((key) => look[key] !== undefined)
    .map((key) => `${LOOK_VARS[key]}:${safeCss(key, look[key] as string | number)}`);
  return decls.length ? ` style="${escapeHtml(decls.join(';'))}"` : '';
}

/**
 * Builds the tip button as an HTML string: an `<a class="tipjar">` with an icon and a label.
 * Pair it with `tipjar/style.css`. The output has no script and, without `look`, no inline styles.
 * @param options - Link, label, icon and placement.
 * @returns The button's HTML.
 */
export function tipjar(options: TipjarOptions): string {
  const href = safeHref(options.href);
  const label = options.label ?? 'Support';
  const position = oneOf('position', options.position ?? 'bottom-right', POSITIONS);
  const compact = oneOf('compact', options.compact ?? 'auto', COMPACTS);
  const hover = oneOf('hover', options.hover ?? 'lift', HOVERS);
  const enter = oneOf('enter', options.enter ?? 'none', ENTERS);
  const animate = oneOf('animate', options.animate ?? 'hover', ANIMATES);
  const classes = ['tipjar', ...(options.className ? options.className.split(/\s+/).filter(Boolean) : [])];
  const target = options.newTab ? ' target="_blank" rel="noopener"' : '';
  const hint = options.newTab ? (options.newTabHint ?? '(opens in a new tab)') : '';
  const extra = [options.description, hint].filter(Boolean).join(' ');
  const sr = extra ? `<span class="tipjar-sr"> ${escapeHtml(extra)}</span>` : '';
  const ico = iconMarkup(options.icon, options.iconStyle ?? 'flat');
  // With no icon there is nothing to fold to, so the label always shows.
  const fold = ico ? compact : 'never';
  // The defaults write nothing, so markup from before these options existed is unchanged.
  const motion =
    (hover === 'lift' ? '' : ` data-hover="${hover}"`) +
    (enter === 'none' ? '' : ` data-enter="${enter}"`) +
    (animate === 'hover' ? '' : ` data-animate="${animate}"`);
  return (
    `<a class="${escapeHtml(classes.join(' '))}" href="${escapeHtml(href)}"${target}` +
    ` data-position="${escapeHtml(position)}" data-compact="${escapeHtml(fold)}"${motion}${styleAttr(options.look)}>` +
    `${ico}<span class="tipjar-label">${escapeHtml(label)}${sr}</span></a>`
  );
}
