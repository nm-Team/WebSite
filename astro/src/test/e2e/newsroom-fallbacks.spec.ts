import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { publicLocales } from '../../i18n/locales';
import { expect, isolateExternalRequests, test } from './fixtures';

test('every article has an HTML entry for every site language and only real translations are indexed', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Generated HTML is shared across viewports');
  const chinese = await (await request.get('/zh-CN/newsroom/search-data.json')).json() as { url: string }[];
  const english = await (await request.get('/en/newsroom/search-data.json')).json() as { url: string }[];
  const published = new Set([...chinese, ...english].map((post) => post.url));
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const automatic = await (await request.get('/sitemap-0.xml')).text();
  for (const post of chinese) {
    const suffix = post.url.slice('/zh-CN/newsroom/'.length);
    for (const locale of publicLocales) {
      const path = `/${locale}/newsroom/${suffix}`;
      const html = readFileSync(resolve('dist', `.${path}`, 'index.html'), 'utf8');
      expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(200);
      if (published.has(path)) {
        expect(html).not.toContain('http-equiv="refresh"');
        expect(sitemap).toContain(`<loc>https://nm.team${path}</loc>`);
      } else {
        const target = published.has(`/en/newsroom/${suffix}`) ? `/en/newsroom/${suffix}` : post.url;
        expect(html).toContain(`0;url=${target}`);
        expect(html).toContain(`rel="canonical" href="https://nm.team${target}"`);
        expect(html).toContain('name="robots" content="noindex,follow"');
        expect(sitemap).not.toContain(`https://nm.team${path}<`);
        expect(automatic).not.toContain(`https://nm.team${path}<`);
      }
    }
  }
});

test('language fallbacks retain article context, query and fragment', async ({ page }) => {
  await page.goto('/ja-JP/newsroom/welcome-2021-08-09/?ref=language#article');
  await expect(page).toHaveURL(/\/en\/newsroom\/welcome-2021-08-09\/\?ref=language#article$/);
  await page.goto('/zh-HK/newsroom/nmfun-test-2021-11-20/?ref=language#article');
  await expect(page).toHaveURL(/\/zh-CN\/newsroom\/nmfun-test-2021-11-20\/\?ref=language#article$/);
  await page.goto('/zh-HK/newsroom/search/?q=nmBot');
  await expect(page).toHaveURL(/\/en\/newsroom\/search\/\?q=nmBot$/);
  await expect(page.locator('#search-results a')).not.toHaveCount(0);
});

test('missing article translations redirect without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await isolateExternalRequests(context, baseURL);
  const page = await context.newPage();
  await page.goto(`${baseURL}/en/newsroom/nmfun-test-2021-11-20/`);
  await expect(page).toHaveURL(/\/zh-CN\/newsroom\/nmfun-test-2021-11-20\/$/);
  await expect(page.locator('.post-content')).toBeVisible();
  await context.close();
});
