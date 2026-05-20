import type { PublicLocale } from '@/i18n/locales';
import { t } from '@/i18n/translate';

export const DEFAULT_SITE_IMAGE = 'https://websiteres.nmteam.xyz/producticon/nmTeam/logo@128.png';
export const SITE_URL = 'https://nmteam.xyz/';

export type SeoInput = {
  locale: PublicLocale;
  pageTitleKey?: string;
  pageTitle?: string;
  pageKeywordsKey?: string;
  pageKeywords?: string;
  pageDescriptionKey?: string;
  pageDescription?: string;
  image?: string;
  currentUrl: string;
};

export type SeoMeta = {
  title: string;
  keywords: string;
  description: string;
  image: string;
  language: string;
  jsonLd: string;
};

function translateOptional(locale: PublicLocale, keyOrValue?: string): string {
  if (!keyOrValue) {
    return '';
  }

  return t(locale, keyOrValue);
}

function resolveTitle(locale: PublicLocale, pageTitleKey?: string, pageTitle?: string): string {
  const pageTitleText = pageTitleKey ? translateOptional(locale, pageTitleKey) : (pageTitle ?? '');
  const suffix = `nmTeam - ${t(locale, 'pagebases.official_website')}`;

  return pageTitleText ? `${pageTitleText} - ${suffix}` : suffix;
}

export function buildSeoMeta(input: SeoInput): SeoMeta {
  const language = input.locale;
  const title = resolveTitle(language, input.pageTitleKey, input.pageTitle);
  const keywords = `nmTeam,nm,纳米团队,柠檬团队,纳米人,nmer,${translateOptional(
    language,
    input.pageKeywordsKey ?? input.pageKeywords,
  )}`;
  const description = `${translateOptional(language, input.pageDescriptionKey ?? input.pageDescription)}  ${t(
    language,
    'pagebases.site_intro',
  )}`;
  const image = input.image || DEFAULT_SITE_IMAGE;

  const graph = [
    {
      '@type': 'Organization',
      '@id': 'https://nmteam.xyz',
      name: 'nmTeam',
      alternateName: ['柠檬团队', '纳米团队'],
      url: SITE_URL,
      sameAs: ['https://x.com/nmnmfun', 'https://t.me/nmteamnewsroom', 'https://github.com/nm-Team'],
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://websiteres.nmteam.xyz/producticon/nmTeam/logo@256.png',
        inLanguage: language,
        url: image,
        width: 256,
        height: 256,
        caption: 'nmTeam',
      },
      image: {
        '@id': 'https://websiteres.nmteam.xyz/producticon/nmTeam/logo@256.png',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://nmteam.xyz/#website',
      url: SITE_URL,
      name: `nmTeam ${t(language, 'pagebases.official_website')}`,
      description,
      publisher: {
        '@id': 'https://nmteam.xyz/aboutus',
      },
      inLanguage: language,
    },
    {
      '@type': 'ItemList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, url: 'https://nmteam.xyz/products/overview/nmBot-Telegram', name: t(language, 'schema.nmbot_intro') },
        { '@type': 'ListItem', position: 2, url: 'https://newsroom.nmteam.xyz', name: 'nmTeam Newsroom' },
        { '@type': 'ListItem', position: 3, url: 'https://nmbot.nmnm.fun', name: t(language, 'schema.nmbot_panel') },
        { '@type': 'ListItem', position: 4, url: 'https://nmteam.xyz/products', name: t(language, 'schema.products') },
        { '@type': 'ListItem', position: 5, url: 'https://support.nmteam.xyz', name: t(language, 'schema.nmteam_support') },
      ],
    },
    {
      '@type': 'WebPage',
      '@id': 'https://nmteam.xyz/products/overview/nmBot-Telegram',
      url: 'https://nmteam.xyz/products/overview/nmBot-Telegram',
      name: t(language, 'schema.nmbot_intro'),
      datePublished: '2024-08-20T16:00:00.000Z',
      dateModified: '2024-08-20T16:00:00.000Z',
      description: t(language, 'schema.nmbot_intro_description'),
      inLanguage: language,
      author: 'nmTeam',
    },
    {
      '@type': 'WebPage',
      '@id': 'https://newsroom.nmteam.xyz',
      url: 'https://newsroom.nmteam.xyz',
      name: 'nmTeam Newsroom',
      datePublished: '2024-08-20T16:00:00.000Z',
      dateModified: '2024-08-20T16:00:00.000Z',
      description: t(language, 'schema.newsroom_description'),
      inLanguage: language,
      author: 'nmTeam',
    },
    {
      '@type': 'WebPage',
      '@id': 'https://nmbot.nmnm.fun',
      url: 'https://nmbot.nmnm.fun',
      name: t(language, 'schema.nmbot_panel'),
      datePublished: '2024-08-20T16:00:00.000Z',
      dateModified: '2024-08-20T16:00:00.000Z',
      description: t(language, 'schema.nmbot_panel_description'),
      inLanguage: language,
      author: 'nmTeam',
    },
    {
      '@type': 'WebPage',
      '@id': 'https://nmteam.xyz/products',
      url: 'https://nmteam.xyz/products',
      name: t(language, 'schema.products'),
      datePublished: '2024-08-20T16:00:00.000Z',
      dateModified: '2024-08-20T16:00:00.000Z',
      description: t(language, 'schema.products_description'),
      inLanguage: language,
      author: 'nmTeam',
    },
    {
      '@type': 'WebPage',
      '@id': 'https://support.nmteam.xyz',
      url: 'https://support.nmteam.xyz',
      name: t(language, 'schema.nmteam_support'),
      datePublished: '2024-08-20T16:00:00.000Z',
      dateModified: '2024-08-20T16:00:00.000Z',
      description: t(language, 'schema.nmteam_support_description'),
      inLanguage: language,
      author: 'nmTeam',
    },
  ];

  return {
    title,
    keywords,
    description,
    image,
    language,
    jsonLd: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
  };
}
