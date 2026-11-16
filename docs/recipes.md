# Recipes

Short ways to add tipjar to a site, each run once in a scratch project (React 19, Vue 3.5,
Svelte 5, Astro 7, Next.js 16). Each one loads the stylesheet once, adds the button, and
removes it again when its component goes away. Swap in your own link.

- [React](#react) · [Vue](#vue) · [Svelte](#svelte) · [Astro](#astro) · [Next.js](#nextjs) · [Plain HTML](#plain-html-no-build-step)
- [Star on GitHub, counted at build time](#star-on-github-counted-at-build-time) · [The GitHub logo](#the-github-logo) · [Strict CSP](#strict-csp)

## React

`mount()` in an effect, and its `destroy` as the cleanup. In development, Strict Mode mounts, destroys
and mounts again; that's expected and leaves one button.

```jsx
import { useEffect } from 'react';
import { mount } from 'tipjar';
import 'tipjar/style.css';

export function TipButton() {
  useEffect(() => {
    const { destroy } = mount({
      href: 'https://ko-fi.com/you',
      description: 'this project on Ko-fi',
      hideWhenVisible: 'footer',
    });
    return destroy;
  }, []);
  return null;
}
```

## Vue

```vue
<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { mount } from 'tipjar';
import 'tipjar/style.css';

let tip;
onMounted(() => {
  tip = mount({ href: 'https://ko-fi.com/you', hideWhenVisible: 'footer' });
});
onBeforeUnmount(() => tip?.destroy());
</script>

<template></template>
```

## Svelte

Svelte has its own `mount`, so rename tipjar's. The effect's return value is its cleanup.

```svelte
<script>
  import { mount as mountTip } from 'tipjar';
  import 'tipjar/style.css';

  $effect(() => {
    const tip = mountTip({ href: 'https://ko-fi.com/you', hideWhenVisible: 'footer' });
    return tip.destroy;
  });
</script>
```

## Astro

Render the button on the server with `tipjar()`, so it's in the HTML with no JavaScript, then tuck it
under the footer in a script. Astro bundles the script into a module.

```astro
---
// src/components/TipButton.astro
import { tipjar } from 'tipjar';
import 'tipjar/style.css';

const button = tipjar({ href: 'https://ko-fi.com/you', description: 'this project on Ko-fi' });
---

<Fragment set:html={button} />

<script>
  import { tuck } from 'tipjar';

  const button = document.querySelector('.tipjar');
  if (button) tuck(button, 'footer');
</script>
```

Astro inlines small scripts and stylesheets into the page. On a strict-CSP site, turn on
`security: { csp: true }` in `astro.config.mjs`, and Astro adds their hashes to a CSP `<meta>` tag.

With view transitions (`<ClientRouter />`), run the script on `astro:page-load` instead, and call the
function `tuck` returns on `astro:before-swap`.

## Next.js

Render the markup in a server component and tuck it from a small client component. Import the
stylesheet in your root layout.

```tsx
// app/layout.tsx
import 'tipjar/style.css';
```

```tsx
// app/tip-button.tsx (a server component)
import { tipjar } from 'tipjar';
import { TuckTip } from './tuck-tip';

const html = tipjar({ href: 'https://ko-fi.com/you', description: 'this project on Ko-fi' });

export function TipButton() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <TuckTip />
    </>
  );
}
```

```tsx
// app/tuck-tip.tsx
'use client';
import { useEffect } from 'react';
import { tuck } from 'tipjar';

export function TuckTip() {
  useEffect(() => {
    const button = document.querySelector('.tipjar');
    return button ? tuck(button, 'footer') : undefined;
  }, []);
  return null;
}
```

`tipjar()` escapes everything it's given and checks the link, so its output is safe for
`dangerouslySetInnerHTML`, as long as you don't pass untrusted markup as a custom `icon.svg`.

## Plain HTML, no build step

Load the stylesheet and the module from a CDN, pinned to an exact version:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tipjar@1.0.0/style.css" />
<script type="module" src="/tip.js"></script>
```

```js
// tip.js
import { mount } from 'https://cdn.jsdelivr.net/npm/tipjar@1.0.0/dist/index.js';

mount({ href: 'https://ko-fi.com/you', hideWhenVisible: 'footer' });
```

A CDN sees your visitors' IP addresses. To keep it all on your own site, copy
`node_modules/tipjar/style.css` and `node_modules/tipjar/dist/` next to your pages and change the
URLs to point at them.

## Star on GitHub, counted at build time

Ask GitHub for the star count while the site builds, so visitors never call GitHub themselves and no
CSP change is needed. In Astro, frontmatter runs at build time:

```astro
---
// src/components/StarButton.astro
import { githubStars, tipjar } from 'tipjar';
import 'tipjar/style.css';

const stars = await githubStars('you/project', { token: import.meta.env.GITHUB_TOKEN });
const button = tipjar({
  href: 'https://github.com/you/project',
  label: 'Star on GitHub',
  icon: 'star',
  count: stars,
});
---

<Fragment set:html={button} />
```

The count is as fresh as the last build. The token is optional; it helps when a CI runner shares its
address with other GitHub API users. If GitHub can't answer, `stars` is `undefined` and the button
shows no count.

## The GitHub logo

tipjar's built-in icons are its own drawings, so it ships no brand logos. For a "Star on GitHub" button
you can pass GitHub's mark yourself as a custom icon. This is `mark-github` from GitHub's
[Octicons](https://primer.style/octicons/) (MIT), drawn in `currentColor` so it themes like the rest:

```js
const githubMark =
  '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">' +
  '<path d="M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656"/></svg>';

mount({
  href: 'https://github.com/you/project',
  label: 'Star on GitHub',
  icon: { svg: githubMark },
  count: await githubStars('you/project'),
});
```

It works the same for a link in a menu: `{ href, label, icon: { svg: githubMark } }`. The mark is
GitHub's trademark, so check [GitHub's logo guidelines](https://github.com/logos) before you change
its shape or colour. A custom icon doesn't move on hover the way the built-in ones do.

## Strict CSP

tipjar works under `default-src 'self'` with no `unsafe-inline`:

- Link the stylesheet; don't inline it.
- Load your script from a file (`<script type="module" src>`), as above, not an inline `<script>`.
- Theme with the `--tipjar-*` custom properties in your own stylesheet, and leave out `look`, which
  writes an inline `style` attribute that a strict CSP blocks.
- Calling `githubStars()` in the browser needs `connect-src https://api.github.com`. Fetching the
  count at build time, as above, needs nothing.

```css
:root {
  --tipjar-bg: #3a26c9;
  --tipjar-label: #ffffff;
}
```

If you load from a CDN, add it to `script-src` and `style-src`, such as
`script-src 'self' https://cdn.jsdelivr.net`.
