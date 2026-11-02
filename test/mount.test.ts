// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../src/mount.js';

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

describe('mount', () => {
  it('appends the button to the body and removes it again', () => {
    const { element, destroy } = mount({ href: 'https://ko-fi.com/example' });
    expect(element.tagName).toBe('A');
    expect(element.parentElement).toBe(document.body);
    destroy();
    expect(document.querySelector('.tipjar')).toBeNull();
  });

  it('appends to a target', () => {
    const box = document.createElement('div');
    document.body.append(box);
    expect(mount({ href: '/', target: box }).element.parentElement).toBe(box);
  });

  it('tucks away while the watched element is on screen', () => {
    let callback: (entries: { target: Element; isIntersecting: boolean }[]) => void = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: typeof callback) {
          callback = cb;
        }
        observe(): void {}
        disconnect = disconnect;
      },
    );
    document.body.innerHTML = '<footer id="foot"></footer>';
    const { element, destroy } = mount({ href: '/', hideWhenVisible: '#foot' });
    const foot = document.getElementById('foot') as Element;
    callback([{ target: foot, isIntersecting: true }]);
    expect(element.hasAttribute('data-tucked')).toBe(true);
    callback([{ target: foot, isIntersecting: false }]);
    expect(element.hasAttribute('data-tucked')).toBe(false);
    destroy();
    expect(disconnect).toHaveBeenCalled();
  });

  it('keeps showing, and warns, when there is nothing to watch', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { element } = mount({ href: '/', hideWhenVisible: '#missing' });
    expect(element.hasAttribute('data-tucked')).toBe(false);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
