import { expect, test } from '@playwright/test';

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
