# tipjar

A small floating tip button for Ko-fi, Buy Me a Coffee, GitHub Sponsors or any link. It sits in a corner of the page, folds to just its icon on a phone, and can tuck itself away when your footer, with its own support link, scrolls into view.

- **Zero dependencies.** A function that returns an HTML string, one CSS file, and an optional `mount()` for the browser.
- **Works under a strict CSP.** No inline scripts, and no inline styles unless you ask for them. Theme it with CSS custom properties.
- **Its own icons.** Heart, coffee, star, gift and sparkle, each drawn flat, pixel or outline, all in `currentColor`. Or bring your own SVG.
- **Accessible.** A real link with a name that includes its visible text, a 44px target, a visible focus ring, and no motion for people who ask for less.

```sh
npm i tipjar
```

## Use it

In the browser:

```js
import { mount } from 'tipjar';
import 'tipjar/style.css';

mount({
  href: 'https://ko-fi.com/you',
  description: 'this project on Ko-fi', // read after "Support" by screen readers
  icon: 'coffee',
  iconStyle: 'pixel',
  hideWhenVisible: 'footer',
});
```

On the server, or in any template, `tipjar()` returns the markup:

```js
import { tipjar } from 'tipjar';

const html = tipjar({ href: 'https://github.com/sponsors/you', label: 'Sponsor', icon: 'heart' });
```

Copy `node_modules/tipjar/style.css` next to your other stylesheets if you don't use a bundler.

## Options

| Option | Default | |
| --- | --- | --- |
| `href` | (required) | http, https, mailto or a relative URL. Anything else throws, so the button can't run script. |
| `label` | `"Support"` | The visible text. |
| `description` | none | Extra words for screen readers, read after the label. |
| `icon` | `"heart"` | `heart`, `coffee`, `star`, `gift`, `sparkle`; `false` for none; or `{ svg: '<svg…>' }` for your own. Custom SVG is inserted as is, so only pass markup you trust. |
| `iconStyle` | `"flat"` | `flat`, `pixel` or `outline`. |
| `position` | `"bottom-right"` | `bottom-left`, `top-right`, `top-left`, or `inline` to flow with the page. |
| `compact` | `"auto"` | When to show only the icon: `auto` (under 600px wide), `always` or `never`. |
| `newTab` | `false` | Open the link in a new tab, with `rel="noopener"`. Screen readers hear the `newTabHint` after the label. |
| `newTabHint` | `"(opens in a new tab)"` | With `newTab`, words read to screen readers so people know a tab will open. Translate it, or `''` for none. |
| `look` | none | `{ background, label, icon, radius }` written as inline custom properties. Leave it out on strict-CSP sites. |
| `className` | none | More classes for the link. |

`mount()` also takes `target` (default `document.body`) and `hideWhenVisible`. It returns `{ element, destroy }`.

## Tuck it away

`hideWhenVisible` hides the button while any of the elements it names is on screen, usually a footer with its own support link. It takes an element, a selector (every match is watched) or a list of elements. A selector is looked up once, when the button mounts, so run it after the footer is on the page; if nothing matches, tipjar warns in the console and the button keeps showing.

For a button that's already on the page, such as `tipjar()` markup rendered on the server or by a static site generator, use `tuck()`:

```js
import { tuck } from 'tipjar';

const untuck = tuck(document.querySelector('.tipjar'), 'footer, .support-links');
// Later, to stop watching and show it again:
untuck();
```

A tucked button gets `data-tucked`, which hides it and takes it out of the tab order.

`icon(name, style)` returns a single icon as an SVG string, and `ICON_NAMES` and `ICON_STYLES` list them.

## Referrer

The link doesn't add `rel="noreferrer"`, so Ko-fi, Buy Me a Coffee and the like can see which site a tip came from, which many people want. What they see follows your site's referrer policy; browsers default to sending only your origin (`https://you.dev/`), never the full page URL. To send nothing, set a `Referrer-Policy: no-referrer` header or `<meta name="referrer" content="no-referrer">` on your site.

## Theme it

Set any of these on `.tipjar` or an ancestor, such as `:root`:

```css
:root {
  --tipjar-bg: #3a26c9;         /* fill */
  --tipjar-label: #fff;         /* text */
  --tipjar-icon: currentColor;  /* icon */
  --tipjar-ring: #f6f3ec;       /* ring of page colour around the button */
  --tipjar-radius: 999px;
  --tipjar-font: inherit;
  --tipjar-font-size: 0.875rem;
  --tipjar-weight: 600;
  --tipjar-size: 44px;          /* height, and width when compact */
  --tipjar-icon-size: 16px;
  --tipjar-offset: 16px;        /* distance from the screen edges */
  --tipjar-z: 50;
}
```

There are also `--tipjar-gap`, `--tipjar-pad`, `--tipjar-tracking`, `--tipjar-border`, `--tipjar-shadow` and `--tipjar-focus`. For dark mode, set them again inside your own dark-theme selector.

Pixel icons sit on a 12×12 grid and are sharpest at 12, 24 or 48px.

## Releasing

`npm run release -- 0.2.0` moves the CHANGELOG's [Unreleased] entries under a dated 0.2.0 heading and sets the version. Open that as a PR; merging it makes `.github/workflows/release.yml` publish to npm with provenance, tag `v0.2.0` and create the GitHub release. Pushing a `v*` tag by hand does the same. Publishing uses npm trusted publishing, so no token is stored.

## Licence

MIT. The icons are tipjar's own drawings and ship under the same licence. Brand logos are left out on purpose; pass them with `icon: { svg }` if their owners allow it.
