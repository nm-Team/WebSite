import { describe, expect, it } from 'vitest';

import { parseSearchPosts, searchNewsPosts, type SearchPost } from '@/lib/newsroom/search';

const article: SearchPost = { url: '/en/newsroom/example-2026-01-01/', image: '/newsroom/uploads/image.png', title: 'Product update', dateTime: '2026-01-01T00:00:00Z', dateText: 'January 1, 2026', category: 'Update', text: 'A unique detail beyond the short excerpt: accessibility.', tags: ['nmBot+'] };
describe('Newsroom search', () => {
  it('searches the full body, titles, categories and tags with normalized Unicode', () => {
    const posts = parseSearchPosts([article], '/en/newsroom/');
    expect(searchNewsPosts(posts, 'ACCESSIBILITY')).toHaveLength(1);
    expect(searchNewsPosts(posts, 'ｎｍＢｏｔ＋')).toHaveLength(1);
    expect(searchNewsPosts(posts, 'missing')).toHaveLength(0);
    expect(searchNewsPosts(posts, '  ')).toHaveLength(0);
  });
  it('rejects malformed indices and links outside the selected language', () => {
    expect(() => parseSearchPosts({}, '/en/newsroom/')).toThrow();
    expect(() => parseSearchPosts([{ ...article, tags: [1] }], '/en/newsroom/')).toThrow();
    expect(() => parseSearchPosts([{ ...article, url: 'javascript:alert(1)' }], '/en/newsroom/')).toThrow();
    expect(() => parseSearchPosts([{ ...article, url: '/zh-CN/newsroom/article/' }], '/en/newsroom/')).toThrow();
  });
});
