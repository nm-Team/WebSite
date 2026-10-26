import { expect, test } from './fixtures';

test.describe('nmBot custom landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh-CN/nmBot-Telegram/');
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

  test('keeps feature tabs and panels accessible when switching chat types', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'desktop', 'Wide screens display all feature panels in columns.');

    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(3);
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#nmbot-feature-panel-group')).toBeVisible();
    await expect(page.locator('#nmbot-feature-panel-channel')).toBeHidden();

    await tabs.nth(1).click();

    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'false');
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(1)).toHaveAttribute('tabindex', '0');
    await expect(page.locator('#nmbot-feature-panel-group')).toBeHidden();
    await expect(page.locator('#nmbot-feature-panel-channel')).toBeVisible();
  });

  test('shows every feature panel in desktop columns', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'The column layout starts at 1020px.');

    for (const chatType of ['group', 'channel', 'private']) {
      await expect(page.locator(`#nmbot-feature-panel-${chatType}`)).toBeVisible();
    }
  });
});
