import { expect, test } from '@playwright/test';

test('keeps localized product metadata consistent across the sitemap, pages, and ROR feed', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Static metadata is viewport-independent.');
  test.setTimeout(120_000);
  const context = await browser.newContext({ javaScriptEnabled: false });
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  const page = await context.newPage();
  const entries: { path: string; title: string; description: string }[] = [];

  for (const prefix of ['', '/en', '/zh-CN', '/zh-HK', '/ja-JP', '/zh-x-mars']) {
    await page.goto(`${prefix}/sitemap/`, { waitUntil: 'domcontentloaded' });

    for (const slug of ['nmBrowser-StartPage', 'product-accessibility']) {
      const path = `${prefix}/${slug}/`;
      const card = page.locator('.sitemap-card').filter({ has: page.locator(`h2 a[href="${path}"]`) });
      await expect(card).toHaveCount(1);
      const title = await card.locator('h2').innerText();
      const description = await card.locator('.sitemap-card__description').innerText();
      expect(description.trim()).not.toBe('');
      entries.push({ path, title, description });
    }
  }

  for (const entry of entries) {
    await page.goto(entry.path, { waitUntil: 'domcontentloaded' });
    expect(await page.title()).toContain(`${entry.title} - nmTeam`);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.startsWith(entry.description)).toBe(true);
  }

  const response = await page.request.get('/ror.xml');
  expect(response.status()).toBe(200);
  const feedEntries = await page.evaluate((xml) => {
    const document = new DOMParser().parseFromString(xml, 'application/xml');
    if (document.querySelector('parsererror')) {
      throw new Error('The ROR feed is not valid XML.');
    }
    return Array.from(document.querySelectorAll('item')).map((item) => ({
      url: item.querySelector('link')?.textContent,
      title: item.querySelector('title')?.textContent,
      description: item.querySelector('description')?.textContent,
    }));
  }, await response.text());

  for (const entry of entries) {
    expect(feedEntries.find((item) => item.url === `https://nm.team${entry.path}`)).toMatchObject({
      title: entry.title,
      description: entry.description,
    });
  }

  await context.close();
});
