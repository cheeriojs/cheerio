import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';
import { normalizeApiDocLink } from './normalize-api-doc-link.ts';

function visitTypedocLink(node: Element): void {
  if (node.tagName !== 'a' || typeof node.properties?.href !== 'string') {
    return;
  }

  const normalized = normalizeApiDocLink(node.properties.href);
  if (normalized) {
    node.properties.href = normalized;
  }
}

function transformer(tree: Root): void {
  visit(tree, 'element', visitTypedocLink);
}

/**
 * Rehype plugin to fix typedoc-generated links in rendered HTML (including GFM
 * tables). Removes .md extension and lowercases paths in internal API doc links.
 *
 * @returns A transformer function.
 */
export function rehypeFixTypedocLinks() {
  return transformer;
}
