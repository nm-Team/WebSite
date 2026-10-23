import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import newsroomCompatibility from './integrations/newsroom-compatibility';
import { newsroomArticleLinks } from './src/lib/newsroom/article-links';

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
  // Newsroom publishes only actual translations in the canonical /sitemap.xml.
  integrations: [sitemap({ filter: (url) => !new URL(url).pathname.includes('/newsroom') }), newsroomCompatibility()],
});
