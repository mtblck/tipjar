# Security

## Reporting a problem

Please report security problems privately through GitHub's
[private vulnerability reporting](https://github.com/mtblck/tipjar/security/advisories/new),
not in a public issue. Fixes go out as a patch release, and the
advisory is published once the release is on npm.

Only the latest release gets security fixes.

## Trust model

tipjar turns options into an HTML string. What it checks, and what it trusts you with:

- **`href` is checked.** http, https, mailto and relative URLs pass. Any other scheme, such as
  `javascript:` or `data:`, throws, including when it is hidden with tabs or newlines.
- **Text is escaped.** `label`, `description` and `className` are escaped for HTML, so they can
  come from user input.
- **`look` values are checked.** Each is written into an inline `style` attribute, and anything
  that could end the declaration or the attribute (`; { } < > " ' \`) throws. Sites with a
  strict CSP should leave `look` out and set the `--tipjar-*` properties in CSS.
- **Custom icon SVG is trusted.** `icon: { svg }` is inserted as is. Pass only markup you wrote or
  sanitised yourself, never user input.

tipjar has no runtime dependencies, makes no network requests, and sets no cookies or storage.
The link is an ordinary `<a>`, so the browser's own referrer policy applies when it's followed.

A bug where checked input gets past these checks is a security problem. Passing untrusted markup as
`icon.svg` is not.
