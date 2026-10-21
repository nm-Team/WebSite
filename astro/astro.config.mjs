import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import { newsroomArticleLinks } from './src/lib/newsroom/article-links';

export default defineConfig({
  site: 'https://nm.team',
  output: 'static',
  compressHTML: true,
  trailingSlash: 'ignore',
  markdown: { processor: satteri({ hastPlugins: [newsroomArticleLinks] }) },
  integrations: [sitemap()],
});
