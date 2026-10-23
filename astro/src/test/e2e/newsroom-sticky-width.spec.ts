import { expect, test } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.cookieTipv0Checked = 'true'; });
});

test('the sticky header aligns with Newsroom content and returns to the global gutter', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'This test supplies its own viewport matrix');
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const article of [false, true]) {
    for (const width of [320, 390, 699, 700, 749, 750, 768, 900, 901, 1199, 1200, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(article ? '/en/newsroom/welcome-2021-08-09/' : '/en/newsroom/', { waitUntil: 'domcontentloaded' });
      const header = page.locator('#newsroom-header');
      const bar = page.locator('#newsroom-header .container');
      const before = (await bar.boundingBox())!;
      const boundary = (await page.locator('#hcont').boundingBox())!.height;
      await page.evaluate((y) => window.scrollTo(0, y), boundary);
      await expect(header).toHaveAttribute('data-stuck');
      const reference = article ? width >= 1200 ? '.post-page .post' : '.post-content' : '.post-list > .item:first-of-type';
      const content = (await page.locator(reference).boundingBox())!;
      const aligned = (await bar.boundingBox())!;
      expect(Math.abs(aligned.x - content.x), `${article ? 'article' : 'list'} left at ${width}px`).toBeLessThan(1);
      expect(Math.abs(aligned.width - content.width), `${article ? 'article' : 'list'} width at ${width}px`).toBeLessThan(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(header).not.toHaveAttribute('data-stuck');
      const returned = (await bar.boundingBox())!;
      expect(Math.abs(returned.x - before.x)).toBeLessThan(1);
      expect(Math.abs(returned.width - before.width)).toBeLessThan(1);
    }
  }
});

test('the popup follows the sticky header width through resize and scroll reversals', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, 'The popup is only used on mobile');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en/newsroom/');
  const header = page.locator('#newsroom-header');
  const bar = page.locator('#newsroom-header .container');
  const boundary = (await page.locator('#hcont').boundingBox())!.height;
  for (const y of [boundary, boundary - 2, boundary + 2, 0, boundary]) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
  }
  await expect(header).toHaveAttribute('data-stuck');
  await expect.poll(async () => {
    const title = (await bar.boundingBox())!;
    const card = (await page.locator('.post-list > .item').first().boundingBox())!;
    return Math.abs(title.x - card.x);
  }).toBeLessThan(1);
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ width: viewport.width, height: viewport.height - 80 });
  const trigger = page.locator('#newsroom-menu-toggle');
  await trigger.click();
  await expect(page.locator('#newsroom-extended-menu')).toHaveCSS('opacity', '1');
  const topRow = (await bar.boundingBox())!;
  const popup = (await page.locator('.newsroom-panel-content').boundingBox())!;
  expect(Math.abs(topRow.x - popup.x)).toBeLessThan(1);
  expect(Math.abs(topRow.width - popup.width)).toBeLessThan(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('#newsroom-extended-menu')).not.toBeVisible();
});

