import { expect, isolateExternalRequests, test } from './fixtures';

test('Newsroom has localized lists, article metadata and working translations', async ({ page }) => {
  await page.goto('/en/newsroom/');
  await expect(page).toHaveTitle('Newsroom - nmTeam Official Website');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.post-list > a.item')).toHaveCount(11);
  const first = page.locator('.post-list > a.item').first();
  const headline = await first.locator('h2').innerText();
  await first.click();
  await expect(page.locator('h1')).toHaveText(headline);
  await expect(page).toHaveTitle(`${headline} - Newsroom - nmTeam Official Website`);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', await page.title());
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', await page.title());
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/nm\.team\/en\/newsroom\//);
  await expect(page.locator('link[hreflang="zh-CN"]')).toHaveCount(1);
  const structured = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(structured ?? '{}')['@graph']).toEqual(expect.arrayContaining([expect.objectContaining({ '@type': 'NewsArticle', headline, inLanguage: 'en' })]));
  const links = page.locator('.post-content a');
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('rel', /noreferrer/);
  }
  await page.goto('/zh-CN/newsroom/');
  await expect(page).toHaveTitle('Newsroom - nmTeam 官方网站');
  await page.goto('/zh-CN/newsroom/nmfun-test-2021-11-20/');
  await expect(page.locator('h1')).toContainText('nmFun');
  await expect(page).toHaveTitle(`${await page.locator('h1').innerText()} - Newsroom - nmTeam 官方网站`);
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(0);
  await expect(page.locator('#newsroom-header a[hreflang="en"]')).toHaveCount(0);
});

test('category and tag lists paginate within their own paths', async ({ page }) => {
  for (const [basePath, secondPagePath] of [
    ['/en/newsroom/category/press-release/', '/en/newsroom/category/press-release/page/2/'],
    ['/en/newsroom/tag/nmTeam/', '/en/newsroom/tag/nmTeam/page/2/'],
  ]) {
    await page.goto(basePath);
    await expect(page.locator('.post-list > a.item')).toHaveCount(11);
    await expect(page.locator('.page-navigator')).toBeVisible();
    await expect(page.locator('.page-navigator a').filter({ hasText: /^2$/ })).toHaveAttribute('href', secondPagePath);
    await page.locator('.page-navigator a').filter({ hasText: /^2$/ }).click();
    await expect(page).toHaveURL(new RegExp(`${secondPagePath.replaceAll('/', '\\/')}$`));
    const pageItems = page.locator('.post-list > a.item');
    expect(await pageItems.count()).toBeGreaterThan(0);
    expect(await pageItems.count()).toBeLessThanOrEqual(11);
  }
});

test('the default Newsroom entry exposes its preview metadata before redirecting', async ({ request }) => {
  const response = await request.get('/newsroom/');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('property="og:site_name" content="nmTeam Newsroom"');
  expect(html).toContain('property="og:title" content="Newsroom - nmTeam Official Website"');
  expect(html).toContain('property="og:url" content="https://nm.team/en/newsroom/"');
});

test('Newsroom search supports a reloadable query and treats text safely', async ({ page }) => {
  await page.goto('/en/newsroom/search/?q=nmBot');
  await expect(page.locator('#search-results a')).not.toHaveCount(0);
  await expect(page.locator('#newsroom-page-query')).toHaveValue('nmBot');
  await page.locator('#newsroom-page-query').fill('<img src=x onerror=alert(1)>');
  await page.locator('.search-page-form button').click();
  await expect(page.locator('#search-results')).toContainText('No articles found');
  await expect(page.locator('#search-title img')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
});

test('Newsroom exposes static per-language indices, RSS and the legacy response shape', async ({ request }) => {
  for (const [locale, count] of [['zh-CN', 34], ['en', 32]] as const) {
    const response = await request.get(`/${locale}/newsroom/search-data.json`);
    expect(response.ok()).toBeTruthy();
    const posts = await response.json() as { url: string; title: string }[];
    expect(posts).toHaveLength(count);
    expect(posts.every((post) => post.url.startsWith(`/${locale}/newsroom/`))).toBeTruthy();
    const rss = await request.get(`/${locale}/newsroom/rss.xml`);
    expect(rss.ok()).toBeTruthy();
    const xml = await rss.text();
    expect(xml.match(/<item>/g)).toHaveLength(count);
    expect(xml).toContain(`<language>${locale}</language>`);
    if (locale === 'zh-CN') expect(xml).toContain('https://newsroom.nmteam.xyz/news/welcome-2021-08-09/');
  }
  const response = await request.get('/newsroom/api/posts');
  const api = await response.json();
  expect(api.status).toBe(200);
  expect(api.data).toHaveLength(5);
  expect(api.data[0]).toMatchObject({ title: expect.any(String), slug: expect.any(String), created: expect.any(Number), text: expect.stringContaining('[image]: https://nm.team/'), permalink: expect.stringMatching(/^https:\/\/nm\.team\/zh-CN\/newsroom\//), year: expect.any(String), month: expect.any(String), day: expect.any(String) });
});

test('Newsroom content and pagination remain usable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await isolateExternalRequests(context, baseURL);
  const page = await context.newPage();
  await page.goto(`${baseURL}/en/newsroom/`);
  await expect(page.locator('.post-list > a.item').first()).toBeVisible();
  await page.locator('.page-navigator a').filter({ hasText: /^2$/ }).click();
  await expect(page.locator('.post-list > a.item')).toHaveCount(11);
  await page.locator('.post-list > a.item').first().click();
  await expect(page.locator('.post-content')).toBeVisible();
  await context.close();
});

test('Every published translation resolves and keeps its first image', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The static route inventory is identical across viewports');
  for (const locale of ['zh-CN', 'en']) {
    const response = await request.get(`/${locale}/newsroom/search-data.json`);
    const posts = await response.json() as { url: string; image: string }[];
    for (const post of posts) {
      expect((await request.get(post.url)).status(), post.url).toBe(200);
      if (post.image.startsWith('/')) expect((await request.get(post.image)).status(), post.image).toBe(200);
    }
  }
});
