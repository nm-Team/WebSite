import type { APIRoute } from 'astro';

import { getSitemapEntries } from '@/utils/site-map';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = () => {
  const items = getSitemapEntries()
    .map((entry) => `  <url><loc>${escapeXml(entry.url)}</loc></url>`)
    .join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

