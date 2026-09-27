import { expect, test } from '@playwright/test';

test('keeps full-width home carousels inside a viewport with a scrollbar gutter', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The scrollbar gutter regression only needs one browser project.');

  await page.goto('/zh-CN/', { waitUntil: 'domcontentloaded' });
  // Headless Chromium uses overlay scrollbars. Narrow the page by a typical
  // Windows scrollbar width to preserve the same content-width versus vw gap.
  await page.addStyleTag({ content: 'body { width: calc(100% - 15px); }' });

  const layout = await page.evaluate(() => {
    const viewportRect = document.body.getBoundingClientRect();
    const carousels = [...document.querySelectorAll<HTMLElement>('.cardSwiper')].map((carousel) => {
      const section = carousel.parentElement;
      if (!section) {
        throw new Error('Expected each home carousel to have a section parent.');
      }

      const carouselRect = carousel.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const style = getComputedStyle(carousel);
      const paddingLeft = Number.parseFloat(style.paddingLeft);
      const paddingRight = Number.parseFloat(style.paddingRight);

      return {
        left: carouselRect.left,
        right: carouselRect.right,
        contentLeft: carouselRect.left + paddingLeft,
        contentRight: carouselRect.right - paddingRight,
        sectionLeft: sectionRect.left,
        sectionRight: sectionRect.right,
      };
    });

    return {
      gutterWidth: window.innerWidth - viewportRect.width,
      viewportWidth: viewportRect.width,
      scrollWidth: document.body.scrollWidth,
      carousels,
    };
  });

  expect(layout.gutterWidth).toBeGreaterThan(0);
  expect(layout.scrollWidth).toBe(layout.viewportWidth);
  expect(layout.carousels).toHaveLength(2);

  for (const carousel of layout.carousels) {
    expect(Math.abs(carousel.left)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(carousel.right - layout.viewportWidth)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(carousel.contentLeft - carousel.sectionLeft)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(carousel.contentRight - carousel.sectionRight)).toBeLessThanOrEqual(0.5);
  }
});
