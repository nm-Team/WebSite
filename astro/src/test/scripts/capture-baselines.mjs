import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { chromium } from '@playwright/test';

const outputRoot = path.resolve('src/test/visual-baselines');
const sources = [
  { name: 'php', baseUrl: 'http://127.0.0.1:8080' },
  { name: 'astro', baseUrl: 'http://127.0.0.1:4321' },
];

const routes = [
  { slug: [], phpPath: '/' },
  { slug: ['aboutus'], phpPath: '/aboutus/' },
  { slug: ['cookies'], phpPath: '/cookies/' },
  { slug: ['business-cooperation'], phpPath: '/business-cooperation/' },
  { slug: ['legal', 'privacy-policy'], phpPath: '/legal/privacy-policy/' },
  { slug: ['legal', 'network-service-protocol'], phpPath: '/legal/network-service-protocol/' },
  { slug: ['support'], phpPath: '/support/' },
  { slug: ['status'], phpPath: '/status.php' },
  { slug: ['supportus'], phpPath: '/supportus/' },
  { slug: ['products'], phpPath: '/products/' },
  { slug: ['products', 'overview', 'nmBot-Telegram'], phpPath: '/products/overview/nmBot-Telegram/' },
];

const localeMap = {
  en: 'en_US',
  'zh-CN': 'zh_CN',
  'zh-HK': 'zh_HK',
  'ja-JP': 'ja_JP',
  'zh-x-mars': 'hu_MA',
};

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
];
const routeFilter = process.env.CAPTURE_ROUTE ?? '';
const sourceFilter = process.env.CAPTURE_SOURCE ?? '';

function slugName(slug) {
  if (slug.length === 0) {
    return 'home';
  }
  return slug.join('__');
}

function buildSourceUrl(sourceName, locale, route) {
  const { slug, phpPath } = route;
  if (sourceName === 'php') {
    const legacyLocale = localeMap[locale];
    const url = new URL(phpPath, 'http://127.0.0.1:8080');
    url.searchParams.set('lan', legacyLocale);
    return url.toString();
  }

  const prefixedPath = slug.length === 0 ? `/${locale}/` : `/${locale}/${slug.join('/')}/`;
  return new URL(prefixedPath, 'http://127.0.0.1:4321').toString();
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function captureSource(source, jsEnabled) {
  if (sourceFilter && source.name !== sourceFilter) {
    return;
  }

  const browser = await chromium.launch();
  try {
    for (const locale of Object.keys(localeMap)) {
      for (const route of routes) {
        const { slug } = route;
        const routeName = slugName(slug);
        if (routeFilter && routeName !== routeFilter) {
          continue;
        }
        const url = buildSourceUrl(source.name, locale, route);

        for (const viewport of viewports) {
          const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            javaScriptEnabled: jsEnabled,
          });
          if (jsEnabled) {
            await context.addInitScript(() => {
              window.localStorage.setItem('cookieTipv0Checked', 'true');
              window.localStorage.cookieTipv0Checked = 'true';
            });
          }

          try {
            const page = await context.newPage();
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
            await page.waitForTimeout(800);

            const outputDir = path.join(
              outputRoot,
              source.name,
              jsEnabled ? 'js-enabled' : 'js-disabled',
              locale,
              routeName,
            );
            await ensureDir(outputDir);

            const pngPath = path.join(outputDir, `${viewport.name}.png`);
            const htmlPath = path.join(outputDir, `${viewport.name}.html`);

            await page.screenshot({ path: pngPath, fullPage: true });
            const html = await page.content();
            await fs.writeFile(htmlPath, html, 'utf8');

            console.log(`[captured] ${source.name} ${locale} ${routeName} ${viewport.name} js=${jsEnabled}`);
          } catch (error) {
            console.error(`[failed] ${source.name} ${locale} ${routeName} ${viewport.name} js=${jsEnabled}`);
            console.error(error);
          } finally {
            await context.close();
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
}

export async function runCapture(mode = 'js-enabled') {
  const jsEnabled = mode !== 'js-disabled';

  for (const source of sources) {
    await captureSource(source, jsEnabled);
  }

  console.log(`Capture finished for mode=${mode}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode = process.argv[2] ?? 'js-enabled';
  await runCapture(mode);
}
