import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nmteam.xyz',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
