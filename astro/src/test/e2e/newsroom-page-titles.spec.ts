import { expect, test } from './fixtures';

test('pagination preserves the list heading and metadata title', async ({ page }) => {
  for (const locale of ['en', 'zh-CN']) {
    for (const path of ['', 'tag/nmTeam/', 'category/press-release/']) {
      const basePath = `/${locale}/newsroom/${path}`;
      await page.goto(basePath);
      const title = await page.title();
      const heading = await page.locator('.post-list > h1').textContent();
      await page.goto(`${basePath}page/2/`);
      await expect(page).toHaveTitle(title);
      await expect(page.locator('.post-list > h1')).toHaveText(heading!);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://nm.team${basePath}page/2/`);
      await expect(page.locator('.page-navigator a').filter({ hasText: /^1$/ })).toHaveAttribute('href', basePath);
    }
  }
});
