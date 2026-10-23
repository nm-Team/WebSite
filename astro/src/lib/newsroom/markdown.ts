import { markdownToMdast, type MdastNode } from 'satteri';

export function inspectMarkdown(source: string) {
  const tree = markdownToMdast(source);
  const definitions = new Map<string, string>();
  const text: string[] = [];
  let image: { url: string; alt: string } | undefined;

  function collectDefinitions(node: MdastNode): void {
    if (node.type === 'definition') definitions.set(node.identifier, node.url);
    if ('children' in node) node.children.forEach(collectDefinitions);
  }

  function visit(node: MdastNode): void {
    if (node.type === 'definition' || node.type === 'yaml' || node.type === 'html') return;
    if (node.type === 'image' || node.type === 'imageReference') {
      const url = node.type === 'image' ? node.url : definitions.get(node.identifier);
      if (!image && url) image = { url, alt: node.alt ?? '' };
      return;
    }
    if ('value' in node && typeof node.value === 'string') text.push(node.value);
    if ('children' in node) node.children.forEach(visit);
    if (['paragraph', 'heading', 'listItem', 'tableCell', 'code', 'break'].includes(node.type)) text.push(' ');
  }

  collectDefinitions(tree);
  visit(tree);
  const plainText = text.join('').replace(/\s+/g, ' ').trim();
  return { text: plainText, excerpt: Array.from(plainText).slice(0, 180).join(''), image };
}
