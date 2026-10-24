import { expect, test } from './fixtures';

test('latest articles align with the article and sticky navigation at every breakpoint', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'This test supplies its own viewport matrix');
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['en', 'zh-CN']) {
    for (const width of [320, 390, 699, 700, 749, 750, 768, 900, 901, 1199, 1200, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/newsroom/welcome-2021-08-09/`, { waitUntil: 'domcontentloaded' });
      const boundary = (await page.locator('#hcont').boundingBox())!.height;
      await page.evaluate((y) => window.scrollTo(0, y), boundary);
      await expect(page.locator('#newsroom-header')).toHaveAttribute('data-stuck');
      const reference = (await page.locator(width >= 1200 ? '.post-page .post' : '.post-content').boundingBox())!;
      for (const selector of ['#latest-posts', '#latest-posts .widget-post-list', '#newsroom-header .container']) {
        const box = (await page.locator(selector).boundingBox())!;
        expect(Math.abs(box.x - reference.x), `${locale} ${selector} left at ${width}px`).toBeLessThan(1);
        expect(Math.abs(box.width - reference.width), `${locale} ${selector} width at ${width}px`).toBeLessThan(1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    }
  }
});
