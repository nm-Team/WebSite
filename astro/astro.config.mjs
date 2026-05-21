import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nmteam.xyz',
  output: 'static',
  trailingSlash: 'ignore',
  redirects: {
    '/blackboard/questionnaire': '/questionnaire-ended/',
    '/blackboard/questionnaire/[...slug]': '/questionnaire-ended/',
    '/blackboard/support_doc_search/search.php': '/questionnaire-ended/',
  },
  integrations: [sitemap()],
});
