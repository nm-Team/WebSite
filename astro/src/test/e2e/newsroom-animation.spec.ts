import { expect, isolateExternalRequests, test } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.cookieTipv0Checked = 'true';
    document.addEventListener('animationstart', (event) => {
      if (event.animationName !== 'item-come-out' || !(event.target instanceof HTMLElement)) return;
      event.target.dataset.animationStarts = String(Number(event.target.dataset.animationStarts ?? 0) + 1);
    });
  });
});

test('cards start hidden before hydration and replay on each viewport entry', async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const response = await request.get('/en/newsroom/');
  expect(response.ok()).toBe(true);
  // Astro can inline small modules, so defer both inline and external modules in the real HTML.
  const deferredHtml = await page.evaluate((html) => {
    const document = new DOMParser().parseFromString(html, 'text/html');
    for (const script of document.querySelectorAll('script[type="module"]')) script.setAttribute('type', 'application/deferred-module');
    return `<!doctype html>${document.documentElement.outerHTML}`;
  }, await response.text());
  await page.route('**/en/newsroom/', (route) => route.fulfill({ response, body: deferredHtml }));
  await page.goto('/en/newsroom/', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.post-list > .item').first();
  await expect(card).toBeAttached();
  await expect(card).not.toHaveAttribute('data-come-out-animation');
  await expect(card).toHaveCSS('opacity', '0');
  await page.evaluate(() => {
    for (const deferred of document.querySelectorAll<HTMLScriptElement>('script[type="application/deferred-module"]')) {
      const script = document.createElement('script');
      for (const { name, value } of deferred.attributes) script.setAttribute(name, value);
      script.type = 'module';
      script.textContent = deferred.textContent;
      deferred.replaceWith(script);
    }
  });
  for (let iteration = 1; iteration <= 3; iteration++) {
    await expect(card).toHaveAttribute('data-animation-starts', String(iteration));
    await expect(card).toHaveCSS('opacity', '1');
    if (iteration === 3) break;
    await card.evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().bottom + window.scrollY + 200));
    await expect(card).not.toHaveAttribute('data-come-out-animation');
    await expect(card).toHaveCSS('opacity', '0');
    await page.evaluate(() => window.scrollTo(0, 0));
  }
});

test('cards remain visible when JavaScript is disabled or motion preferences change', async ({ page, browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await isolateExternalRequests(context, baseURL);
  const staticPage = await context.newPage();
  await staticPage.goto(`${baseURL}/en/newsroom/`);
  await expect(staticPage.locator('.post-list > .item').first()).toHaveCSS('opacity', '1');
  await context.close();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/newsroom/');
  const card = page.locator('.post-list > .item').first();
  await expect(card).toHaveCSS('opacity', '1');
  await expect(card).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(card).toHaveAttribute('data-animation-starts', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(card).toHaveCSS('opacity', '1');
  await expect(card).toHaveCSS('animation-name', 'none');
});
