import { expect, test } from './fixtures';

const productSlugs = ['nmBot-Telegram', 'nmBrowser-StartPage', 'product-accessibility'];

test.beforeEach(async ({ context }) => {
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
});

test('serves product pages with canonical URLs outside the overview directory', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Static route coverage is viewport-independent.');
  test.setTimeout(120_000);
  const context = await browser.newContext({ javaScriptEnabled: false });
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  const page = await context.newPage();

  for (const prefix of ['', '/en', '/zh-CN', '/zh-HK', '/ja-JP', '/zh-x-mars']) {
    for (const slug of productSlugs) {
      const path = `${prefix}/${slug}/`;
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), path).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://nm.team${prefix || '/en'}/${slug}/`);
      await expect(page.locator('a[href*="/products/overview/"]')).toHaveCount(0);
    }
  }

  await context.close();
});

test('redirects legacy product queries while preserving locale, other parameters, and fragments', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Query redirects are viewport-independent.');
  test.setTimeout(120_000);

  for (const prefix of ['', '/en', '/zh-CN', '/zh-HK', '/ja-JP', '/zh-x-mars']) {
    for (const slug of productSlugs) {
      await page.goto(`${prefix}/products/overview/?product=${slug}&from=legacy#details`, { waitUntil: 'commit' });
      await expect(page).toHaveURL(`http://127.0.0.1:4321${prefix}/${slug}/?from=legacy#details`);
      await expect(page.locator('h1')).toHaveCount(1);
    }
  }
});

test('returns unknown or unsafe legacy product names to the localized listing', async ({ page }) => {
  for (const product of ['', 'missing-product', '../../aboutus', '__proto__', 'https://example.com']) {
    await page.goto(`/zh-CN/products/overview/?product=${encodeURIComponent(product)}`, { waitUntil: 'commit' });
    await expect(page).toHaveURL('http://127.0.0.1:4321/zh-CN/products/');
  }
});
