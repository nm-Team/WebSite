import { expect, test } from './fixtures';

test('filtered lists show their heading on the first page', async ({ page }) => {
  for (const locale of ['en', 'zh-CN']) {
    for (const path of ['tag/nmTeam/', 'category/press-release/', '2021/08/']) {
      await page.goto(`/${locale}/newsroom/${path}`);
      const heading = page.locator('.post-list > h1');
      await expect(heading).toHaveClass('archive-title');
      await expect(heading).toBeVisible();
      await expect(heading).not.toBeEmpty();
    }
  }
});
