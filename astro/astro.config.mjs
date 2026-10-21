import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import newsroomCompatibility from './integrations/newsroom-compatibility';
import { newsroomArticleLinks } from './src/lib/newsroom/article-links';
import { isIndexableNewsroomPath } from './src/lib/newsroom/paths';

export default defineConfig({
  site: 'https://nm.team',
  output: 'static',
  compressHTML: true,
  trailingSlash: 'ignore',
  markdown: { processor: satteri({ hastPlugins: [newsroomArticleLinks] }) },
  redirects: {
    '/newsroom/': '/en/newsroom/',
    '/en/newsroom/page/1/': '/en/newsroom/',
    '/zh-CN/newsroom/page/1/': '/zh-CN/newsroom/',
  },
  integrations: [sitemap({ filter: (url) => !new URL(url).pathname.includes('/newsroom') || isIndexableNewsroomPath(new URL(url).pathname) }), newsroomCompatibility()],
});
