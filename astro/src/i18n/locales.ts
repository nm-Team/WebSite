export const publicLocales = ['en', 'zh-CN', 'zh-HK', 'ja-JP', 'zh-x-mars'] as const;

export type PublicLocale = (typeof publicLocales)[number];

export type LegacyLocale = 'en_US' | 'zh_CN' | 'zh_HK' | 'ja_JP' | 'hu_MA';

export const defaultLocale: PublicLocale = 'en';

export const localeDataMap: Record<PublicLocale, LegacyLocale> = {
  en: 'en_US',
  'zh-CN': 'zh_CN',
  'zh-HK': 'zh_HK',
  'ja-JP': 'ja_JP',
  'zh-x-mars': 'hu_MA',
};

export const legacyLocaleNames: Record<LegacyLocale, string> = {
  zh_CN: '中文（简体）',
  zh_HK: '中文（繁体）',
  en_US: 'English',
  ja_JP: '日本語',
  hu_MA: '焱暒妏',
};

const aliases: Record<string, PublicLocale> = {
  en_US: 'en',
  en: 'en',
  zh_CN: 'zh-CN',
  'zh-CN': 'zh-CN',
  zh_HK: 'zh-HK',
  'zh-HK': 'zh-HK',
  ja_JP: 'ja-JP',
  'ja-JP': 'ja-JP',
  hu_MA: 'zh-x-mars',
  'zh-x-mars': 'zh-x-mars',
};

export function isPublicLocale(value: string): value is PublicLocale {
  return publicLocales.includes(value as PublicLocale);
}

export function normalizeLocale(value?: string | null): PublicLocale | '' {
  if (!value) {
    return '';
  }

  const direct = aliases[value];
  if (direct) {
    return direct;
  }

  const swapped = aliases[value.replace('-', '_')];
  if (swapped) {
    return swapped;
  }

  const lower = value.toLowerCase();
  if (lower.startsWith('zh-hk')) {
    return 'zh-HK';
  }
  if (lower.startsWith('zh')) {
    return 'zh-CN';
  }
  if (lower.startsWith('ja')) {
    return 'ja-JP';
  }
  if (lower.startsWith('en')) {
    return 'en';
  }

  return '';
}