test('rapid returns preserve visible positions and the full width animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/newsroom/', { waitUntil: 'domcontentloaded' });
  const header = page.locator('#newsroom-header');
  const content = page.locator('#newsroom-header .site-name-text, #newsroom-nav-menu, #newsroom-menu-toggle');
  const positions = () => content.evaluateAll((elements) => elements.filter((element) => element.getBoundingClientRect().width > 0).map((element) => element.getBoundingClientRect().left));
  const initial = await positions();
  await page.evaluate(() => window.scrollTo(0, 1000));
  await expect(header).toHaveAttribute('data-stuck');
  const stuck = await positions();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).not.toHaveAttribute('data-stuck');
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  for (const top of [1000, 0, 1000, 0]) {
    const movement = await header.evaluate((element, top) => new Promise<{ before: number[]; start: number[]; halfway: number[]; durations: number[] }>((resolve) => {
      const elements = [...element.querySelectorAll('.site-name-text, #newsroom-nav-menu, #newsroom-menu-toggle')].filter((child) => child.getBoundingClientRect().width > 0);
      const measure = () => elements.map((child) => child.getBoundingClientRect().left);
      const before = measure();
      // Pause real animations before the next paint to inspect motion independently of frame rate.
      const observer = new MutationObserver(() => {
        observer.disconnect();
        const animations = element.getAnimations({ subtree: true });
        for (const animation of animations) { animation.pause(); animation.currentTime = 0; }
        const start = measure();
        for (const animation of animations) animation.currentTime = 150;
        resolve({ before, start, halfway: measure(), durations: animations.map((animation) => Number(animation.effect!.getTiming().duration)) });
      });
      observer.observe(element, { attributes: true, attributeFilter: ['data-stuck'] });
      window.scrollTo(0, top);
    }), top);
    expect(movement.durations.length).toBeGreaterThan(0);
    for (const duration of movement.durations) expect(duration).toBe(300);
    const destination = top === 0 ? initial : stuck;
    movement.start.forEach((position, index) => {
      expect(Math.abs(position - movement.before[index]), `continuous start after scrolling to ${top}`).toBeLessThan(0.1);
      const middle = movement.halfway[index];
      expect(middle).toBeGreaterThan(Math.min(position, destination[index]));
      expect(middle).toBeLessThan(Math.max(position, destination[index]));
    });
    const viewport = page.viewportSize()!;
    if (top === 0 && viewport.width < 700) {
      // Mobile browser toolbars resize the viewport height while scrolling.
      await page.setViewportSize({ width: viewport.width, height: viewport.height - 30 });
      (await positions()).forEach((position, index) => expect(Math.abs(position - movement.halfway[index])).toBeLessThan(0.1));
    }
  }

  await header.evaluate(async (element) => {
    const animations = element.getAnimations({ subtree: true });
    for (const animation of animations) animation.finish();
    await Promise.all(animations.map((animation) => animation.finished));
  });
  (await positions()).forEach((position, index) => expect(Math.abs(position - initial[index])).toBeLessThan(0.1));

  await page.evaluate(() => window.scrollTo(0, 1000));
  await expect(header).toHaveAttribute('data-stuck');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => header.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  (await positions()).forEach((position, index) => expect(Math.abs(position - stuck[index])).toBeLessThan(0.1));
});

test('local links align with the account text before sticking and with content after sticking', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'This test supplies its own desktop viewport matrix');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['en', 'zh-CN']) {
    for (const width of [901, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/${locale}/newsroom/search/`);
      const measure = () => page.evaluate(() => {
        const visibleTextRight = (selector: string) => {
          const element = document.querySelector<HTMLElement>(selector)!;
          const range = document.createRange();
          range.selectNodeContents(element);
          const right = range.getBoundingClientRect().right;
          // Range includes hidden glyphs when the account label is ellipsized.
          return getComputedStyle(element).overflowX === 'hidden' ? Math.min(right, element.getBoundingClientRect().right) : right;
        };
        return {
          account: visibleTextRight('#userName'),
          local: visibleTextRight('#newsroom-nav-menu a:last-child'),
          content: document.querySelector('.search-page-form')!.getBoundingClientRect().right,
        };
      });
      const initial = await measure();
      expect(Math.abs(initial.account - initial.local), `${locale} text edge at ${width}px`).toBeLessThan(1);
      await page.locator('#userName').evaluate((element) => { element.style.maxWidth = '40px'; });
      expect(await page.locator('#userName').evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
      const clipped = await measure();
      expect(Math.abs(clipped.account - clipped.local), `${locale} clipped text edge at ${width}px`).toBeLessThan(1);
      await page.locator('#userName').evaluate((element) => element.style.removeProperty('max-width'));
      await page.evaluate(() => window.scrollTo(0, 100));
      await expect(page.locator('#newsroom-header')).toHaveAttribute('data-stuck');
      const stuck = await measure();
      expect(Math.abs(stuck.local - stuck.content), `${locale} sticky edge at ${width}px`).toBeLessThan(1);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(page.locator('#newsroom-header')).not.toHaveAttribute('data-stuck');
      const returned = await measure();
      expect(Math.abs(returned.account - returned.local)).toBeLessThan(1);
    }
  }
});
