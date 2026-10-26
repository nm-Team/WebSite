import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4321',
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER ? undefined : {
    command: 'pnpm preview --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 5'], browserName: 'chromium' } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 }, browserName: 'chromium' } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 }, browserName: 'chromium' } },
    {
      name: 'webkit-mobile',
      testMatch: ['newsroom-sticky-width.spec.ts', 'newsroom-navigation.spec.ts', 'nmbot-navigation.spec.ts', 'home-lemon-line.spec.ts'],
      use: { ...devices['iPhone 13'], browserName: 'webkit' },
    },
  ],
});
