import { describe, expect, it } from 'vitest';
import * as api from '../src/index.js';

describe('public API', () => {
  it('exports exactly these names; adding one is a minor version, removing one is a major', () => {
    expect(Object.keys(api).sort()).toEqual(['ICON_NAMES', 'ICON_STYLES', 'icon', 'mount', 'tipjar', 'tuck']);
  });
});
