import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

function visitExternalLink(node: Element): void {
  if (
    node.tagName === 'a' &&
    node.properties?.href &&
    typeof node.properties.href === 'string'
  ) {
    const { href } = node.properties;
    // Check if it's an external link (starts with http:// or https://)
    if (href.startsWith('http://') || href.startsWith('https://')) {
      node.properties.target = '_blank';
      node.properties.rel = 'noopener noreferrer';
    }
  }
}

function transformer(tree: Root): void {
  visit(tree, 'element', visitExternalLink);
}

/**
 * Rehype plugin to make external links open in a new tab. Adds target="_blank"
 * and rel="noopener noreferrer" to external links.
 *
 * @returns A transformer function.
 */
export function rehypeExternalLinks() {
  return transformer;
}
