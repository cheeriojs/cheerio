import type { Code, Parent, Root } from 'mdast';
import { visit } from 'unist-util-visit';

interface MdxJsxAttribute {
  type: 'mdxJsxAttribute';
  name: string;
  value: string | null;
}

interface MdxJsxFlowElement {
  type: 'mdxJsxFlowElement';
  name: string;
  attributes: MdxJsxAttribute[];
  children: unknown[];
}

function visitLiveCode(
  node: Code,
  index: number | undefined,
  parent: Parent | undefined,
): void {
  // Check if the code block has 'live' in its meta
  if (!(node.meta?.includes('live') && index !== undefined && parent)) {
    return;
  }

  const code = node.value;

  /*
   * Drop the `live` marker so the block is highlighted like any other, then
   * keep it as the child of `LiveCode`. The highlighted block is what readers
   * see until they ask for an editor — no Sandpack, no third-party bundler,
   * and it still renders without JavaScript.
   */
  node.meta = null;

  const jsxNode: MdxJsxFlowElement = {
    type: 'mdxJsxFlowElement',
    name: 'LiveCode',
    attributes: [
      // The raw source, handed to the editor once the reader opens one.
      {
        type: 'mdxJsxAttribute',
        name: 'code',
        value: code,
      },
      {
        type: 'mdxJsxAttribute',
        name: 'client:visible',
        value: null,
      },
    ],
    children: [node],
  };

  parent.children[index] = jsxNode as unknown as Code;
}

function transformer(tree: Root): void {
  visit(tree, 'code', visitLiveCode);
}

/**
 * Remark plugin to wrap code blocks with 'live' meta in a LiveCode component.
 *
 * The original code block is preserved as a child, so it is syntax-highlighted
 * and readable on its own; the component only layers an "Edit & run" affordance
 * on top of it.
 *
 * Usage in markdown:
 *
 * ```js live
 * const $ = cheerio.load('<h1>Hello</h1>');
 * console.log($('h1').text());
 * ```
 *
 * @returns A transformer function.
 */
export function remarkLiveCode() {
  return transformer;
}
