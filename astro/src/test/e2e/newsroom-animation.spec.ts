import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.cookieTipv0Checked = 'true';
    document.addEventListener('animationstart', (event) => {
      if (event.animationName !== 'item-come-out' || !(event.target instanceof HTMLElement)) return;
      event.target.dataset.animationStarts = String(Number(event.target.dataset.animationStarts ?? 0) + 1);
    });
  });
});

test('cards start hidden before hydration and replay on each viewport entry', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  let resumeModules!: () => void;
  const modulesReady = new Promise<void>((resolve) => { resumeModules = resolve; });
  await page.route('**/_astro/*.js', async (route) => { await modulesReady; await route.continue(); });
  await page.goto('/en/newsroom/', { waitUntil: 'commit' });
  const card = page.locator('.post-list > .item').first();
  try {
    await expect(card).toBeAttached();
    await expect(card).not.toHaveAttribute('data-come-out-animation');
    await expect(card).toHaveCSS('opacity', '0');
  } finally {
    resumeModules();
  }
  await page.waitForLoadState('domcontentloaded');
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
