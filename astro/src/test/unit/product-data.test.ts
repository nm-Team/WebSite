import { describe, expect, it } from 'vitest';

import { getProductDetail, getProductOverview } from '@/data/products/loader';
import { getSponsorData } from '@/data/sponsor';

describe('phase 3 product and sponsor data', () => {
  it('loads product cards in legacy order with preserved labels and links', () => {
    const overview = getProductOverview('en');

    expect(overview.products).toHaveLength(2);
    expect(overview.products.map((product) => product.name)).toEqual(['nmBot', 'StartPage']);
    expect(overview.products.map((product) => product.intro)).toEqual(['nm boost chat.', 'Good day from StartPage.']);
    expect(overview.products[0]?.buttons.map((button) => [button.name, button.href])).toEqual([
      ['Learn more', '/products/overview/nmBot-Telegram'],
      ['Get started', 'https://t.me/nmnmfunbot'],
    ]);
    expect(overview.products[1]?.buttons.map((button) => [button.name, button.href])).toEqual([
      ['Learn more', 'overview/nmBrowser-StartPage'],
      ['Try now', 'https://bs.nmteam.xyz?from=nmTeamProductsPage'],
    ]);
  });

  it('loads generic product detail sections and major media assets from JSON', () => {
    const detail = getProductDetail('zh-CN', 'nmBrowser-StartPage');

    expect(detail.main.map((section) => section.id)).toEqual(['design_draw', 'design_frame', 'usage', 'ab', 'privacy']);
    expect(JSON.stringify(detail)).toContain('https://websiteres.nmteam.xyz/pintroimg/nmBrowser-StartPage/overview.png');
    expect(JSON.stringify(detail)).toContain('https://websiteres.nmteam.xyz/pintroimg/nmBrowser-StartPage/mac.png');
  });

  it('loads valid sponsor data at build time', () => {
    const sponsorData = getSponsorData();

    expect(sponsorData.update).toMatch(/^\d{8}$/);
    expect(sponsorData.sponsor.length).toBeGreaterThan(0);

    for (const sponsor of sponsorData.sponsor) {
      expect(sponsor.name.trim()).not.toBe('');
      expect(sponsor.avatar).toMatch(/^https:\/\//);
      expect(sponsor.amount).toMatch(/^\d+\.\d{2}$/);
    }

    expect(new Set(sponsorData.sponsor.map(({ name }) => name)).size).toBe(sponsorData.sponsor.length);
  });
});
