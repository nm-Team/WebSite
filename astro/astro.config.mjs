import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nmteam.xyz',
  output: 'static',
  compressHTML: true,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
