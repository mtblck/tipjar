# Contributing

Thanks for helping. Issues and pull requests are welcome; for anything bigger than a fix, open an
issue first so we can agree on the shape.

## Set up

Node 22 or newer.

```sh
npm ci
npm test            # vitest
npm run lint        # biome
npm run typecheck   # tsc
npm run build       # dist/
npm run test:browser  # Playwright in Chromium: layout, tucking, motion, axe
```

CI runs the first four on Node 22, 24 and 26, and the browser tests on Ubuntu 24.04. The browser
tests compare a few screenshots, made on Linux; after a deliberate visual change, refresh them with
`npm run test:browser -- --update-snapshots` (on Linux, or in the Playwright Docker image) and
look at the new images before committing.

## House rules

- **Zero runtime dependencies.** The package is a string builder, a DOM helper and one CSS file.
- **Strict CSP first.** No inline scripts. Inline styles only through the opt-in `look` option.
  Theming is the `--tipjar-*` custom properties in `style.css`.
- **No unsafe links.** `href` allows http, https, mailto and relative URLs only.
- **Our own icons, no brand logos.** Every built-in icon is tipjar's own drawing, flat (24x24),
  pixel (12x12 grid) or outline (2px stroke), all in `currentColor`. Don't add Ko-fi, PayPal or
  other brand marks; people can pass those with `icon: { svg }` if the owners allow it.
- **Changing a built-in icon's drawing is visible to users,** so note it in CHANGELOG.
- Keep TypeScript files under 200 lines. Exported functions get JSDoc and explicit return types.
- Add a line under `## [Unreleased]` in CHANGELOG.md for anything a user would notice.

## Releases

Only the maintainer releases. `npm run release -- x.y.z` moves the CHANGELOG's [Unreleased]
entries under a dated heading and sets the version; that becomes a release PR. Merging it makes
`.github/workflows/release.yml` publish to npm with provenance, tag `vx.y.z` and create the GitHub
release. Only a release PR changes `version` in package.json.

## Security

Please report security problems privately; see [SECURITY.md](SECURITY.md).
