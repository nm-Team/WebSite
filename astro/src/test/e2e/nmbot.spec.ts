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

  test('keeps the product header geometry stable across viewport heights', async ({ page }) => {
    for (const height of [178, 315, 800]) {
      await page.setViewportSize({ width: 798, height });
      await page.evaluate(() => window.scrollTo(0, window.innerHeight + 10));

      const productHeader = page.locator('#pageHeader .product-header');
      await expect(productHeader).toHaveAttribute('data-hide', 'false');

      await expect.poll(() => productHeader.evaluate((element) => {
        const headerRect = element.parentElement?.getBoundingClientRect();
        if (!headerRect) return false;

        const productRect = element.getBoundingClientRect();
        const headerCenter = (headerRect.top + headerRect.bottom) / 2;
        const productCenter = (productRect.top + productRect.bottom) / 2;
        return Math.abs(headerCenter - productCenter) < 1;
      })).toBe(true);

      const insets = await productHeader.evaluate((element) => {
        const inner = element.querySelector<HTMLElement>('.product-header-inner');
        const productName = element.querySelector<HTMLElement>('.product-name');
        const actionButton = element.querySelector<HTMLElement>('.action-button');
        if (!inner || !productName || !actionButton) throw new Error('Missing nmBot product header content');

        const outerRect = element.getBoundingClientRect();
        const innerRect = inner.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          expectedPadding: outerRect.width * 0.1,
          paddingLeft: Number.parseFloat(style.paddingLeft),
          paddingRight: Number.parseFloat(style.paddingRight),
          leftInset: innerRect.left - outerRect.left,
          rightInset: outerRect.right - innerRect.right,
          innerTop: innerRect.top,
          innerBottom: innerRect.bottom,
          outerTop: outerRect.top,
          outerBottom: outerRect.bottom,
          productNameFontSize: Number.parseFloat(getComputedStyle(productName).fontSize),
          actionButtonFontSize: Number.parseFloat(getComputedStyle(actionButton).fontSize),
        };
      });

      expect(insets.paddingLeft).toBeCloseTo(insets.expectedPadding, 0);
      expect(insets.paddingRight).toBeCloseTo(insets.expectedPadding, 0);
      expect(insets.leftInset).toBeCloseTo(insets.expectedPadding, 0);
      expect(insets.rightInset).toBeCloseTo(insets.expectedPadding, 0);
      expect(insets.innerTop).toBeGreaterThanOrEqual(insets.outerTop);
      expect(insets.innerBottom).toBeLessThanOrEqual(insets.outerBottom);
      expect(insets.productNameFontSize).toBe(20);
      expect(insets.actionButtonFontSize).toBe(14);
    }
  });
});
