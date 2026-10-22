import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AstroIntegration } from 'astro';

import articleAliases from '../src/data/newsroom/legacy-paths.json';
import { newsroomOrigin, newsroomPath } from '../src/lib/newsroom/paths';

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(entries.map(async (entry) => entry.isDirectory() ? listFiles(join(directory, entry.name)) : [join(directory, entry.name)]));
  return paths.flat();
}

export function buildLegacyNewsroomMap(pagePaths: readonly string[], assetPaths: readonly string[]): Record<string, string> {
  const redirects = new Map<string, string>();
  const add = (from: string, to: string, page = false) => {
    const key = new URL(from, newsroomOrigin).pathname;
    to = new URL(to, newsroomOrigin).pathname;
    const previous = redirects.get(key);
    if (previous && previous !== to) throw new Error(`Conflicting Newsroom redirect: ${from}`);
    redirects.set(key, to);
    if (page && key !== '/') {
      const alternate = key.endsWith('/') ? key.slice(0, -1) : `${key}/`;
      redirects.set(alternate, to);
    }
  };
  for (const [from, to] of Object.entries(articleAliases)) add(from, to, true);
  const prefix = newsroomPath('zh-CN');
  for (const path of pagePaths) {
    const normalized = `/${path.replace(/^\/+/, '').replace(/\/?$/, '/')}`;
    if (!normalized.startsWith(prefix)) continue;
    const suffix = normalized.slice(prefix.length);
    if (suffix === '' || /^(?:page|category|tag|search)\//.test(suffix) || /^\d{4}\/\d{2}\/$/.test(suffix)) {
      if (suffix !== 'page/1/') add(`/${suffix}`, normalized, true);
    }
  }
  add('/', prefix);
  add('/page/1/', prefix, true);
  add('/special/about/', prefix, true);
  add('/special/about.html', prefix, true);
  add('/special/website/', '/zh-CN/', true);
  add('/special/website.html', '/zh-CN/', true);
  add('/rss.xml', newsroomPath('zh-CN', 'rss.xml'));
  add('/search-data.json', newsroomPath('zh-CN', 'search-data.json'));
  add('/api/posts', '/newsroom/api/posts', true);
  for (const asset of assetPaths) {
    add(`/uploads/${asset}`, `/newsroom/uploads/${asset}`);
    add(`/usr/uploads/${asset}`, `/newsroom/uploads/${asset}`);
  }
  return Object.fromEntries([...redirects].sort(([a], [b]) => a.localeCompare(b)));
}

export default function newsroomCompatibility(): AstroIntegration {
  return {
    name: 'newsroom-compatibility',
    hooks: {
      'astro:build:done': async ({ dir, pages, logger }) => {
        const output = fileURLToPath(dir);
        const uploads = join(output, 'newsroom/uploads');
        const assets = (await listFiles(uploads)).map((path) => relative(uploads, path).replaceAll('\\', '/'));
        const redirects = buildLegacyNewsroomMap(pages.map((page) => page.pathname), assets);
        for (const target of new Set(Object.values(redirects))) {
          const path = join(output, decodeURI(target), target.endsWith('/') ? 'index.html' : '');
          try { await access(path); }
          catch (error) { throw new Error(`Newsroom redirect target was not built: ${target}`, { cause: error }); }
        }
        const mainRules = Object.entries(redirects).filter(([source]) => source.startsWith('/news/') || source.startsWith('/uploads/') || source.startsWith('/usr/uploads/')).map(([source, target]) => `${source} ${target} 301`);
        const existingRules = await readFile(join(output, '_redirects'), 'utf8');
        await writeFile(join(output, '_redirects'), `${mainRules.join('\n')}\n\n${existingRules}`);

        const legacyOutput = fileURLToPath(new URL('../legacy-newsroom-dist/', dir));
        await mkdir(legacyOutput, { recursive: true });
        const legacyRules = Object.entries(redirects).map(([source, target]) => `${source} ${new URL(target, newsroomOrigin).href} 301`);
        if (legacyRules.length > 2000 || legacyRules.some((line) => line.length > 1000)) throw new Error('Newsroom redirects exceed Cloudflare Pages static rule limits');
        await writeFile(join(legacyOutput, '_redirects'), `${legacyRules.join('\n')}\n`);
        await writeFile(join(legacyOutput, 'redirect-manifest.json'), `${JSON.stringify(redirects, null, 2)}\n`);
        for (const name of ['_worker.js', '_routes.json', '404.html', 'robots.txt']) {
          await writeFile(join(legacyOutput, name), await readFile(new URL(`../deployment/newsroom-legacy/${name}`, import.meta.url)));
        }
        logger.info(`Validated ${legacyRules.length} legacy paths, ${assets.length} images; generated legacy-newsroom-dist`);
      },
    },
  };
}
