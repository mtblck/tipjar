// Builds the page the browser tests ask for. The URL hash is JSON:
//   { "buttons": [options, ...], "footer": true, "grid": true, "theme": true }
// Each button is mounted with `mount()`; `footer` adds a tall page with a footer to tuck under;
// `theme` links theme.css, which sets --tipjar-* the way a site would.
import { ICON_NAMES, ICON_STYLES, mount } from '/dist/index.js';

const spec = JSON.parse(decodeURIComponent(location.hash.slice(1)) || '{}');
const main = document.getElementById('main');

if (spec.theme) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/theme.css';
  await new Promise((resolve) => {
    link.onload = resolve;
    document.head.append(link);
  });
}

if (spec.grid) {
  const grid = document.createElement('div');
  grid.className = 'grid';
  main.append(grid);
  for (const iconStyle of ICON_STYLES) {
    for (const icon of ICON_NAMES) {
      mount({ href: '/', target: grid, position: 'inline', compact: 'always', icon, iconStyle });
    }
  }
}

if (spec.footer) {
  const tall = document.createElement('div');
  tall.className = 'tall';
  const footer = document.createElement('footer');
  footer.innerHTML = '<a href="/">Support this project</a>';
  main.append(tall, footer);
}

for (const options of spec.buttons ?? []) {
  mount({ href: 'https://ko-fi.com/example', ...options });
}

document.documentElement.dataset.ready = 'true';
