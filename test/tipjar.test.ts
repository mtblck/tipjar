import { describe, expect, it } from 'vitest';
import { safeCss, safeHref } from '../src/escape.js';
import { icon } from '../src/icons.js';
import { tipjar } from '../src/tipjar.js';

describe('tipjar', () => {
  it('builds a bottom-right Support link with a flat heart by default', () => {
    expect(tipjar({ href: 'https://ko-fi.com/example' })).toBe(
      '<a class="tipjar" href="https://ko-fi.com/example" data-position="bottom-right" data-compact="auto">' +
        `${icon('heart', 'flat')}<span class="tipjar-label">Support</span></a>`,
    );
  });

  it('takes a label, a description for screen readers, an icon and a style', () => {
    const html = tipjar({
      href: '/tip',
      label: 'Buy me a coffee',
      description: 'on Ko-fi',
      icon: 'coffee',
      iconStyle: 'pixel',
    });
    expect(html).toContain(icon('coffee', 'pixel'));
    expect(html).toContain('<span class="tipjar-label">Buy me a coffee<span class="tipjar-sr"> on Ko-fi</span></span>');
  });

  it('places it, folds it and opens a new tab when asked', () => {
    const html = tipjar({ href: '/', position: 'top-left', compact: 'never', newTab: true, className: 'a  b' });
    expect(html).toContain('class="tipjar a b"');
    expect(html).toContain('target="_blank" rel="noopener"');
    expect(html).toContain('data-position="top-left" data-compact="never"');
  });

  it('tells screen readers a new tab opens, in words that can be changed', () => {
    expect(tipjar({ href: '/', newTab: true })).toContain(
      '<span class="tipjar-label">Support<span class="tipjar-sr"> (opens in a new tab)</span></span>',
    );
    expect(tipjar({ href: '/', newTab: true, description: 'on Ko-fi', newTabHint: '(nouvel onglet)' })).toContain(
      '<span class="tipjar-sr"> on Ko-fi (nouvel onglet)</span>',
    );
    expect(tipjar({ href: '/', newTab: true, newTabHint: '' })).not.toContain('tipjar-sr');
    expect(tipjar({ href: '/', newTabHint: '(new tab)' })).not.toContain('new tab');
  });

  it('never folds a button with no icon', () => {
    const html = tipjar({ href: '/', icon: false, compact: 'always' });
    expect(html).not.toContain('<svg');
    expect(html).toContain('data-compact="never"');
  });

  it('wraps a custom icon as is', () => {
    expect(tipjar({ href: '/', icon: { svg: '<svg id="mine"></svg>' } })).toContain(
      '<span class="tipjar-icon" aria-hidden="true"><svg id="mine"></svg></span>',
    );
  });

  it('writes look as inline custom properties, and nothing without it', () => {
    expect(tipjar({ href: '/' })).not.toContain('style=');
    const html = tipjar({
      href: '/',
      look: { background: '#3a26c9', label: 'white', icon: 'rgb(255 0 0)', radius: 8 },
    });
    expect(html).toContain(
      'style="--tipjar-bg:#3a26c9;--tipjar-label:white;--tipjar-icon:rgb(255 0 0);--tipjar-radius:8px"',
    );
  });

  it('escapes text', () => {
    const html = tipjar({ href: '/?a=1&b="2"', label: '<b>Tip</b>', description: '"me"' });
    expect(html).toContain('href="/?a=1&#38;b=&#34;2&#34;"');
    expect(html).toContain('&#60;b&#62;Tip&#60;/b&#62;');
    expect(html).toContain('&#34;me&#34;');
  });

  it('rejects unknown positions and compact modes', () => {
    // @ts-expect-error not a position
    expect(() => tipjar({ href: '/', position: 'middle' })).toThrow(/unknown position/);
    // @ts-expect-error not a mode
    expect(() => tipjar({ href: '/', compact: 'sometimes' })).toThrow(/unknown compact/);
  });
});

describe('safeHref', () => {
  it('allows http, https, mailto and relative links', () => {
    for (const ok of [
      'https://ko-fi.com/x',
      'http://x.dev',
      'mailto:me@x.dev',
      '/tip',
      '#tip',
      'tip.html',
      '//x.dev',
    ]) {
      expect(safeHref(` ${ok} `)).toBe(ok);
    }
  });

  it('refuses script and data links, however they are written', () => {
    for (const bad of [
      'javascript:alert(1)',
      'JaVaScRiPt:alert(1)',
      'java\tscript:alert(1)',
      '\u0001javascript:alert(1)',
      '\u0000 \u001fjavascript:alert(1)',
      'data:text/html,x',
      'vbscript:x',
    ]) {
      expect(() => safeHref(bad)).toThrow(/unsupported link/);
    }
  });

  it('needs a link', () => {
    expect(() => safeHref('  ')).toThrow(/required/);
  });
});

describe('safeCss', () => {
  it('refuses values that could break out of the declaration', () => {
    for (const bad of ['red;color:blue', 'red}', '"x"', "'x'", '<x>', 'a\\b', '']) {
      expect(() => safeCss('background', bad)).toThrow(/invalid CSS value/);
    }
  });
});
