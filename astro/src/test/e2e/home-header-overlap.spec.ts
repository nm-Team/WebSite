import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

async function openHome(page: Page, locale = 'zh-CN', animated = false) {
  await page.setViewportSize({ width: 944, height: 760 });
  await page.emulateMedia({ reducedMotion: animated ? 'no-preference' : 'reduce' });
  await page.addInitScript(() => localStorage.setItem('cookieTipv0Checked', 'true'));
  await page.goto(`/${locale}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const artwork = document.querySelectorAll('.indexHeaderLogo, .indexHeaderName');
    await Promise.all([...artwork].flatMap(element => element.getAnimations().map(animation => animation.finished)));
  });
}

async function scrollLogoIntoNavigation(page: Page) {
  await page.locator('.indexHeaderLogo').evaluate(async element => {
    await Promise.all(element.getAnimations().map(animation => animation.finished));
  });
  return page.evaluate(() => {
    const logo = document.querySelector('.indexHeaderLogo')!.getBoundingClientRect();
    const header = document.querySelector('#pageHeader')!.getBoundingClientRect();
    const position = window.scrollY + logo.top + logo.height / 2 - header.height / 2;
    window.scrollTo(0, position);
    return position;
  });
}

test.beforeEach(({ browserName }, testInfo) => {
  test.skip(browserName !== 'chromium' || testInfo.project.name !== 'desktop', 'These tests set their own responsive viewport sizes.');
});

for (const locale of ['zh-CN', 'en']) {
  test(`temporarily hides overlapping hero navigation without moving the account button (${locale})`, async ({ page }, testInfo) => {
    await openHome(page, locale);
    const links = page.locator('#pageHeader .links');
    const homeLink = links.locator('a').first();
    const account = page.locator('#accountBox');
    await expect(homeLink).toBeVisible();
    const accountBefore = await account.boundingBox();
    const linksBefore = await links.boundingBox();

    // Nearby artwork should leave the links usable until it is about to touch.
    const nearbyPosition = await page.evaluate(() => {
      const logo = document.querySelector('.indexHeaderLogo')!.getBoundingClientRect();
      const navigation = document.querySelector('#pageHeader .links')!.getBoundingClientRect();
      return window.scrollY + logo.top - navigation.bottom - 8;
    });
    await page.evaluate(y => window.scrollTo(0, y), nearbyPosition);
    await expect(homeLink).toBeVisible();
    await page.evaluate(y => window.scrollTo(0, y + 6), nearbyPosition);
    await expect(homeLink).toBeHidden();
    await page.evaluate(y => window.scrollTo(0, y), nearbyPosition);
    await expect(homeLink).toBeVisible();

    await homeLink.focus();
    await scrollLogoIntoNavigation(page);
    await expect(homeLink).toBeHidden();
    await expect(links).toHaveAttribute('inert', '');
    await expect(homeLink).not.toBeFocused();
    await expect(account).toBeVisible();
    expect(await account.boundingBox()).toEqual(accountBefore);
    expect(await links.boundingBox()).toEqual(linksBefore);
    if (locale === 'zh-CN') await page.screenshot({ path: testInfo.outputPath('hero-links-hidden.png') });

    await page.evaluate(() => window.scrollTo(0, 700));
    await expect(homeLink).toBeVisible();
    await expect(links).not.toHaveAttribute('inert');
    await homeLink.focus();
    await expect(homeLink).toBeFocused();

    await scrollLogoIntoNavigation(page);
    await expect(homeLink).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(homeLink).toBeVisible();
  });
}

test('recalculates overlap when resizing and keeps the mobile menu usable', async ({ page }) => {
  await openHome(page);
  const homeLink = page.locator('#pageHeader .links a').first();
  const position = await scrollLogoIntoNavigation(page);
  await expect(homeLink).toBeHidden();

  await page.setViewportSize({ width: 1920, height: 760 });
  await expect(homeLink).toBeVisible();
  await page.setViewportSize({ width: 944, height: 760 });
  await expect(homeLink).toBeHidden();

  await page.setViewportSize({ width: 390, height: 760 });
  await expect(page.locator('#pageHeader .links')).not.toHaveAttribute('inert');
  await page.locator('#menu-toggle').click();
  await expect(homeLink).toBeVisible();
  await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded', 'true');
  await page.locator('#menu-toggle').click();

  await page.setViewportSize({ width: 944, height: 760 });
  await page.evaluate(y => window.scrollTo(0, y), position);
  await expect(homeLink).toBeHidden();
  await page.setViewportSize({ width: 1920, height: 760 });
  await expect(homeLink).toBeVisible();
});

test('reveals navigation shortly after artwork starts flying into the header', async ({ page }) => {
  await openHome(page, 'zh-CN', true);
  const homeLink = page.locator('#pageHeader .links a').first();
  const logoClones = page.locator('body > .indexHeaderLogo');
  const position = await scrollLogoIntoNavigation(page);
  await expect(homeLink).toBeHidden();

  // Hold the artwork at takeoff, where it still intersects the navigation.
  // The links must finish fading in even though the flight cannot land yet.
  const visibleAfter = await page.evaluate(() => new Promise<number>(resolve => {
    const links = document.querySelector<HTMLElement>('#pageHeader .links')!;
    const firstLink = links.querySelector('a')!;
    const observer = new MutationObserver(() => {
      const flyers = document.querySelectorAll('body > .indexHeaderLogo, body > .indexHeaderName');
      if (flyers.length !== 2) return;
      flyers.forEach(flyer => flyer.getAnimations().forEach(animation => animation.pause()));
      observer.disconnect();
      const started = performance.now();
      const sample = () => {
        const elapsed = performance.now() - started;
        const textVisible = getComputedStyle(firstLink).visibility === 'visible';
        const opacity = Number(getComputedStyle(links).opacity);
        if ((textVisible && opacity > 0) || elapsed > 1_000) {
          resolve(elapsed);
          return;
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    observer.observe(document.body, { childList: true });
    window.scrollTo(0, 300);
  }));
  expect(visibleAfter, 'Navigation should give the flight a short head start').toBeGreaterThanOrEqual(60);
  expect(visibleAfter, 'Navigation should start appearing within 200 ms of takeoff').toBeLessThan(200);
  await expect(logoClones).toHaveCount(1);
  expect(await logoClones.evaluate(clone => {
    const artwork = clone.getBoundingClientRect();
    const links = document.querySelector('#pageHeader .links')!.getBoundingClientRect();
    return artwork.left < links.right && artwork.right > links.left
      && artwork.top < links.bottom && artwork.bottom > links.top;
  })).toBe(true);
  await expect(homeLink).toBeVisible();
  await expect(page.locator('#pageHeader .links')).toHaveCSS('opacity', '1');
  await expect(page.locator('#pageHeader .links')).not.toHaveAttribute('inert');
  await expect(logoClones).toHaveCount(1);

  await page.evaluate(() => {
    document.querySelectorAll('body > .indexHeaderLogo, body > .indexHeaderName')
      .forEach(flyer => flyer.getAnimations().forEach(animation => animation.play()));
  });
  await expect(logoClones).toHaveCount(0);
  await expect(homeLink).toBeVisible();

  await page.evaluate(y => window.scrollTo(0, y), position);
  await expect(homeLink).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect(logoClones).toHaveCount(0);
  await expect(homeLink).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(homeLink).toBeVisible();
  await scrollLogoIntoNavigation(page);
  await expect(homeLink).toBeHidden();
});
