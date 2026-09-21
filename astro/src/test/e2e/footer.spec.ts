import { expect, test } from '@playwright/test';

test('uses two footer columns before desktop links become cramped', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'tablet', 'The intermediate footer layout only needs one browser project.');

  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto('/aboutus/');

  const footerTable = page.locator('#fcont .footer-table');
  await expect(footerTable).toBeVisible();

  const columnCount = await footerTable.evaluate((element) => {
    return getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length;
  });

  expect(columnCount).toBe(2);

  await page.setViewportSize({ width: 1001, height: 900 });
  expect(await footerTable.evaluate((element) => {
    return getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length;
  })).toBe(4);

  const linkLineCounts = await footerTable.locator('a').evaluateAll((links) => {
    return links.map((link) => {
      const range = document.createRange();
      range.selectNodeContents(link);
      return range.getClientRects().length;
    });
  });

  expect(Math.max(...linkLineCounts)).toBe(1);
});

test('stacks footer navigation into one column on small viewports', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'The single-column footer only applies to small viewports.');

  await page.setViewportSize({ width: 700, height: 900 });
  await page.goto('/aboutus/');

  const footerTable = page.locator('#fcont .footer-table');
  await expect(footerTable).toBeVisible();

  const layout = await footerTable.evaluate((element) => ({
    columnCount: getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
    rowOffsets: Array.from(element.children, (child) => Math.round(child.getBoundingClientRect().left)),
  }));

  expect(layout.columnCount).toBe(1);
  expect(layout.rowOffsets).toHaveLength(4);
  expect(new Set(layout.rowOffsets).size).toBe(1);
});

test('keeps product footnotes visually continuous with the site footer', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The product footer continuity check only needs one browser project.');

  await page.goto('/zh-CN/products/overview/nmBrowser-StartPage/', { waitUntil: 'domcontentloaded' });

  const layout = await page.evaluate(() => {
    const notes = document.querySelector<HTMLElement>('.products_footer');
    const footer = document.querySelector<HTMLElement>('#fcont');
    if (!notes || !footer) {
      throw new Error('Expected product footnotes and site footer to be present.');
    }

    const notesRect = notes.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    return {
      background: getComputedStyle(notes).backgroundColor,
      footerBackground: getComputedStyle(footer).backgroundColor,
      gap: footerRect.top - notesRect.bottom,
    };
  });

  expect(layout.background).toBe(layout.footerBackground);
  expect(Math.abs(layout.gap)).toBeLessThanOrEqual(1);
});

test('exposes cookie consent as a focused dialog', async ({ page }) => {
  await page.goto('/zh-CN/aboutus/');

  const dialog = page.locator('#pageCookieConfirmDialog');
  await expect(dialog).toHaveAttribute('role', 'dialog');
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog).toHaveAttribute('aria-labelledby', 'cookie-consent-title');
  await expect(dialog).toHaveAttribute('aria-describedby', 'cookie-consent-description');
  await expect(dialog).toHaveAttribute('data-status', 'open', { timeout: 5_000 });
  await expect.poll(() => page.evaluate(() => document.activeElement?.textContent?.trim())).toBe('自定义');

  await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => document.activeElement?.textContent?.trim())).toBe('接受并继续');
  await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => document.activeElement?.textContent?.trim())).toBe('自定义');
});
