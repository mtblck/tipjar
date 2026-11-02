# Changelog

All notable changes to tipjar. Changing a built-in icon's drawing is listed here, since people see it.

## [Unreleased]

- **Security:** `href` with control characters before the scheme, such as `"\u0001javascript:…"`, was let through as a relative link, but browsers drop those characters and run it as `javascript:`. It now throws like any other unsafe link.
- With `newTab`, screen readers now hear "(opens in a new tab)" after the label. Change the words with the new `newTabHint` option, or pass `''` for none. The link still has no `noreferrer`; the README explains why and how to hide the referrer site-wide.
- `tuck(button, watch)` tucks a button that's already on the page, such as server-rendered `tipjar()` markup, and returns a function that stops. `mount()` uses it.
- `hideWhenVisible` (and `tuck`) take several elements: a selector watches every match, or pass a list. The button tucks while any of them is on screen.
- A `hideWhenVisible` selector that matches nothing now warns in the console instead of silently doing nothing.
- **Breaking:** tipjar now supports Node 22 and newer (`engines.node` is `>=22`), since Node 20 reached end of life. CI tests Node 22, 24 and 26.

## [0.1.0] - 2026-11-02

- First version: `tipjar()`, `mount()`, `icon()`, `style.css`, and five icons (heart, coffee, star, gift, sparkle) drawn flat, pixel and outline.

[Unreleased]: https://github.com/mtblck/tipjar/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/mtblck/tipjar/releases/tag/v0.1.0
