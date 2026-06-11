import { describe, expect, it } from 'vitest';

import { localizeHtmlHrefs, removeLocalePrefix, toLocalizedHref } from '@/i18n/links';

describe('localized links', () => {
  it('prefixes root-relative internal links with the current locale', () => {
    expect(toLocalizedHref('zh-CN', '/aboutus')).toBe('/zh-CN/aboutus');
    expect(toLocalizedHref('zh-CN', '/products/?ref=footer#top')).toBe('/zh-CN/products/?ref=footer#top');
    expect(toLocalizedHref('zh-CN', '/')).toBe('/zh-CN/');
  });

  it('keeps external, already-prefixed, and non-navigation hrefs unchanged', () => {
    expect(toLocalizedHref('zh-CN', 'https://support.nmteam.xyz')).toBe('https://support.nmteam.xyz');
    expect(toLocalizedHref('zh-CN', '//cdn.example.com/file.css')).toBe('//cdn.example.com/file.css');
    expect(toLocalizedHref('zh-CN', '/en/aboutus')).toBe('/en/aboutus');
    expect(toLocalizedHref('zh-CN', 'mailto:support@nmteam.xyz')).toBe('mailto:support@nmteam.xyz');
  });

  it('localizes trusted translated html href attributes', () => {
    expect(localizeHtmlHrefs('zh-CN', `Read <a href="/legal/privacy-policy">policy</a>.`)).toBe(
      `Read <a href="/zh-CN/legal/privacy-policy">policy</a>.`,
    );
  });

  it('removes an existing locale prefix from local paths', () => {
    expect(removeLocalePrefix('/en/aboutus/')).toBe('/aboutus/');
    expect(removeLocalePrefix('/zh-CN/')).toBe('/');
    expect(removeLocalePrefix('/aboutus/')).toBe('/aboutus/');
  });
});
