# Changelog

All notable changes to tipjar. Changing a built-in icon's drawing is listed here, since people see it.

## [Unreleased]

- `compact: 'hover'` shows just the icon in a circle, and opens into the full button with the label sliding in on hover or keyboard focus. On touch screens it stays a circle.
- The `hover` option picks a hover effect: `lift` (the default, as before), `pop`, `wiggle`, `shine`, `fill` or `none`. `--tipjar-shine` and `--tipjar-fill` set their colours.
- The `enter` option adds an entrance when the page loads: `fade`, `slide` or `pop`, after `--tipjar-enter-delay` (0.6s by default).
- **Look change:** the button squishes slightly while pressed, on every device.
- Reduced motion now also turns off every new effect, and wins over a site's own transitions on the button.

## [1.0.0] - 2026-11-02

- **Breaking:** `escapeHtml` and `safeHref` are no longer exported. `tipjar()` still checks every link and escapes every text option inside; they were never meant as general-purpose helpers.
- The README has a Stability section saying what semver covers from 1.0.
- The package now includes CHANGELOG.md.
- **Look change:** on a dark page (`prefers-color-scheme: dark`) the default button is now light (`#f4f1ea` fill, `#1f1d2b` label) with a dark ring, instead of a dark button with a white halo. Only tipjar's fallbacks change: a `--tipjar-bg`, `--tipjar-label` or `--tipjar-ring` you set still wins.
- In forced-colours mode (Windows High Contrast) the button gets a `LinkText` border, so it still reads as a button.
- The hover lift only applies on devices that can hover, so it no longer sticks after a tap on a phone.
- **Security:** `href` with control characters before the scheme, such as `"\u0001javascript:…"`, was let through as a relative link, but browsers drop those characters and run it as `javascript:`. It now throws like any other unsafe link.
- With `newTab`, screen readers now hear "(opens in a new tab)" after the label. Change the words with the new `newTabHint` option, or pass `''` for none. The link still has no `noreferrer`; the README explains why and how to hide the referrer site-wide.
- `tuck(button, watch)` tucks a button that's already on the page, such as server-rendered `tipjar()` markup, and returns a function that stops. `mount()` uses it.
- `hideWhenVisible` (and `tuck`) take several elements: a selector watches every match, or pass a list. The button tucks while any of them is on screen.
- A `hideWhenVisible` selector that matches nothing now warns in the console instead of silently doing nothing.
- **Breaking:** tipjar now supports Node 22 and newer (`engines.node` is `>=22`), since Node 20 reached end of life. CI tests Node 22, 24 and 26.

## [0.1.0] - 2026-11-02

- First version: `tipjar()`, `mount()`, `icon()`, `style.css`, and five icons (heart, coffee, star, gift, sparkle) drawn flat, pixel and outline.

[Unreleased]: https://github.com/mtblck/tipjar/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mtblck/tipjar/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/mtblck/tipjar/releases/tag/v0.1.0
