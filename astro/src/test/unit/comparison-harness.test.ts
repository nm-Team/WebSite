import { describe, expect, it } from 'vitest';

import { enumerateComparableRoutes } from '@/test/route-manifest';

const phpBase = process.env.PHP_BASE_URL;
const astroBase = process.env.ASTRO_BASE_URL;

describe('php vs astro baseline harness', () => {
  it('enumerates phase 2 routes for root and localized comparisons', () => {
    const routes = enumerateComparableRoutes();

    expect(routes).toContain('/aboutus/');
    expect(routes).toContain('/cookies/');
    expect(routes).toContain('/business-cooperation/');
    expect(routes).toContain('/legal/privacy-policy/');
    expect(routes).toContain('/legal/network-service-protocol/');
    expect(routes).toContain('/support/');
    expect(routes).toContain('/status/');
    expect(routes).toContain('/zh-CN/aboutus/');
    expect(routes).toContain('/ja-JP/legal/privacy-policy/');
  });

  it.skipIf(!phpBase || !astroBase)('fetches phase 2 routes from both servers', async () => {
    const routes = [
      '/aboutus/',
      '/cookies/',
      '/business-cooperation/',
      '/legal/privacy-policy/',
      '/legal/network-service-protocol/',
      '/support/',
      '/status/',
    ];
    for (const route of routes) {
      const [phpRes, astroRes] = await Promise.all([
        fetch(`${phpBase}${route}`),
        fetch(`${astroBase}${route}`),
      ]);

      expect(phpRes.status).toBeLessThan(500);
      expect(astroRes.status).toBeLessThan(500);
    }
  });
});
