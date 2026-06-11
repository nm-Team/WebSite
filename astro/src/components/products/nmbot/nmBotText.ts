import enUS from '@/data/locales/en_US.json';
import huMA from '@/data/locales/hu_MA.json';
import jaJP from '@/data/locales/ja_JP.json';
import zhCN from '@/data/locales/zh_CN.json';
import zhHK from '@/data/locales/zh_HK.json';
import { localeDataMap, type PublicLocale } from '@/i18n/locales';

const localeMap = {
  en_US: enUS,
  zh_CN: zhCN,
  zh_HK: zhHK,
  ja_JP: jaJP,
  hu_MA: huMA,
} as const;

export const nmBotAssetBaseUrl = 'https://websiteres.nmteam.xyz/pintroimg/nmBot-Telegram/v2/';

export interface FooterNote {
  id: number;
  html: string;
}

export interface NmBotTextContext {
  footerNotes: FooterNote[];
}

type TranslationTree = Record<string, unknown>;

function deepGet(source: TranslationTree, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (typeof acc !== 'object' || acc === null || !(part in acc)) {
      return undefined;
    }

    return (acc as TranslationTree)[part];
  }, source);
}

function localeTree(locale: PublicLocale): TranslationTree {
  return localeMap[localeDataMap[locale]] as TranslationTree;
}

export function getNmBotValue(locale: PublicLocale, key: string): unknown {
  const localized = deepGet(localeTree(locale), key);
  if (localized !== undefined) {
    return localized;
  }

  return deepGet(localeMap.en_US as TranslationTree, key) ?? deepGet(localeMap.zh_CN as TranslationTree, key);
}

export function getNmBotText(locale: PublicLocale, key: string): string {
  const value = getNmBotValue(locale, key);
  if (typeof value !== 'string') {
    throw new Error(`Expected string translation for ${key}.`);
  }
  return value;
}

export function getNmBotRecord(locale: PublicLocale, key: string): Record<string, string> {
  const value = getNmBotValue(locale, key);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected object translation for ${key}.`);
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
}

export function nmBotAsset(path: string): string {
  return `${nmBotAssetBaseUrl}${path}`;
}

export function renderNmBotText(locale: PublicLocale, key: string, context: NmBotTextContext): string {
  return renderNmBotTextValue(getNmBotText(locale, key), context);
}

export function renderNmBotTextValue(value: string, context: NmBotTextContext): string {
  let text = value.replace(/\[footer:(.*?)\]/g, (_full, note: string) => {
    const id = context.footerNotes.length + 1;
    context.footerNotes.push({ id, html: note });
    return `<sup><a href="#footer-note-${id}" id="footer-note-sup-${id}" class="footer-note-sup">${id}</a></sup>`;
  });

  text = text.replace(/([^<bs>])([，。、：；])/gu, '$1<bs>$2</bs>');

  const wrapPoints = text.split('|');
  if (wrapPoints.length > 1) {
    text = wrapPoints.map((point) => `<nobr>${point}</nobr>`).join('');
  }

  return text;
}

export function stripNmBotHelperMarkup(value: string): string {
  return value
    .replace(/\[footer:.*?\]/g, '')
    .replace(/\|/g, '')
    .replace(/<\/?bs>/g, '')
    .replace(/<\/?nobr>/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
