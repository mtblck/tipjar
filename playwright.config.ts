import { defineConfig, devices } from '@playwright/test';

// Real-browser tests: layout, tucking, motion, forced colours and accessibility. They load the
// built package, so `npm run test:browser` builds first. Screenshot baselines are made on Linux
// (Ubuntu 24.04, the CI runner); refresh them with `npm run test:browser -- --update-snapshots`.
export default defineConfig({
  testDir: 'test/browser',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: true,
  reporter: 'list',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
