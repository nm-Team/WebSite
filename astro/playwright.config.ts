import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4321',
  },
  projects: [
    { name: 'mobile', use: { ...devices['iPhone 12'] } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
  ],
});
