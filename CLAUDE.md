# tipjar

A floating tip button as an HTML string plus one CSS file: zero runtime dependencies, ESM only,
TypeScript, MIT. Public npm package `tipjar`, repo `mtblck/tipjar`. First used on seedkin.dev.

## Commands

`npm test` · `npm run lint` · `npm run typecheck` · `npm run build`

## Load-bearing decisions

- **Strict CSP first.** No inline scripts; inline styles only through the opt-in `look` option.
  Theming is the `--tipjar-*` custom properties in `style.css`.
- **No unsafe links.** `safeHref` allows http, https, mailto and relative URLs only. Custom icon
  SVG is the one raw input, documented as trusted.
- **Icons are our own drawings** (flat, pixel 12x12, outline 2px), all `currentColor`. No brand logos.
- Changing a built-in icon's drawing is visible to users: note it in CHANGELOG.

## What bites

- Commit as `mtblck <105079242+mtblck@users.noreply.github.com>`.
- npm 10 crashes ("edgesOut") installing vitest in Claude's sandbox; use `npx npm@11 i`.
- Keep TypeScript files under 200 lines; exported functions get JSDoc and explicit return types.
- Don't publish to npm or push tags; Matt publishes.
