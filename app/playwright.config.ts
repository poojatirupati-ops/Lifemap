import { defineConfig } from '@playwright/test'

// Screens: the original prototype (:8080) is the baseline, the app (:5173) is compared against it.
// Refresh baselines: LM_BASELINE=1 npx playwright test --update-snapshots (prototype on :8080).
export default defineConfig({
  testDir: 'tests/e2e',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  retries: 1,
  reporter: 'list',
  use: {
    channel: 'chrome',
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce', // the prototype's JS orbit stops under reduced motion
  },
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      scale: 'device',
      maxDiffPixelRatio: 0.005,
      threshold: 0.1,
    },
  },
})
