import { expect, test } from '@playwright/test';

test('flies the nmTeam title into the header and back while scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await page.route('https://newsroom.nmteam.xyz/api/posts**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ status: 200, data: [] }),
    });
  });

  await page.route('https://websiteres.nmteam.xyz/producticon/nmTeam/logo@64.png', async (route) => {
    await route.abort();
  });

  await page.goto('/zh-CN/', { waitUntil: 'domcontentloaded' });
  await page.locator('.indexHeaderName').waitFor({ state: 'attached' });

  const header = page.locator('#pageHeader');
  const nameClones = page.locator('body > .indexHeaderName[aria-hidden="true"]');
  const logoClones = page.locator('body > .indexHeaderLogo[aria-hidden="true"]');

  // Whenever a clone is mid-fade (0 < opacity < 1), the real header brand
  // beneath it must already be fully opaque, or the composite would blink.
  await page.evaluate(() => {
    const browserWindow = window as unknown as { __handoffOpacityViolations: number[] };
    browserWindow.__handoffOpacityViolations = [];
    setInterval(() => {
      const clones = document.querySelectorAll<HTMLElement>(
        'body > .indexHeaderName[aria-hidden="true"], body > .indexHeaderLogo[aria-hidden="true"]',
      );
      const fading = [...clones].some((clone) => {
        const opacity = Number.parseFloat(window.getComputedStyle(clone).opacity);
        return opacity > 0 && opacity < 1;
      });
      if (!fading) return;
      const brand = document.querySelector<HTMLElement>('#pageHeader .left');
      if (!brand) return;
      const brandOpacity = Number.parseFloat(window.getComputedStyle(brand).opacity);
      if (brandOpacity !== 1) browserWindow.__handoffOpacityViolations.push(brandOpacity);
    }, 10);
  });

  await page.evaluate(() => window.scrollTo(0, 700));

  // Both flyers take off as fixed clones, land, and are cleaned up.
  await expect(nameClones).toHaveCount(1);
  await expect(logoClones).toHaveCount(1);
  await expect(nameClones).toHaveCount(0);
  await expect(logoClones).toHaveCount(0);
  await expect(header).not.toHaveClass(/\bhidden\b/);
  await expect(header).not.toHaveClass(/\bhidetitle\b/);
  await expect(header.locator('.left')).toBeVisible();

  const headerLogoUsesInlineArtwork = await header.locator('.logo').evaluate((logo) => (
    logo instanceof HTMLElement && logo.style.backgroundImage.includes('data:image/png;base64,')
  ));
  expect(headerLogoUsesInlineArtwork).toBe(true);

  const opacityViolations = await page.evaluate(
    () => (window as unknown as { __handoffOpacityViolations: number[] }).__handoffOpacityViolations,
  );
  expect(opacityViolations).toEqual([]);

  // Fly back into the hero.
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).toHaveClass(/\bhidden\b/);
  await expect(header).toHaveClass(/\bhidetitle\b/);
  await expect(page.locator('.indexHeaderName')).toBeVisible();

  // Interrupt a forward flight mid-air: no clone may be left behind.
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect(nameClones).toHaveCount(1);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(nameClones).toHaveCount(0);
  await expect(logoClones).toHaveCount(0);
  await expect(header).toHaveClass(/\bhidden\b/);
  await expect(header).toHaveClass(/\bhidetitle\b/);
  await expect(page.locator('.indexHeaderName')).toBeVisible();

  // A final forward flight completes cleanly.
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect(nameClones).toHaveCount(1);
  await expect(nameClones).toHaveCount(0);
  await expect(logoClones).toHaveCount(0);
  await expect(header).not.toHaveClass(/\bhidden\b/);
  await expect(header).not.toHaveClass(/\bhidetitle\b/);
  await expect(header.locator('.left')).toBeVisible();
});
