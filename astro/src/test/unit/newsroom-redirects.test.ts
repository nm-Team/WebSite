import { describe, expect, it } from 'vitest';

import articleAliases from '@/data/newsroom/legacy-paths.json';

import legacyApi from '../../../deployment/newsroom-legacy/_worker.js';
import { buildLegacyNewsroomMap } from '../../../integrations/newsroom-compatibility';

describe('Newsroom migration redirects', () => {
  const map = buildLegacyNewsroomMap(['zh-CN/newsroom/', 'zh-CN/newsroom/tag/nmBot/', 'zh-CN/newsroom/search/', 'zh-CN/newsroom/2026/06/'], ['2026/06/photo.png']);
  it('retains every imported article alias and maps images without symlinks', () => {
    for (const [source, target] of Object.entries(articleAliases)) expect(map[source]).toBe(target);
    expect(map['/usr/uploads/2026/06/photo.png']).toBe('/newsroom/uploads/2026/06/photo.png');
    expect(map['/uploads/2026/06/photo.png']).toBe('/newsroom/uploads/2026/06/photo.png');
    expect(map['/tag/nmBot/']).toBe('/zh-CN/newsroom/tag/nmBot/');
    expect(map['/search']).toBe('/zh-CN/newsroom/search/');
    expect(map['/special/website.html/']).toBe('/zh-CN/');
    expect(map['/']).toBe('/zh-CN/newsroom/');
  });
  it('preserves API query parameters and cross-origin access on the old host', () => {
    const response = legacyApi.fetch(new Request('https://newsroom.nmteam.xyz/api/posts?showContent=false&pageSize=5'));
    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('https://nm.team/newsroom/api/posts?showContent=false&pageSize=5');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(legacyApi.fetch(new Request('https://newsroom.nmteam.xyz/api/posts', { method: 'OPTIONS' })).status).toBe(204);
  });
});
