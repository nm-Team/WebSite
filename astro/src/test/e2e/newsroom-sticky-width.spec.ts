import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.cookieTipv0Checked = 'true'; });
});

test('the sticky header aligns with Newsroom content and returns to the global gutter', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'This test supplies its own viewport matrix');
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const article of [false, true]) {
    for (const width of [320, 390, 699, 700, 749, 750, 768, 900, 901, 1199, 1200, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(article ? '/en/newsroom/welcome-2021-08-09/' : '/en/newsroom/', { waitUntil: 'domcontentloaded' });
      const header = page.locator('#newsroom-header');
      const bar = page.locator('#newsroom-header .container');
      const before = (await bar.boundingBox())!;
      const boundary = (await page.locator('#hcont').boundingBox())!.height;
      await page.evaluate((y) => window.scrollTo(0, y), boundary);
      await expect(header).toHaveAttribute('data-stuck');
      const reference = article ? width >= 1200 ? '.post-page .post' : '.post-content' : '.post-list > .item:first-of-type';
      const content = (await page.locator(reference).boundingBox())!;
      const aligned = (await bar.boundingBox())!;
      expect(Math.abs(aligned.x - content.x), `${article ? 'article' : 'list'} left at ${width}px`).toBeLessThan(1);
      expect(Math.abs(aligned.width - content.width), `${article ? 'article' : 'list'} width at ${width}px`).toBeLessThan(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(header).not.toHaveAttribute('data-stuck');
      const returned = (await bar.boundingBox())!;
      expect(Math.abs(returned.x - before.x)).toBeLessThan(1);
      expect(Math.abs(returned.width - before.width)).toBeLessThan(1);
    }
  }
});

test('the popup follows the sticky header width through resize and scroll reversals', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en/newsroom/');
  const header = page.locator('#newsroom-header');
  const bar = page.locator('#newsroom-header .container');
  const boundary = (await page.locator('#hcont').boundingBox())!.height;
  for (const y of [boundary, boundary - 2, boundary + 2, 0, boundary]) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
  }
  await expect(header).toHaveAttribute('data-stuck');
  await expect.poll(async () => {
    const title = (await bar.boundingBox())!;
    const card = (await page.locator('.post-list > .item').first().boundingBox())!;
    return Math.abs(title.x - card.x);
  }).toBeLessThan(1);
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ width: viewport.width, height: viewport.height - 80 });
  const trigger = await page.locator('#newsroom-menu-toggle').isVisible()
    ? page.locator('#newsroom-menu-toggle') : page.locator('[data-newsroom-search-toggle]');
  await trigger.click();
  await expect(page.locator('#newsroom-extended-menu')).toHaveCSS('opacity', '1');
  const topRow = (await bar.boundingBox())!;
  const popup = (await page.locator('.newsroom-panel-content').boundingBox())!;
  expect(Math.abs(topRow.x - popup.x)).toBeLessThan(1);
  expect(Math.abs(topRow.width - popup.width)).toBeLessThan(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('#newsroom-extended-menu')).not.toBeVisible();
});
