import { defineConfig } from '@playwright/test';

const deploymentURL = process.env.NEWSROOM_DEPLOYMENT_URL;

export default defineConfig({
  testDir: './src/test/deployment',
  fullyParallel: true,
  workers: 8,
  timeout: 30_000,
  use: {
    baseURL: deploymentURL ?? 'http://127.0.0.1:8788',
    ignoreHTTPSErrors: deploymentURL?.startsWith('https://127.0.0.1:') ?? false,
  },
  webServer: deploymentURL ? undefined : {
    command: 'pnpm dlx wrangler@4.151.3 pages dev dist --ip 127.0.0.1 --port 8788 --compatibility-date 2026-10-19',
    url: 'http://127.0.0.1:8788',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
