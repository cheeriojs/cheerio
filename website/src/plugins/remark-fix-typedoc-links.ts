import { visit } from 'unist-util-visit';
import type { Root, Link } from 'mdast';

function visitTypedocLink(node: Link): void {
  if (typeof node.url === 'string' && node.url.startsWith('/docs/api/')) {
    // Remove .md extension from API doc links
    node.url = node.url.replace(/\.md$/, '');
  }
}

function transformer(tree: Root): void {
  visit(tree, 'link', visitTypedocLink);
}

/**
 * Remark plugin to fix typedoc-generated links. Removes .md extension from
 * internal API doc links.
 *
 * @returns A transformer function.
 */
export function remarkFixTypedocLinks() {
  return transformer;
}
