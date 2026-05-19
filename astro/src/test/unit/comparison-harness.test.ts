import { describe, expect, it } from 'vitest';

import { enumerateComparableRoutes } from '@/test/route-manifest';

const phpBase = process.env.PHP_BASE_URL;
const astroBase = process.env.ASTRO_BASE_URL;

describe('php vs astro baseline harness', () => {
  it.skipIf(!phpBase || !astroBase)('fetches the same routes from both servers', async () => {
    const routes = enumerateComparableRoutes().slice(0, 5);
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
