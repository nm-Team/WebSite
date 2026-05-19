import { describe, expect, it } from 'vitest';

import { routeManifest, toPrefixedPath, toRootPath } from '@/i18n/routes';

describe('route manifest', () => {
  it('contains unique root paths', () => {
    const all = routeManifest.map((entry) => toRootPath(entry.slug));
    expect(new Set(all).size).toBe(all.length);
  });

  it('builds prefixed locale paths', () => {
    expect(toPrefixedPath('zh-CN', ['aboutus'])).toBe('/zh-CN/aboutus/');
    expect(toPrefixedPath('en', [])).toBe('/en/');
  });
});
