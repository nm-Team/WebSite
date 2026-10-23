import { expect, isolateExternalRequests, test } from './fixtures';

test('home news is rendered locally and links to the selected Newsroom language', async ({ page, request }) => {
  const newsRequests: string[] = [];
  await page.route((url) => url.hostname === 'newsroom.nmteam.xyz' || /\/(?:api\/posts\/?|search-data\.json)$/.test(url.pathname), async (route) => {
    newsRequests.push(route.request().url());
    await route.abort();
  });
  for (const [locale, newsLocale] of [['zh-CN', 'zh-CN'], ['zh-HK', 'zh-CN'], ['zh-x-mars', 'zh-CN'], ['en', 'en'], ['ja-JP', 'en']]) {
    await page.goto(`/${locale}/`, { waitUntil: 'load' });
    const cards = page.locator('#newsSwiperItems .swiper-slide');
    await expect(cards).toHaveCount(5);
    const index = await (await request.get(`/${newsLocale}/newsroom/search-data.json`)).json();
    await expect(cards.first().locator('h3')).toHaveText(index[0].title);
    await expect(cards.first()).toHaveAttribute('href', index[0].url);
    await expect(page.locator('#pageHeader .links a').filter({ hasText: 'Newsroom' })).toHaveAttribute('href', `/${newsLocale}/newsroom/`);
    await expect(page.locator('script[data-website-id]')).toHaveCount(1);
    await expect(page.locator('script[data-website-id]')).toHaveAttribute('data-website-id', '13563ad4-a0f5-4dae-b366-5ab1eb689390');
  }
  expect(newsRequests).toEqual([]);
});

test('home news is present in HTML before JavaScript runs', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await isolateExternalRequests(context, baseURL);
  const page = await context.newPage();
  await page.goto(`${baseURL}/en/`);
  const cards = page.locator('#newsSwiperItems .swiper-slide');
  await expect(cards).toHaveCount(5);
  await expect(cards.first().locator('h3')).not.toHaveText('');
  await context.close();
});
