import type { Link, Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { normalizeApiDocLink } from './normalize-api-doc-link.ts';

function visitTypedocLink(node: Link): void {
  if (typeof node.url === 'string') {
    const normalized = normalizeApiDocLink(node.url);
    if (normalized) {
      node.url = normalized;
    }
  }
}

function transformer(tree: Root): void {
  visit(tree, 'link', visitTypedocLink);
}

/**
 * Remark plugin to fix typedoc-generated links. Removes .md extension and
 * lowercases paths in internal API doc links.
 *
 * @returns A transformer function.
 */
export function remarkFixTypedocLinks() {
  return transformer;
}
