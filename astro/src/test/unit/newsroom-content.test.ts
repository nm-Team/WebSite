import { readdirSync, readFileSync } from 'node:fs';

import { markdownToHtml, markdownToMdast } from 'satteri';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import manifest from '@/data/newsroom/import-manifest.json';
import { newsroomArticleLinks } from '@/lib/newsroom/article-links';
import { inspectMarkdown } from '@/lib/newsroom/markdown';
import { articlePath, resolveNewsroomLocale } from '@/lib/newsroom/paths';

describe('imported Newsroom content', () => {
  it('keeps the 34 original articles and only their existing translations', () => {
    expect(manifest.articles).toHaveLength(34);
    for (const locale of ['zh-CN', 'en']) {
      const directory = new URL(`../../content/newsroom/${locale}/`, import.meta.url);
      const expected = manifest.articles.filter((article) => article.locales.includes(locale));
      expect(readdirSync(directory).sort()).toEqual(expected.map((article) => `${article.articleId}.md`).sort());
      expect(expected).toHaveLength(locale === 'zh-CN' ? 34 : 32);
      for (const article of expected) {
        const source = readFileSync(new URL(`${article.articleId}.md`, directory), 'utf8');
        const tree = markdownToMdast(source);
        if (tree.type !== 'root' || tree.children[0]?.type !== 'yaml') throw new Error(`Invalid imported article: ${article.articleId}`);
        const data = parse(tree.children[0].value) as { articleId: string; locale: string; title: string };
        expect(data).toMatchObject({ articleId: article.articleId, locale });
        expect(data.title.length).toBeGreaterThan(0);
        expect(inspectMarkdown(source).text.length).toBeGreaterThan(30);
        expect(source).not.toContain('](/uploads/');
        expect(source).not.toContain('](/usr/uploads/');
      }
    }
  });

  it('preserves case and Shanghai publication dates across UTC midnight', () => {
    expect(articlePath('en', 'nmBot-NEXT', new Date('2022-02-13T17:38:00Z'))).toBe('/en/newsroom/nmBot-NEXT-2022-02-14/');
    expect(resolveNewsroomLocale('zh-HK')).toBe('zh-CN');
    expect(resolveNewsroomLocale('ja-JP')).toBe('en');
  });

  it('resolves shared reference images and extracts readable text', () => {
    const result = inspectMarkdown('![Cover][image]\n\nHello **world**, [read more][link].\n\n[image]: /newsroom/uploads/a.png\n[link]: https://example.com');
    expect(result.image).toEqual({ url: '/newsroom/uploads/a.png', alt: 'Cover' });
    expect(result.text).toBe('Hello world, read more.');
    expect(result.text).not.toContain('https:');
  });

  it('applies safe new-window links only to Newsroom Markdown', () => {
    const source = '[Reference](https://example.com)';
    const options = { hastPlugins: [newsroomArticleLinks] };
    const article = markdownToHtml(source, { ...options, fileURL: new URL('file:///project/src/content/newsroom/en/article.md') });
    expect(article.html).toContain('target="_blank"');
    expect(article.html).toMatch(/rel="[^"]*noopener[^"]*"/);
    expect(article.html).toContain('noreferrer');
    const other = markdownToHtml(source, { ...options, fileURL: new URL('file:///project/src/content/other/article.md') });
    expect(other.html).not.toContain('target=');
  });
});
