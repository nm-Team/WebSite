import type { PublicLocale } from '@/i18n/locales';
import { publicLocales } from '@/i18n/locales';

export type RouteEntry = {
  id: string;
  slug: string[];
  kind: 'static-page' | 'listing-page' | 'custom-product-page';
  sourcePhpPath: string;
  pageTitle?: string;
  pageKeywords?: string;
  pageDescription?: string;
  pageHeadCss: readonly string[];
  pageHeadJs: readonly string[];
  pageBodyJs: readonly string[];
  pageImage?: string;
  pageUpdate?: string;
  supportedLocales: readonly PublicLocale[];
  renderMode: 'static' | 'dynamic';
  expectedRedirect: 'root-may-redirect' | 'prefixed-no-redirect';
};

export const routeManifest: RouteEntry[] = [
  {
    id: 'home',
    slug: [],
    kind: 'static-page',
    sourcePhpPath: '/index.php',
    pageTitle: '',
    pageKeywords: 'nmTeam,主页,首页,Homepage',
    pageDescription: 'nmTeam HomePage',
    pageHeadCss: ['/src/css/index.css'],
    pageHeadJs: [],
    pageBodyJs: ['/src/js/index.js'],
    pageImage: '',
    pageUpdate: '',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'aboutus',
    slug: ['aboutus'],
    kind: 'static-page',
    sourcePhpPath: '/aboutus.php',
    pageTitle: 'about.title',
    pageKeywords: '',
    pageDescription: 'about.description',
    pageHeadCss: [],
    pageHeadJs: [],
    pageBodyJs: [],
    pageImage: '',
    pageUpdate: '20240909',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'cookies',
    slug: ['cookies'],
    kind: 'static-page',
    sourcePhpPath: '/cookies.php',
    pageTitle: 'cookies.title',
    pageKeywords: 'cookies',
    pageDescription: 'cookies.description',
    pageHeadCss: [],
    pageHeadJs: [],
    pageBodyJs: [],
    pageImage: '',
    pageUpdate: '20240908',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'business-cooperation',
    slug: ['business-cooperation'],
    kind: 'static-page',
    sourcePhpPath: '/business_cooperation.php',
    pageTitle: 'business_cooperation.title',
    pageKeywords: '',
    pageDescription: 'business_cooperation.description',
    pageHeadCss: [],
    pageHeadJs: [],
    pageBodyJs: [],
    pageImage: '',
    pageUpdate: '20241212',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'supportus',
    slug: ['supportus'],
    kind: 'static-page',
    sourcePhpPath: '/supportus.php',
    pageTitle: 'supportus.title',
    pageKeywords: '支持nmTeam,support,赞助,sponsor,帮助我们,help',
    pageDescription: 'supportus.description',
    pageHeadCss: [],
    pageHeadJs: [],
    pageBodyJs: ['/src/js/tab.js'],
    pageImage: '',
    pageUpdate: '',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'products',
    slug: ['products'],
    kind: 'listing-page',
    sourcePhpPath: '/products/index.php',
    pageTitle: 'products.title',
    pageKeywords: '',
    pageDescription: 'products.description',
    pageHeadCss: ['/src/css/products.css', '/src/css/products_overview.css'],
    pageHeadJs: [],
    pageBodyJs: ['/src/js/products.js', '/src/js/products_overview.js'],
    pageImage: '',
    pageUpdate: '',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'products-overview-nmbot-telegram',
    slug: ['products', 'overview', 'nmBot-Telegram'],
    kind: 'custom-product-page',
    sourcePhpPath: '/products/template/nmBot-Telegram.php',
    pageTitle: 'products.nmbot_telegram.title',
    pageKeywords:
      'nmBot,Telegram,Telegram Bot,Telegram机器人,Telegram机器人开发,Telegram机器人开发教程,Telegram机器人教程,Telegram机器人API,Telegram机器人教程中文,Telegram机器人API中文',
    pageDescription: 'products.nmbot_telegram.page_description',
    pageHeadCss: ['/src/css/products.css', '/src/css/products_detail.css'],
    pageHeadJs: [],
    pageBodyJs: [],
    pageImage: 'https://websiteres.nmteam.xyz/pintroimg/nmBot-Telegram/v2/website intro seo image.png',
    pageUpdate: '',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
];

export function toPrefixedPath(locale: PublicLocale, slug: string[]): string {
  if (slug.length === 0) {
    return `/${locale}/`;
  }

  return `/${locale}/${slug.join('/')}/`;
}

export function toRootPath(slug: string[]): string {
  if (slug.length === 0) {
    return '/';
  }

  return `/${slug.join('/')}/`;
}
