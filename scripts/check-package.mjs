// Checks what `npm publish` would ship, after `npm run build`:
// - the tarball holds only dist, style.css, README, LICENSE, CHANGELOG and package.json;
// - dist/*.js plus style.css, each gzipped, stay under the size budget.
// publint and @arethetypeswrong/cli check the exports and types; see `npm run check:package`.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

/** Bytes, gzipped file by file, that dist/*.js and style.css may add up to. Raise it on purpose. */
export const BUDGET = 12500;

const ALLOWED = [
  /^dist\/[\w-]+\.(js|d\.ts)$/,
  /^style\.css$/,
  /^README\.md$/,
  /^LICENSE$/,
  /^CHANGELOG\.md$/,
  /^package\.json$/,
];
const REQUIRED = [
  'dist/index.js',
  'dist/index.d.ts',
  'style.css',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'package.json',
];

/** Files in the tarball that shouldn't be, and required files that are missing. */
export function checkFiles(files) {
  return [
    ...files.filter((file) => !ALLOWED.some((pattern) => pattern.test(file))).map((file) => `unexpected file ${file}`),
    ...REQUIRED.filter((file) => !files.includes(file)).map((file) => `missing file ${file}`),
  ];
}

/** The gzipped size of each shipped JS and CSS file, added up. */
export function gzipSize(root = '.') {
  const files = [
    ...readdirSync(`${root}/dist`)
      .filter((name) => name.endsWith('.js'))
      .map((name) => `${root}/dist/${name}`),
    `${root}/style.css`,
  ];
  return files.reduce((sum, file) => sum + gzipSync(readFileSync(file), { level: 9 }).length, 0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [packed] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' }));
  const problems = checkFiles(packed.files.map((file) => file.path));
  const size = gzipSize();
  if (size > BUDGET) problems.push(`dist/*.js + style.css are ${size} bytes gzipped, over the ${BUDGET}-byte budget`);
  if (problems.length) {
    for (const problem of problems) console.error(`✗ ${problem}`);
    process.exit(1);
  }
  console.log(`✓ ${packed.files.length} files; dist/*.js + style.css are ${size} bytes gzipped (budget ${BUDGET})`);
}
