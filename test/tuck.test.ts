// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tipjar } from '../src/tipjar.js';
import { tuck } from '../src/tuck.js';

type Report = (entries: { target: Element; isIntersecting: boolean }[]) => void;
let report: Report = () => {};
const observed: Element[] = [];
const disconnect = vi.fn();

beforeEach(() => {
  observed.length = 0;
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: Report) {
        report = cb;
      }
      observe(element: Element): void {
        observed.push(element);
      }
      disconnect = disconnect;
    },
  );
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function serverRendered(): Element {
  document.body.insertAdjacentHTML('beforeend', tipjar({ href: '/' }));
  return document.querySelector('.tipjar') as Element;
}

describe('tuck', () => {
  it('tucks a button that is already on the page, and stops', () => {
    const button = serverRendered();
    document.body.insertAdjacentHTML('beforeend', '<footer></footer>');
    const footer = document.querySelector('footer') as Element;
    const stop = tuck(button, footer);
    report([{ target: footer, isIntersecting: true }]);
    expect(button.hasAttribute('data-tucked')).toBe(true);
    stop();
    expect(disconnect).toHaveBeenCalled();
    expect(button.hasAttribute('data-tucked')).toBe(false);
  });

  it('watches every match of a selector, and tucks while any is on screen', () => {
    const button = serverRendered();
    document.body.insertAdjacentHTML('beforeend', '<p class="tip"></p><p class="tip"></p>');
    const [a, b] = Array.from(document.querySelectorAll('.tip'));
    tuck(button, '.tip');
    expect(observed).toEqual([a, b]);
    report([{ target: a as Element, isIntersecting: true }]);
    report([{ target: b as Element, isIntersecting: true }]);
    // One leaves the screen; the other is still on it.
    report([{ target: a as Element, isIntersecting: false }]);
    expect(button.hasAttribute('data-tucked')).toBe(true);
    report([{ target: b as Element, isIntersecting: false }]);
    expect(button.hasAttribute('data-tucked')).toBe(false);
  });

  it('takes a list of elements', () => {
    const button = serverRendered();
    const one = document.createElement('div');
    const two = document.createElement('div');
    document.body.append(one, two);
    tuck(button, [one, two]);
    expect(observed).toEqual([one, two]);
  });

  it('warns and keeps showing when nothing matches', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const button = serverRendered();
    tuck(button, '#missing')();
    tuck(button, null);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]?.[0]).toContain('"#missing"');
    expect(observed).toEqual([]);
    expect(button.hasAttribute('data-tucked')).toBe(false);
  });

  it('does nothing without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const button = serverRendered();
    document.body.insertAdjacentHTML('beforeend', '<footer></footer>');
    expect(() => tuck(button, 'footer')()).not.toThrow();
    expect(button.hasAttribute('data-tucked')).toBe(false);
  });
});
