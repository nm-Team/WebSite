import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from '@playwright/test';

const redirects = JSON.parse(readFileSync(resolve('legacy-newsroom-dist/redirect-manifest.json'), 'utf8')) as Record<string, string>;
const query = '?utm_source=legacy-test&q=nmBot%20NEXT';
const legacyURL = process.env.NEWSROOM_LEGACY_URL;

for (const [source, canonical] of Object.entries(redirects)) {
  test(`prefixed legacy URL ${source}`, async ({ request, baseURL }) => {
    const incoming = new URL(`/newsroom${source}${query}`, baseURL);
    const expected = new URL(`${source === '/' ? '/en/newsroom/' : canonical}${query}`, baseURL);
    if (legacyURL) {
      const oldURL = new URL(`${source}${query}`, legacyURL);
      const forwarded = await request.get(oldURL.href, { maxRedirects: 0 });
      expect(forwarded.status()).toBe(301);
      expect(new URL(forwarded.headers().location, oldURL).href).toBe(incoming.href);
    }
    const response = await request.get(incoming.href, { maxRedirects: 0 });
    if (incoming.pathname === expected.pathname) {
      expect(response.status()).toBe(200);
    } else {
      expect(response.status()).toBe(301);
      expect(new URL(response.headers().location, incoming).href).toBe(expected.href);
      expect((await request.get(expected.href, { maxRedirects: 0 })).status()).toBe(200);
    }
  });
}

test('the compatibility API remains readable across origins', async ({ request }) => {
  const response = await request.get('/newsroom/api/posts', { headers: { Origin: 'https://example.org' }, maxRedirects: 0 });
  expect(response.status()).toBe(200);
  expect(response.headers()['access-control-allow-origin']).toBe('*');
  expect(response.headers()['content-type']).toContain('application/json');
  const body = await response.json();
  expect(body.status).toBe(200);
  expect(body.data).toHaveLength(5);
});

test('unknown legacy URLs retain a 404 response', async ({ request }) => {
  for (const path of ['/newsroom/news/not-a-published-article.html', '/newsroom/category/not-a-category/', '/newsroom/uploads/not-an-image.png']) {
    expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(404);
  }
});
