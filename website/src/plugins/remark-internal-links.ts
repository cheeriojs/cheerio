import type { Link, Root } from 'mdast';
import { visit } from 'unist-util-visit';

const apiPrefix = '/docs/api/';
const markdownExtensionRe = /\.md$/;
const fileExtensionRe = /\.[a-z0-9]+$/i;
const trailingSlashRe = /\/?$/;

function visitInternalLink(node: Link): void {
  if (typeof node.url !== 'string' || !node.url.startsWith('/')) return;

  const hashIndex = node.url.indexOf('#');
  const hash = hashIndex === -1 ? '' : node.url.slice(hashIndex);
  let path = (hashIndex === -1 ? node.url : node.url.slice(0, hashIndex))
    // Typedoc links to the source files it generated.
    .replace(markdownExtensionRe, '');

  // Leave assets (/img/logo.png) alone — only page routes are directories.
  if (fileExtensionRe.test(path)) return;

  // Typedoc keeps the declaration's casing, but routes are built from
  // lowercased slugs and GitHub Pages is case-sensitive.
  if (path.startsWith(apiPrefix)) path = path.toLowerCase();

  // Pages are served as directories, so a slashless link costs a redirect —
  // and GitHub Pages routes that redirect through plain http, which breaks
  // both link previews and the Algolia crawler.
  node.url = path.replace(trailingSlashRe, '/') + hash;
}

function transformer(tree: Root): void {
  visit(tree, 'link', visitInternalLink);
}

/**
 * Remark plugin normalizing absolute internal links in markdown to the
 * lowercase, trailing-slash form the site actually serves.
 *
 * @returns A transformer function.
 */
export function remarkInternalLinks() {
  return transformer;
}
