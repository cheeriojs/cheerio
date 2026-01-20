import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to make external links open in a new tab. Adds target="_blank"
 * and rel="noopener noreferrer" to external links.
 */
export function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (
        node.tagName === 'a' &&
        node.properties?.href &&
        typeof node.properties.href === 'string'
      ) {
        const href = node.properties.href;
        // Check if it's an external link (starts with http:// or https://)
        if (href.startsWith('http://') || href.startsWith('https://')) {
          node.properties.target = '_blank';
          node.properties.rel = 'noopener noreferrer';
        }
      }
    });
  };
}
