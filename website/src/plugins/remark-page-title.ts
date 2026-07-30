import type { Root } from 'mdast';
import { toString } from 'mdast-util-to-string';

interface AstroVFileData {
  astro?: { frontmatter?: Record<string, unknown> };
}

// Frontmatter, and the imports MDX files open with, are nodes in the tree.
const preamble = new Set(['yaml', 'toml', 'mdxjsEsm', 'mdxFlowExpression']);

function transformer(tree: Root, file: { data: AstroVFileData }): void {
  const index = tree.children.findIndex((node) => !preamble.has(node.type));
  const first = tree.children[index];
  if (first?.type !== 'heading' || first.depth !== 1) return;

  // Both layouts render the page title in their own <h1>, so a leading body
  // <h1> is always a duplicate. Lift it into frontmatter and drop the node,
  // rather than leaving it in the DOM for CSS to hide: a hidden heading still
  // reaches screen readers, search crawlers, and the heading outline.
  tree.children.splice(index, 1);

  const frontmatter = file.data.astro?.frontmatter;
  if (frontmatter && frontmatter.title == null) {
    frontmatter.title = toString(first);
  }
}

/**
 * Remark plugin that removes a document's leading `<h1>` and exposes its text
 * as `remarkPluginFrontmatter.title`, so pages can title themselves without
 * rendering the heading twice.
 *
 * @returns A transformer function.
 */
export function remarkPageTitle() {
  return transformer;
}
