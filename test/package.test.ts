import { describe, expect, it } from 'vitest';
import { checkFiles } from '../scripts/check-package.mjs';

const GOOD = [
  'CHANGELOG.md',
  'LICENSE',
  'README.md',
  'dist/index.d.ts',
  'dist/index.js',
  'dist/tuck.js',
  'package.json',
  'style.css',
];

describe('package contents', () => {
  it('accepts the files tipjar ships', () => {
    expect(checkFiles(GOOD)).toEqual([]);
  });

  it('flags stray files and missing ones', () => {
    const files = [...GOOD.filter((file) => file !== 'CHANGELOG.md'), 'src/index.ts', 'test/browser/fixture.html'];
    expect(checkFiles(files)).toEqual([
      'unexpected file src/index.ts',
      'unexpected file test/browser/fixture.html',
      'missing file CHANGELOG.md',
    ]);
  });
});
