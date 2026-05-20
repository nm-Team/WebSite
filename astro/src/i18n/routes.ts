import { getGenericProductSlugs, getProductDetailLocales } from '@/data/products/loader';
import { getSponsorData } from '@/data/sponsor';
import type { PublicLocale } from '@/i18n/locales';
import { publicLocales } from '@/i18n/locales';

export type RouteEntry = {
  id: string;
  slug: string[];
  kind: 'static-page' | 'listing-page' | 'generic-product-page' | 'custom-product-page' | 'redirect-page';
  sourcePhpPath: string;
  productSlug?: string;
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
    pageUpdate: getSponsorData().update,
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'legal-privacy-policy',
    slug: ['legal', 'privacy-policy'],
    kind: 'static-page',
    sourcePhpPath: '/legal/privacy-policy.php',
    pageTitle: 'legal.pp',
    pageKeywords: '',
    pageDescription: 'legal.description',
    pageHeadCss: [],
    pageHeadJs: [],
    pageBodyJs: ['/src/js/tab.js'],
    pageImage: '',
    pageUpdate: '20220303',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'legal-network-service-protocol',
    slug: ['legal', 'network-service-protocol'],
    kind: 'static-page',
    sourcePhpPath: '/legal/network-service-protocol.php',
    pageTitle: 'legal.nsp',
    pageKeywords: '',
    pageDescription: 'legal.description',
    pageHeadCss: [],
    pageHeadJs: [],
    pageBodyJs: ['/src/js/tab.js'],
    pageImage: '',
    pageUpdate: '20220303',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'support',
    slug: ['support'],
    kind: 'redirect-page',
    sourcePhpPath: '/support/index.php',
    pageTitle: 'support.title',
    pageKeywords: '',
    pageDescription: 'support.description',
    pageHeadCss: [],
    pageHeadJs: [],
    pageBodyJs: ['/src/js/tab.js'],
    pageImage: '',
    pageUpdate: '20240718',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  {
    id: 'status',
    slug: ['status'],
    kind: 'redirect-page',
    sourcePhpPath: '/status.php',
    pageTitle: 'status_page.title',
    pageKeywords: '系统状态,status,service,服务状态,SLA',
    pageDescription: 'status_page.description',
    pageHeadCss: [],
    pageHeadJs: [],
    pageBodyJs: [],
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
    pageBodyJs: [],
    pageImage: '',
    pageUpdate: '',
    supportedLocales: publicLocales,
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  },
  ...getGenericProductSlugs().map((productSlug): RouteEntry => ({
    id: `products-overview-${productSlug}`,
    slug: ['products', 'overview', productSlug],
    kind: 'generic-product-page',
    sourcePhpPath: '/products/overview.php',
    productSlug,
    pageTitle: 'products.title',
    pageKeywords: '',
    pageDescription: 'products.description',
    pageHeadCss: ['/src/css/products.css', '/src/css/products_detail.css'],
    pageHeadJs: [],
    pageBodyJs: [],
    pageImage: '',
    pageUpdate: '',
    supportedLocales: getProductDetailLocales(productSlug),
    renderMode: 'static',
    expectedRedirect: 'root-may-redirect',
  })),
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
