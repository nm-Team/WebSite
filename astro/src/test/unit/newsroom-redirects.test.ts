import { describe, expect, it } from 'vitest';

import articleAliases from '@/data/newsroom/legacy-paths.json';

import legacyApi from '../../../deployment/newsroom-legacy/_worker.js';
import { buildLegacyNewsroomMap, buildMainNewsroomMap } from '../../../integrations/newsroom-compatibility';

describe('Newsroom migration redirects', () => {
  const map = buildLegacyNewsroomMap(['zh-CN/newsroom/', 'zh-CN/newsroom/tag/nmBot/', 'zh-CN/newsroom/search/', 'zh-CN/newsroom/2026/06/'], ['2026/06/photo.png']);
  it('retains every imported article alias and maps images without symlinks', () => {
    for (const [source, target] of Object.entries(articleAliases)) expect(map[source]).toBe(target);
    expect(map['/usr/uploads/2026/06/photo.png']).toBe('/newsroom/uploads/2026/06/photo.png');
    expect(map['/uploads/2026/06/photo.png']).toBe('/newsroom/uploads/2026/06/photo.png');
    expect(map['/tag/nmBot/']).toBe('/zh-CN/newsroom/tag/nmBot/');
    expect(map['/search']).toBe('/zh-CN/newsroom/search/');
    expect(map['/special/website.html/']).toBe('/zh-CN/');
    expect(map['/special/about/']).toBe('/zh-CN/newsroom/');
    expect(map['/special/about.html/']).toBe('/zh-CN/newsroom/');
    expect(map['/']).toBe('/zh-CN/newsroom/');
    expect(map['/sitemap.xml']).toBe('/sitemap.xml');
  });
  it('accepts prefixed legacy URLs without redirecting existing API and upload assets to themselves', () => {
    const main = buildMainNewsroomMap(map);
    for (const [source, target] of Object.entries(map)) {
      const prefixed = `/newsroom${source}`;
      if (source === '/' || prefixed === target) expect(main[prefixed]).toBeUndefined();
      else expect(main[prefixed]).toBe(target);
    }
    expect(main['/newsroom/news/1-welcome-2021-08-09.html']).toBe('/zh-CN/newsroom/welcome-2021-08-09/');
    expect(main['/newsroom/api/posts/']).toBe('/newsroom/api/posts');
    expect(main['/newsroom/usr/uploads/2026/06/photo.png']).toBe('/newsroom/uploads/2026/06/photo.png');
    expect(main['/newsroom/search']).toBe('/zh-CN/newsroom/search/');
    expect(main['/newsroom/favicon.ico']).toBe('/favicon.ico');
    expect(main['/newsroom/robots.txt']).toBe('/robots.txt');
    expect(main['/newsroom/sitemap.xml']).toBe('/sitemap.xml');
    expect(main['/newsroom/sitemap-index.xml']).toBe('/sitemap.xml');
    expect(main['/newsroom/sitemap-0.xml']).toBe('/sitemap.xml');
    expect(main['/newsroom/unknown-article/']).toBeUndefined();
  });
  it('preserves API query parameters and cross-origin access on the old host', () => {
    const response = legacyApi.fetch(new Request('https://newsroom.nmteam.xyz/api/posts?showContent=false&pageSize=5'));
    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('https://nm.team/newsroom/api/posts?showContent=false&pageSize=5');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(legacyApi.fetch(new Request('https://newsroom.nmteam.xyz/api/posts', { method: 'OPTIONS' })).status).toBe(204);
  });
});
