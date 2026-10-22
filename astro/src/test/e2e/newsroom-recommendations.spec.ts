import { expect, test } from '@playwright/test';

test('only the final row of article recommendations has no bottom separator', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'This test exercises both sides of the recommendation grid breakpoint');
  await page.goto('/zh-CN/newsroom/nmfun-test-2021-11-20/');
  const cards = page.locator('#latest-posts .widget-post-list > .post');
  await expect(cards).toHaveCount(8);
  for (const count of [8, 7]) {
    if (count === 7) await cards.last().evaluate((card) => card.remove());
    for (const width of [390, 899, 900, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const rows = await cards.evaluateAll((elements) => elements.map((element) => ({
        top: element.getBoundingClientRect().top,
        border: parseFloat(getComputedStyle(element).borderBottomWidth),
      })));
      const lastRow = Math.max(...rows.map((row) => row.top));
      expect(rows.filter((row) => row.top === lastRow)).toHaveLength(width >= 900 && count % 2 === 0 ? 2 : 1);
      for (const row of rows) {
        if (row.top === lastRow) expect(row.border, `${count} cards at ${width}px`).toBe(0);
        else expect(row.border, `${count} cards at ${width}px`).toBeGreaterThan(0);
      }
    }
  }
});
