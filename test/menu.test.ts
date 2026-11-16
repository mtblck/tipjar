import { describe, expect, it } from 'vitest';
import { icon } from '../src/icons.js';
import { tipjar } from '../src/tipjar.js';

const links = [
  { href: 'https://ko-fi.com/you', label: 'Ko-fi', icon: 'coffee' as const },
  { href: 'https://github.com/you/project', label: 'Star on GitHub', icon: 'star' as const, count: 1204 },
];

describe('menu', () => {
  it('builds a button that opens a popover list of links, with no script', () => {
    const html = tipjar({ links, menuId: 'm' });
    expect(html).toBe(
      '<div class="tipjar-menu"><button type="button" popovertarget="m" class="tipjar"' +
        ` data-position="bottom-right" data-compact="auto">${icon('heart', 'flat')}` +
        '<span class="tipjar-label">Support</span></button>' +
        '<ul class="tipjar-list" id="m" popover data-position="bottom-right">' +
        `<li><a class="tipjar-item" href="https://ko-fi.com/you">${icon('coffee', 'flat')}` +
        '<span class="tipjar-label">Ko-fi</span></a></li>' +
        `<li><a class="tipjar-item" href="https://github.com/you/project">${icon('star', 'flat')}` +
        '<span class="tipjar-label">Star on GitHub</span> <span class="tipjar-count">1,204</span></a></li>' +
        '</ul></div>',
    );
    expect(html).not.toContain('<script');
  });

  it('gives each menu its own id unless one is given', () => {
    const first = /popovertarget="([^"]+)"/.exec(tipjar({ links }))?.[1];
    const second = /popovertarget="([^"]+)"/.exec(tipjar({ links }))?.[1];
    expect(first).toMatch(/^tipjar-menu-\d+$/);
    expect(second).not.toBe(first);
    expect(tipjar({ links, menuId: 'a"b' })).toContain('popovertarget="a&#34;b"');
  });

  it('keeps the button options, and passes the icon style and new tab to the links', () => {
    const html = tipjar({
      links,
      position: 'top-left',
      hover: 'pop',
      animate: 'none',
      iconStyle: 'pixel',
      newTab: true,
      className: 'mine',
      description: 'this project',
    });
    expect(html).toContain('class="tipjar mine" data-position="top-left" data-compact="auto" data-hover="pop"');
    expect(html).toContain('<ul class="tipjar-list" id="');
    expect(html).toContain('popover data-position="top-left" data-animate="none">');
    expect(html).toContain(icon('coffee', 'pixel'));
    expect(html).toContain(
      '<a class="tipjar-item" href="https://ko-fi.com/you" target="_blank" rel="noopener">' +
        `${icon('coffee', 'pixel')}<span class="tipjar-label">Ko-fi<span class="tipjar-sr"> (opens in a new tab)</span>`,
    );
    // The button opens the list, not a tab: it reads its description, not the hint.
    expect(html).toContain('Support<span class="tipjar-sr"> this project</span></span></button>');
  });

  it('checks every link, and needs at least one', () => {
    expect(() => tipjar({ links: [{ href: 'javascript:alert(1)', label: 'x' }] })).toThrow(/unsupported link/);
    expect(() => tipjar({ links: [{ href: '/', label: '' }] })).toThrow(/needs a label/);
    expect(() => tipjar({ links: [] })).toThrow(/at least one link/);
  });

  it('escapes what links say', () => {
    const html = tipjar({ links: [{ href: '/?a=1&b=2', label: '<b>', description: '"x"' }] });
    expect(html).toContain('href="/?a=1&#38;b=2"');
    expect(html).toContain('&#60;b&#62;<span class="tipjar-sr"> &#34;x&#34;</span>');
  });

  it('still needs an href without links', () => {
    expect(() => tipjar({})).toThrow(/href/);
  });
});
