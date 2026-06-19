import { expect, test } from '@playwright/test';

test.describe('nmBot custom landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh-CN/products/overview/nmBot-Telegram/');
  });

  test('keeps major sections in the expected order', async ({ page }) => {
    await expect(page.getByTestId('nmbot-hero')).toBeVisible();
    await expect(page.locator('#intelligenceContainer')).toBeVisible();
    await expect(page.getByTestId('nmbot-resources')).toBeVisible();
    await expect(page.getByTestId('nmbot-footer-notes')).toBeVisible();

    const sectionOrder = await page.locator('[data-testid="nmbot-hero"], #intelligenceContainer, [data-testid="nmbot-resources"], [data-testid="nmbot-footer-notes"]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-testid') ?? node.id),
    );

    expect(sectionOrder).toEqual(['nmbot-hero', 'nmbot-intelligence', 'nmbot-resources', 'nmbot-footer-notes']);
  });
});
