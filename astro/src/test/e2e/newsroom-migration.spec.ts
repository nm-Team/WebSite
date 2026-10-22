import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from '@playwright/test';

test('built legacy redirects point directly to available canonical pages and assets', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The deployment artifacts are shared across viewports');
  const redirects = JSON.parse(readFileSync(resolve('legacy-newsroom-dist/redirect-manifest.json'), 'utf8')) as Record<string, string>;
  const legacyRules = readFileSync(resolve('legacy-newsroom-dist/_redirects'), 'utf8');
  const mainRules = readFileSync(resolve('dist/_redirects'), 'utf8');
  expect(Object.keys(redirects).length).toBeGreaterThan(400);
  for (const [source, target] of Object.entries(redirects)) {
    expect(legacyRules).toContain(`${source} https://nm.team${target} 301`);
    if (/^\/(news|uploads|usr\/uploads)\//.test(source)) expect(mainRules).toContain(`${source} ${target} 301`);
    const prefixed = `/newsroom${source}`;
    if (source !== '/' && prefixed !== target) expect(mainRules).toContain(`${prefixed} ${target} 301`);
    expect(mainRules).not.toContain(`${prefixed} ${prefixed} 301`);
  }
  for (const target of new Set(Object.values(redirects))) expect((await request.get(target, { maxRedirects: 0 })).status(), target).toBe(200);
});

test('sitemaps contain published translations and omit search and duplicate entry pages', async ({ request, page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'XML content is shared across viewports');
  const xml = await (await request.get('/sitemap.xml')).text();
  const sitemap = await page.evaluate((text) => {
    const document = new DOMParser().parseFromString(text, 'application/xml');
    return {
      errors: document.querySelectorAll('parsererror').length,
      items: [...document.querySelectorAll('url')].map((item) => ({
        url: item.querySelector('loc')?.textContent,
        alternates: [...item.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'link')].map((link) => link.getAttribute('hreflang')),
      })),
    };
  }, xml);
  expect(sitemap.errors).toBe(0);
  const urls = sitemap.items.map((item) => item.url);
  for (const locale of ['zh-CN', 'en']) {
    const posts = await (await request.get(`/${locale}/newsroom/search-data.json`)).json() as { url: string }[];
    for (const post of posts) expect(urls).toContain(`https://nm.team${post.url}`);
    expect(urls).not.toContain(`https://nm.team/${locale}/newsroom/search/`);
    expect(urls).not.toContain(`https://nm.team/${locale}/newsroom/page/1/`);
  }
  expect(sitemap.items.find((item) => item.url?.endsWith('/nmfun-test-2021-11-20/'))?.alternates).toEqual(['zh-CN']);
  const automatic = await (await request.get('/sitemap-0.xml')).text();
  expect(automatic).not.toContain('/newsroom/search/');
  expect(automatic).not.toContain('/newsroom/page/1/');
  const feed = await (await request.get('/zh-CN/newsroom/rss.xml')).text();
  expect(await page.evaluate((text) => new DOMParser().parseFromString(text, 'application/xml').querySelectorAll('parsererror').length, feed)).toBe(0);
});

test('default Newsroom and page one redirect to the canonical list', async ({ page }) => {
  await page.goto('/newsroom/');
  await expect(page).toHaveURL(/\/en\/newsroom\/$/);
  await page.goto('/zh-CN/newsroom/page/1/');
  await expect(page).toHaveURL(/\/zh-CN\/newsroom\/$/);
});
