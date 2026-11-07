// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '../src/mount.js';
import { nudge } from '../src/nudge.js';

const motion = (reduce: boolean): void => {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: reduce && query.includes('reduce') }));
};

beforeEach(() => {
  vi.useFakeTimers();
  motion(false);
  sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

const button = (): HTMLAnchorElement => mount({ href: '/' }).element;

describe('nudge', () => {
  it('wiggles once, after the wait', () => {
    const el = button();
    nudge(el, 5);
    vi.advanceTimersByTime(4999);
    expect(el.hasAttribute('data-nudge')).toBe(false);
    vi.advanceTimersByTime(1);
    expect(el.hasAttribute('data-nudge')).toBe(true);
  });

  it('waits 20 seconds by default', () => {
    const el = button();
    nudge(el);
    vi.advanceTimersByTime(19_999);
    expect(el.hasAttribute('data-nudge')).toBe(false);
    vi.advanceTimersByTime(1);
    expect(el.hasAttribute('data-nudge')).toBe(true);
  });

  it('only once per visit', () => {
    nudge(button(), 1);
    vi.advanceTimersByTime(1000);
    const again = button();
    nudge(again, 1);
    vi.advanceTimersByTime(1000);
    expect(again.hasAttribute('data-nudge')).toBe(false);
  });

  it('not once someone has hovered or focused the button', () => {
    const hovered = button();
    nudge(hovered, 1);
    hovered.dispatchEvent(new Event('pointerenter'));
    const focused = button();
    nudge(focused, 1);
    focused.dispatchEvent(new Event('focus'));
    vi.advanceTimersByTime(1000);
    expect(hovered.hasAttribute('data-nudge')).toBe(false);
    expect(focused.hasAttribute('data-nudge')).toBe(false);
    // Neither counted as the visit's nudge.
    const later = button();
    nudge(later, 1);
    vi.advanceTimersByTime(1000);
    expect(later.hasAttribute('data-nudge')).toBe(true);
  });

  it('not while tucked away', () => {
    const el = button();
    el.setAttribute('data-tucked', '');
    nudge(el, 1);
    vi.advanceTimersByTime(1000);
    expect(el.hasAttribute('data-nudge')).toBe(false);
  });

  it('waits for a hidden tab to come back', () => {
    const el = button();
    let hidden = true;
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    nudge(el, 1);
    vi.advanceTimersByTime(1000);
    expect(el.hasAttribute('data-nudge')).toBe(false);
    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));
    expect(el.hasAttribute('data-nudge')).toBe(true);
  });

  it('never for people who ask for less motion', () => {
    motion(true);
    const el = button();
    nudge(el, 1);
    vi.advanceTimersByTime(1000);
    expect(el.hasAttribute('data-nudge')).toBe(false);
  });

  it('can be cancelled, and mount cancels it on destroy', () => {
    const el = button();
    nudge(el, 1)();
    const mounted = mount({ href: '/', nudgeAfter: 1 });
    mounted.destroy();
    vi.advanceTimersByTime(1000);
    expect(el.hasAttribute('data-nudge')).toBe(false);
    expect(mounted.element.hasAttribute('data-nudge')).toBe(false);
  });

  it('mount nudges after nudgeAfter seconds', () => {
    const { element } = mount({ href: '/', nudgeAfter: 2 });
    vi.advanceTimersByTime(2000);
    expect(element.hasAttribute('data-nudge')).toBe(true);
  });
});
