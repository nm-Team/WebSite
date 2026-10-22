import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.cookieTipv0Checked = 'true'; });
});

test('the global header scrolls away and local navigation stays at the top', async ({ page }) => {
  await page.goto('/en/newsroom/');
  const global = page.locator('#pageHeader');
  const local = page.locator('#newsroom-header');
  const globalBox = await global.boundingBox();
  const localBox = await local.boundingBox();
  expect(globalBox).not.toBeNull();
  expect(localBox).not.toBeNull();
  expect(Math.abs(localBox!.y - globalBox!.height)).toBeLessThan(1);
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect.poll(async () => (await local.boundingBox())!.y).toBe(0);
  expect((await global.boundingBox())!.y).toBeLessThan(-50);
  const duplicateIds = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicateIds).toEqual([]);
  await expect(page.locator('script[data-website-id]')).toHaveCount(1);
  await expect(page.locator('script[data-website-id]')).toHaveAttribute('data-website-id', '3f6853e3-82e8-4f73-977f-cf685c37e3c3');
});

test('mobile navigation keeps menus separate and restores focus and scrolling', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Both mobile menus are needed');
  await page.goto('/en/newsroom/');
  const local = page.locator('#newsroom-menu-toggle');
  const global = page.locator('#menu-toggle');
  await local.click();
  await expect(local).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await expect(page.locator('#fcont')).toHaveAttribute('inert', '');
  await global.click();
  await expect(local).toHaveAttribute('aria-expanded', 'false');
  await expect(global).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(global).toHaveAttribute('aria-expanded', 'false');
  await expect(global).toBeFocused();
  await local.click();
  await page.keyboard.press('Escape');
  await expect(local).toHaveAttribute('aria-expanded', 'false');
  await expect(local).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(page.locator('#fcont')).not.toHaveAttribute('inert');
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400);
});

test('local navigation fits narrow screens and respects light, dark and reduced-motion settings', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'This test supplies its own viewport matrix');
  test.setTimeout(60_000);
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    for (const width of [320, 390, 700, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/en/newsroom/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
      const local = page.locator('#newsroom-header');
      expect((await local.boundingBox())!.height).toBe(width < 700 ? 48 : 52);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
      if (width < 700) {
        await page.locator('#newsroom-menu-toggle').click();
        await expect(page.locator('#newsroom-extended-menu')).toBeVisible();
        await expect(page.locator('#newsroom-main')).toHaveAttribute('inert', '');
        await expect(page.locator('#newsroom-menu-toggle .bar').first()).toHaveCSS('transition-duration', '0s');
      } else {
        await page.locator('[data-newsroom-search-toggle]').click();
        await expect(page.locator('#newsroom-query')).toBeFocused();
        await expect(page.locator('[data-newsroom-search-toggle]')).toHaveAttribute('aria-expanded', 'true');
      }
      await page.keyboard.press('Escape');
      await expect(page.locator('#newsroom-extended-menu')).not.toBeVisible();
      await expect(page.locator('#newsroom-main')).not.toHaveAttribute('inert');
    }
  }
});

test('local navigation contains no language switch and search uses the page language', async ({ page }) => {
  await page.goto('/zh-CN/newsroom/welcome-2021-08-09/');
  await expect(page.locator('#newsroom-header [hreflang]')).toHaveCount(0);
  const mobile = await page.locator('#newsroom-menu-toggle').isVisible();
  if (mobile) await page.locator('#newsroom-menu-toggle').click();
  else await page.locator('[data-newsroom-search-toggle]').click();
  await page.locator('#newsroom-query').fill('nmBot');
  await page.locator('#newsroom-query').press('Enter');
  await expect(page).toHaveURL(/\/zh-CN\/newsroom\/search\/\?q=nmBot$/);
  await expect(page.locator('#search-results a')).not.toHaveCount(0);
});

test('local header and footer both open the press release and stories categories', async ({ page }) => {
  for (const locale of ['zh-CN', 'en']) {
    await page.goto(`/${locale}/newsroom/`);
    for (const slug of ['press-release', 'stories']) {
      const target = `/${locale}/newsroom/category/${slug}/`;
      const mobile = await page.locator('#newsroom-menu-toggle').isVisible();
      if (mobile) await page.locator('#newsroom-menu-toggle').click();
      const nav = page.locator(mobile ? '#newsroom-extend-nav-menu' : '#newsroom-nav-menu');
      const link = nav.locator(`a[href="${target}"]`);
      const title = await link.innerText();
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${target}$`));
      await expect(page.locator('h1')).toHaveText(title);
      await expect(page.locator(`a[href="${target}"][aria-current="page"]`)).toHaveCount(2);
      await expect(page.locator(`#newsroom-footer a[href="${target}"]`)).toHaveText(title);
    }
  }
});

test('the global footer follows the local footer and keeps language switching available', async ({ page }) => {
  await page.goto('/en/newsroom/welcome-2021-08-09/');
  const local = page.locator('#newsroom-footer');
  const global = page.locator('#fcont');
  await expect(global).toBeVisible();
  const localBox = (await local.boundingBox())!;
  const globalBox = (await global.boundingBox())!;
  expect(globalBox.y).toBeGreaterThanOrEqual(localBox.y + localBox.height - 1);
  await expect(global.locator('a[href="/en/products/"]')).toBeVisible();
  await page.locator('#footer_selectLanguageButton').click();
  await page.locator('[data-lanid="zh-CN"]').click();
  await expect(page).toHaveURL(/\/zh-CN\/newsroom\/welcome-2021-08-09\/$/);

  await page.goto('/zh-CN/newsroom/nmfun-test-2021-11-20/');
  await page.locator('#footer_selectLanguageButton').click();
  await page.locator('[data-lanid="en"]').click();
  await expect(page).toHaveURL(/\/zh-CN\/newsroom\/nmfun-test-2021-11-20\/$/);
});

