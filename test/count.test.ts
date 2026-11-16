import { describe, expect, it } from 'vitest';
import { formatCount } from '../src/count.js';
import { tipjar } from '../src/tipjar.js';

describe('count', () => {
  it('shortens numbers the way GitHub does, rounding down', () => {
    const cases: [number, string][] = [
      [0, '0'],
      [7.9, '7'],
      [999, '999'],
      [1204, '1,204'],
      [9999, '9,999'],
      [10_000, '10k'],
      [12_399, '12.3k'],
      [999_999, '999.9k'],
      [1_000_000, '1M'],
      [1_250_000, '1.2M'],
    ];
    for (const [count, text] of cases) expect(formatCount(count)).toBe(text);
  });

  it('refuses counts that are not a number of things', () => {
    for (const bad of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => tipjar({ href: '/', count: bad })).toThrow(/invalid count/);
    }
  });

  it('shows the count after the label, before the screen reader words', () => {
    expect(tipjar({ href: '/', label: 'Star', count: 1204, description: 'tipjar on GitHub' })).toContain(
      '<span class="tipjar-label">Star <span class="tipjar-count">1,204</span>' +
        '<span class="tipjar-sr"> tipjar on GitHub</span></span>',
    );
  });

  it('shows text as is, escaped', () => {
    expect(tipjar({ href: '/', count: '1 204 <b>' })).toContain('<span class="tipjar-count">1 204 &#60;b&#62;</span>');
  });

  it('writes nothing for no count, so older markup is unchanged', () => {
    expect(tipjar({ href: '/' })).not.toContain('tipjar-count');
    expect(tipjar({ href: '/', count: '' })).toBe(tipjar({ href: '/' }));
  });
});
