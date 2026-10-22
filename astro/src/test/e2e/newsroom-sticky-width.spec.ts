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
  test.skip(testInfo.project.name !== 'mobile', 'The popup is only used on mobile');
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

test('rapid returns to the page top keep the full width transition', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The transition timing is shared across viewports');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en/newsroom/', { waitUntil: 'domcontentloaded' });
  const header = page.locator('#newsroom-header');
  const bar = page.locator('#newsroom-header .container');
  const initial = (await bar.boundingBox())!;
  await header.evaluate((element) => {
    // Pause each real CSS transition halfway through so every reversal occurs during motion.
    element.addEventListener('transitionrun', (event) => {
      const { propertyName } = event as TransitionEvent;
      if (!['margin-left', 'margin-right', 'padding-right'].includes(propertyName) || !(event.target instanceof Element)) return;
      for (const animation of event.target.getAnimations()) {
        if (!(animation instanceof CSSTransition) || animation.transitionProperty !== propertyName) continue;
        animation.pause();
        animation.currentTime = Number(animation.effect!.getTiming().duration) / 2;
      }
    });
  });

  for (const top of [1000, 0, 1000, 0]) {
    await page.evaluate((y) => window.scrollTo(0, y), top);
    if (top === 0) await expect(header).not.toHaveAttribute('data-stuck');
    else await expect(header).toHaveAttribute('data-stuck');
    await expect.poll(() => bar.evaluate((element) => element.getAnimations().some((animation) => animation.playState === 'paused'))).toBe(true);
    const transitions = await header.evaluate((element) => element.getAnimations({ subtree: true }).flatMap((animation) => {
      const effect = animation.effect;
      if (!(animation instanceof CSSTransition) || !(effect instanceof KeyframeEffect) || !(effect.target instanceof Element)) return [];
      if (!['margin-left', 'margin-right', 'padding-right'].includes(animation.transitionProperty)) return [];
      return [{ property: animation.transitionProperty, duration: effect.getTiming().duration, expected: Number.parseFloat(getComputedStyle(effect.target).transitionDuration) * 1000 }];
    }));
    expect(transitions.length).toBeGreaterThan(0);
    for (const transition of transitions) expect(transition.duration, `${transition.property} after scrolling to ${top}`).toBe(transition.expected);
  }

  await header.evaluate(async (element) => {
    const animations = element.getAnimations({ subtree: true });
    for (const animation of animations) animation.play();
    await Promise.all(animations.map((animation) => animation.finished));
  });
  const returned = (await bar.boundingBox())!;
  expect(Math.abs(returned.x - initial.x)).toBeLessThan(1);
  expect(Math.abs(returned.width - initial.width)).toBeLessThan(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => window.scrollTo(0, 1000));
  await expect(header).toHaveAttribute('data-stuck');
  expect(await bar.evaluate((element) => element.getAnimations().length)).toBe(0);
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
