import { describe, expect, it } from 'vitest';

import { buildSeoMeta } from '@/utils/seo';

describe('SEO metadata', () => {
  it('uses the new main-site domain without rewriting service domains', () => {
    const meta = buildSeoMeta({
      locale: 'en',
      currentUrl: 'https://nm.team/en/',
    });

    expect(meta.jsonLd).toContain('"@id":"https://nm.team"');
    expect(meta.jsonLd).not.toContain('https://nmteam.xyz');
    expect(meta.jsonLd).toContain('https://newsroom.nmteam.xyz');
    expect(meta.jsonLd).toContain('https://support.nmteam.xyz');
    expect(meta.image).toBe('https://websiteres.nmteam.xyz/producticon/nmTeam/logo@128.png');
  });
});
