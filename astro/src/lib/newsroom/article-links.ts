import { defineHastPlugin } from 'satteri';

export const newsroomArticleLinks = defineHastPlugin({
  name: 'newsroom-article-links',
  element: {
    filter: ['a'],
    visit(node, context) {
      if (!context.fileURL?.pathname.replaceAll('\\', '/').includes('/content/newsroom/')) return;
      const tokens = (node.properties.rel ?? []).map(String);
      context.setProperty(node, 'target', '_blank');
      context.setProperty(node, 'rel', [...new Set([...tokens.filter(Boolean), 'noopener', 'noreferrer'])]);
    },
  },
});
