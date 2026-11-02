# Recipes

Short ways to add tipjar to a site, each run once in a scratch project (React 19, Vue 3.5,
Svelte 5, Astro 7, Next.js 16). Each one loads the stylesheet once, adds the button, and
removes it again when its component goes away. Swap in your own link.

- [React](#react) · [Vue](#vue) · [Svelte](#svelte) · [Astro](#astro) · [Next.js](#nextjs) · [Plain HTML](#plain-html-no-build-step)
- [Strict CSP](#strict-csp)

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

## Strict CSP

tipjar works under `default-src 'self'` with no `unsafe-inline`:

- Link the stylesheet; don't inline it.
- Load your script from a file (`<script type="module" src>`), as above, not an inline `<script>`.
- Theme with the `--tipjar-*` custom properties in your own stylesheet, and leave out `look`, which
  writes an inline `style` attribute that a strict CSP blocks.

```css
:root {
  --tipjar-bg: #3a26c9;
  --tipjar-label: #ffffff;
}
```

If you load from a CDN, add it to `script-src` and `style-src`, such as
`script-src 'self' https://cdn.jsdelivr.net`.
