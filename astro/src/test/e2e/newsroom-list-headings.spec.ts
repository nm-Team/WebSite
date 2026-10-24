import { expect, test } from './fixtures';

test('the main list keeps its heading visually hidden on every page', async ({ page }) => {
  for (const locale of ['en', 'zh-CN']) {
    const basePath = `/${locale}/newsroom/`;
    await page.goto(basePath);
    const paths = await page.locator('.page-navigator a').evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
    for (const path of new Set([basePath, ...paths])) {
      await page.goto(path);
      const heading = page.locator('.post-list > h1');
      await expect(heading).toHaveClass('sr-only');
      await expect(heading).toHaveCSS('position', 'absolute');
      await expect(heading).toHaveCSS('overflow', 'hidden');
      const box = (await heading.boundingBox())!;
      expect(box.width).toBeLessThanOrEqual(2);
      expect(box.height).toBeLessThanOrEqual(2);
      await expect(page.locator('.post-list > a.item').first()).toBeVisible();
    }
  }
});

test('filtered lists show their heading on the first and subsequent pages', async ({ page }) => {
  for (const locale of ['en', 'zh-CN']) {
    for (const path of ['tag/nmTeam/', 'tag/nmTeam/page/2/', 'category/press-release/', 'category/press-release/page/2/', '2021/08/']) {
      await page.goto(`/${locale}/newsroom/${path}`);
      const heading = page.locator('.post-list > h1');
      await expect(heading).toHaveClass('archive-title');
      await expect(heading).toBeVisible();
      await expect(heading).not.toBeEmpty();
    }
  }
});
