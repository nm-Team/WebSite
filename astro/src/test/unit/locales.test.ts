import { describe, expect, it } from 'vitest';

import { normalizeLocale } from '@/i18n/locales';

describe('normalizeLocale', () => {
  it('normalizes legacy locales', () => {
    expect(normalizeLocale('zh_CN')).toBe('zh-CN');
    expect(normalizeLocale('zh_HK')).toBe('zh-HK');
    expect(normalizeLocale('hu_MA')).toBe('zh-x-mars');
  });

  it('normalizes browser-like locales', () => {
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale('ja')).toBe('ja-JP');
    expect(normalizeLocale('zh')).toBe('zh-CN');
  });

  it('returns empty for unknown locale', () => {
    expect(normalizeLocale('xx-YY')).toBe('');
  });
});
