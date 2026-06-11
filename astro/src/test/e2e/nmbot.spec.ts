import { expect, test } from '@playwright/test';

test.describe('nmBot custom landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh-CN/products/overview/nmBot-Telegram/');
  });

  test('keeps major sections in the migrated order', async ({ page }) => {
    await expect(page.getByTestId('nmbot-hero')).toBeVisible();
    await expect(page.locator('#intelligenceContainer')).toBeVisible();
    await expect(page.getByTestId('nmbot-resources')).toBeVisible();
    await expect(page.getByTestId('nmbot-footer-notes')).toBeVisible();

    const sectionOrder = await page.locator('[data-testid="nmbot-hero"], #intelligenceContainer, [data-testid="nmbot-resources"], [data-testid="nmbot-footer-notes"]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-testid') ?? node.id),
    );

    expect(sectionOrder).toEqual(['nmbot-hero', 'nmbot-intelligence', 'nmbot-resources', 'nmbot-footer-notes']);
  });

  test('captures focused hero screenshot', async ({ page }) => {
    await expect(page.getByTestId('nmbot-hero')).toHaveScreenshot('nmbot-hero.png', { maxDiffPixelRatio: 0.015 });
  });

  test('captures focused nmBot Intelligence screenshot', async ({ page }) => {
    await page.locator('#intelligenceContainer').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('nmbot-intelligence')).toHaveScreenshot('nmbot-intelligence.png', { maxDiffPixelRatio: 0.015 });
  });

  test('captures focused resources screenshot', async ({ page }) => {
    await page.getByTestId('nmbot-resources').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('nmbot-resources')).toHaveScreenshot('nmbot-resources.png', { maxDiffPixelRatio: 0.015 });
  });

  test('captures focused footer notes screenshot', async ({ page }) => {
    await page.getByTestId('nmbot-footer-notes').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('nmbot-footer-notes')).toHaveScreenshot('nmbot-footer-notes.png', { maxDiffPixelRatio: 0.015 });
  });
});
