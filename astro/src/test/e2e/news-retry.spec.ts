import { expect, test } from '@playwright/test';

test('renders a real button when the newsroom request fails', async ({ page }) => {
  let requestCount = 0;
  await page.route('https://newsroom.nmteam.xyz/api/posts**', async (route) => {
    requestCount += 1;
    await route.fulfill({ status: 500, body: 'error' });
  });

  await page.goto('/zh-CN/', { waitUntil: 'domcontentloaded' });

  const retryButton = page.locator('#newsSwiperItems button');
  await expect(retryButton).toHaveRole('button');
  await expect(retryButton).toHaveText('重试');
  await expect(retryButton).not.toHaveAttribute('href');

  await retryButton.click();
  await expect.poll(() => requestCount).toBeGreaterThan(1);
});
