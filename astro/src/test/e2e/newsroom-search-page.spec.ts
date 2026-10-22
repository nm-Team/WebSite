import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.cookieTipv0Checked = 'true'; });
});

test('search offers localized categories, tags and dates below its input', async ({ page, request }) => {
  for (const locale of ['en', 'zh-CN']) {
    await page.goto(`/${locale}/newsroom/search/`);
    const browse = page.locator('.search-browse');
    await expect(browse.locator('nav')).toHaveCount(3);
    await expect(page.locator('.search-result-section')).toBeHidden();
    const inputBox = (await page.locator('.search-page-form').boundingBox())!;
    expect((await browse.boundingBox())!.y).toBeGreaterThan(inputBox.y + inputBox.height);
    for (const group of await browse.locator('nav').all()) {
      const link = group.locator('a').first();
      expect(await group.locator('a').count()).toBeGreaterThan(0);
      const titleStyle = await group.locator('h2').evaluate((element) => {
        const style = getComputedStyle(element);
        return { size: parseFloat(style.fontSize), color: style.color };
      });
      const linkStyle = await link.evaluate((element) => {
        const style = getComputedStyle(element);
        return { size: parseFloat(style.fontSize), color: style.color };
      });
      expect(linkStyle.size).toBeGreaterThan(titleStyle.size);
      expect(linkStyle.color).not.toBe(titleStyle.color);
      for (const href of await group.locator('a').evaluateAll((links) => links.map((element) => element.getAttribute('href')!))) {
        expect(href).toMatch(new RegExp(`^/${locale}/newsroom/`));
        expect((await request.get(href)).ok(), href).toBe(true);
      }
      await link.click();
      await expect(page.locator('h1')).not.toBeEmpty();
      await expect(page.locator('#newsroom-footer')).toHaveCount(0);
      await expect(page.locator('#fcont')).toBeVisible();
      await page.goBack();
    }
  }
});

test('submitted results appear before browsing links and clearing the query restores browsing', async ({ page }) => {
  await page.goto('/en/newsroom/search/');
  await page.locator('#newsroom-page-query').fill('nmBot');
  await page.locator('#newsroom-page-query').press('Enter');
  await expect(page.locator('#search-results a')).not.toHaveCount(0);
  await expect(page).toHaveURL(/\?q=nmBot$/);
  const results = (await page.locator('.search-result-section').boundingBox())!;
  expect((await page.locator('.search-browse').boundingBox())!.y).toBeGreaterThan(results.y + results.height);
  await page.reload();
  await expect(page.locator('#search-results a')).not.toHaveCount(0);
  await page.locator('#newsroom-page-query').fill('');
  await page.locator('#newsroom-page-query').press('Enter');
  await expect(page).toHaveURL(/\/en\/newsroom\/search\/$/);
  await expect(page.locator('.search-result-section')).toBeHidden();
  await expect(page.locator('.search-browse')).toBeVisible();
});

test('search browsing fits narrow screens in both color schemes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'This test supplies its own viewport matrix');
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    for (const width of [320, 390, 699, 700, 768, 901, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/en/newsroom/search/');
      const input = (await page.locator('.search-page-form').boundingBox())!;
      const browse = (await page.locator('.search-browse').boundingBox())!;
      expect(Math.abs(input.x - browse.x)).toBeLessThan(1);
      expect(Math.abs(input.width - browse.width)).toBeLessThan(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    }
  }
});

test('the search directory remains usable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/en/newsroom/search/`);
  await expect(page.locator('.search-notice')).toBeVisible();
  await expect(page.locator('.search-browse nav')).toHaveCount(3);
  await page.locator('.search-browse a').first().click();
  await expect(page.locator('.post-list a.item').first()).toBeVisible();
  await context.close();
});
