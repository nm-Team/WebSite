import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { type LegacyLocale, localeDataMap, type PublicLocale, publicLocales } from '@/i18n/locales';

import {
  parseProductDetail,
  parseProductOverviewList,
  type ProductDetailData,
  type ProductOverviewList,
} from './schema';

const astroRoot = process.cwd().endsWith('astro') ? process.cwd() : resolve(process.cwd(), 'astro');
const repoRoot = dirname(astroRoot);
const productsRoot = join(repoRoot, 'src', 'json', 'products');

function readJsonFile(filePath: string): unknown {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse product JSON at ${filePath}: ${message}`);
  }
}

export function hasProductOverview(locale: PublicLocale): boolean {
  const legacyLocale = localeDataMap[locale];
  return existsSync(join(productsRoot, legacyLocale, 'overview_list.json'));
}

export function getProductOverview(locale: PublicLocale): ProductOverviewList {
  const legacyLocale = localeDataMap[locale];
  const filePath = join(productsRoot, legacyLocale, 'overview_list.json');
  if (!existsSync(filePath)) {
    throw new Error(`Product overview data is unavailable for locale ${locale} (${legacyLocale}).`);
  }
  return parseProductOverviewList(readJsonFile(filePath), { locale: legacyLocale, filePath });
}

export function hasProductDetail(locale: PublicLocale, slug: string): boolean {
  const legacyLocale = localeDataMap[locale];
  return existsSync(join(productsRoot, legacyLocale, `${slug}.json`));
}

export function getProductDetail(locale: PublicLocale, slug: string): ProductDetailData {
  const legacyLocale = localeDataMap[locale];
  const filePath = join(productsRoot, legacyLocale, `${slug}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Product detail data is unavailable for ${slug} in locale ${locale} (${legacyLocale}).`);
  }
  return parseProductDetail(readJsonFile(filePath), { locale: legacyLocale, slug, filePath });
}

export function getGenericProductSlugs(): string[] {
  const slugs = new Set<string>();
  for (const legacyLocale of Object.values(localeDataMap) as LegacyLocale[]) {
    const localeDir = join(productsRoot, legacyLocale);
    if (!existsSync(localeDir)) {
      continue;
    }
    for (const entry of readdirSync(localeDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.json') || entry.name === 'overview_list.json') {
        continue;
      }
      const slug = entry.name.slice(0, -'.json'.length);
      if (slug !== 'nmBot-Telegram') {
        slugs.add(slug);
      }
    }
  }
  return [...slugs].sort();
}

export function getProductDetailLocales(slug: string): PublicLocale[] {
  return publicLocales.filter((locale) => hasProductDetail(locale, slug));
}
