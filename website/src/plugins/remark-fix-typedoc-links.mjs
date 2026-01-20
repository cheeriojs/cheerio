import { visit } from 'unist-util-visit';

/**
 * Remark plugin to fix typedoc-generated links. Removes .md extension from
 * internal API doc links.
 */
export function remarkFixTypedocLinks() {
  return (tree) => {
    visit(tree, 'link', (node) => {
      if (typeof node.url === 'string' && node.url.startsWith('/docs/api/')) {
        // Remove .md extension from API doc links
        node.url = node.url.replace(/\.md$/, '');
      }
    });
  };
}
