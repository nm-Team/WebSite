import enUS from '@/data/locales/en_US.json';
import huMA from '@/data/locales/hu_MA.json';
import jaJP from '@/data/locales/ja_JP.json';
import zhCN from '@/data/locales/zh_CN.json';
import zhHK from '@/data/locales/zh_HK.json';
import { defaultLocale, localeDataMap, type PublicLocale } from '@/i18n/locales';

const localeMap = {
  en_US: enUS,
  zh_CN: zhCN,
  zh_HK: zhHK,
  ja_JP: jaJP,
  hu_MA: huMA,
} as const;

type TranslationTree = Record<string, unknown>;

function deepGet(source: TranslationTree, path: string): string | undefined {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (typeof acc !== 'object' || acc === null || !(part in acc)) {
      return undefined;
    }

    return (acc as TranslationTree)[part];
  }, source) as string | undefined;
}

export function t(locale: PublicLocale, key: string): string {
  const primaryLegacy = localeDataMap[locale];
  const primary = localeMap[primaryLegacy] as TranslationTree;
  const en = localeMap.en_US as TranslationTree;
  const zh = localeMap.zh_CN as TranslationTree;

  return deepGet(primary, key) ?? deepGet(en, key) ?? deepGet(zh, key) ?? key;
}

export function getDefaultLocale(): PublicLocale {
  return defaultLocale;
}
