import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nm.team',
  output: 'static',
  compressHTML: true,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
