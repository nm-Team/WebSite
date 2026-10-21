import { expect, test } from '@playwright/test';

test('home news is rendered locally and links to the selected Newsroom language', async ({ page, request }) => {
  let legacyRequests = 0;
  await page.route('https://newsroom.nmteam.xyz/**', async (route) => { legacyRequests++; await route.abort(); });
  for (const [locale, newsLocale] of [['zh-CN', 'zh-CN'], ['zh-HK', 'zh-CN'], ['en', 'en'], ['ja-JP', 'en']]) {
    await page.goto(`/${locale}/`, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('#newsSwiperItems .swiper-slide');
    await expect(cards).toHaveCount(5);
    const index = await (await request.get(`/${newsLocale}/newsroom/search-data.json`)).json();
    await expect(cards.first().locator('h3')).toHaveText(index[0].title);
    await expect(cards.first()).toHaveAttribute('href', index[0].url);
    await expect(page.locator('#pageHeader .links a').filter({ hasText: 'Newsroom' })).toHaveAttribute('href', `/${newsLocale}/newsroom/`);
  }
  expect(legacyRequests).toBe(0);
});

test('home news is present in HTML before JavaScript runs', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/en/`);
  const cards = page.locator('#newsSwiperItems .swiper-slide');
  await expect(cards).toHaveCount(5);
  await expect(cards.first().locator('h3')).not.toHaveText('');
  await context.close();
});