test('both navigation and footer levels share their content edges at every breakpoint', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'This test supplies its own viewport matrix');
  for (const width of [320, 390, 699, 700, 768, 900, 901, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/en/newsroom/', { waitUntil: 'domcontentloaded' });
    const edges = await page.evaluate(() => {
      const global = document.querySelector<HTMLElement>('#pageHeader')!;
      const box = global.getBoundingClientRect();
      const style = getComputedStyle(global);
      const expected = { left: box.left + parseFloat(style.paddingLeft), right: box.right - parseFloat(style.paddingRight) };
      const actual = ['#newsroom-header .container', '#newsroom-footer .footer-body', '#fcont .footer-body'].map((selector) => {
        const bounds = document.querySelector(selector)!.getBoundingClientRect();
        return { left: bounds.left, right: bounds.right };
      });
      return { expected, actual, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    for (const actual of edges.actual) {
      expect(Math.abs(actual.left - edges.expected.left), `left edge at ${width}px`).toBeLessThan(1);
      expect(Math.abs(actual.right - edges.expected.right), `right edge at ${width}px`).toBeLessThan(1);
    }
    expect(edges.overflow).toBeLessThanOrEqual(1);
    const brand = (await page.locator('#pageHeader .left').boundingBox())!;
    expect(Math.abs(brand.x - edges.expected.left)).toBeLessThan(1);
    if (width < 700) {
      const upperToggle = (await page.locator('#menu-toggle').boundingBox())!;
      const lowerToggle = (await page.locator('#newsroom-menu-toggle').boundingBox())!;
      expect(Math.abs(upperToggle.x - lowerToggle.x)).toBeLessThan(1);
      expect(upperToggle.width).toBe(lowerToggle.width);
    }
  }
});

test('the local menu animates both ways and handles rapid pointer reversals', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en/newsroom/');
  const panel = page.locator('#newsroom-extended-menu');
  const trigger = await page.locator('#newsroom-menu-toggle').isVisible()
    ? page.locator('#newsroom-menu-toggle') : page.locator('[data-newsroom-search-toggle]');
  await panel.evaluate((element) => {
    element.setAttribute('data-opacity-transitions', '0');
    element.addEventListener('transitionrun', (event) => {
      if (event.target === element && (event as TransitionEvent).propertyName === 'opacity') {
        element.setAttribute('data-opacity-transitions', String(Number(element.getAttribute('data-opacity-transitions')) + 1));
      }
    });
  });
  await trigger.click();
  await expect(panel).toHaveCSS('opacity', '1');
  await expect(panel).toHaveAttribute('data-opacity-transitions', '1');
  await trigger.click();
  await expect(panel).not.toBeVisible();
  await expect(panel).toHaveAttribute('data-opacity-transitions', '2');

  const box = (await trigger.boundingBox())!;
  for (let i = 0; i < 3; i++) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toHaveCSS('opacity', '1');
  await expect(page.locator('#newsroom-query')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('the open menu shares one header surface before and after sticking', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto('/en/newsroom/');
    const header = page.locator('#newsroom-header');
    const panel = page.locator('#newsroom-extended-menu');
    const trigger = await page.locator('#newsroom-menu-toggle').isVisible()
      ? page.locator('#newsroom-menu-toggle') : page.locator('[data-newsroom-search-toggle]');
    for (const top of [0, 300]) {
      await page.evaluate((y) => window.scrollTo(0, y), top);
      await trigger.click();
      await expect(panel).toHaveCSS('opacity', '1');
      await expect(header).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(header).toHaveCSS('backdrop-filter', /blur\(22px\)/);
      await expect(panel).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(panel).toHaveCSS('position', 'static');
      const outer = (await header.boundingBox())!;
      const inner = (await panel.boundingBox())!;
      expect(outer.height).toBeGreaterThan(inner.height);
      expect(inner.y + inner.height).toBeLessThanOrEqual(outer.y + outer.height);
      await trigger.click();
      await expect(panel).not.toBeVisible();
      await expect(header).not.toHaveAttribute('data-menu-visible');
      if (top === 0) await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    }
  }
});

test('the local navigation gains its background only at the sticky boundary', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto('/en/newsroom/');
    const local = page.locator('#newsroom-header');
    const globalHeight = (await page.locator('#hcont').boundingBox())!.height;
    await expect(local).not.toHaveAttribute('data-stuck');
    await expect(local).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(local).toHaveCSS('backdrop-filter', 'none');

    await page.evaluate((top) => window.scrollTo(0, top), globalHeight - 1);
    await expect.poll(async () => (await local.boundingBox())!.y).toBe(1);
    await expect(local).not.toHaveAttribute('data-stuck');
    await expect(local).toHaveCSS('backdrop-filter', 'none');
    await page.evaluate((top) => window.scrollTo(0, top), globalHeight);
    await expect.poll(async () => (await local.boundingBox())!.y).toBe(0);
    await expect(local).toHaveAttribute('data-stuck', '');
    await expect(local).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(local).toHaveCSS('backdrop-filter', /blur\(22px\)/);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(local).not.toHaveAttribute('data-stuck');
    await expect(local).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(local).toHaveCSS('backdrop-filter', 'none');
  }
});
