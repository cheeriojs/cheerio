import { visit } from 'unist-util-visit';
import type { Root, Code, Parent } from 'mdast';

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
  if (node.meta?.includes('live') && index !== undefined && parent) {
    // Transform the code node into an MDX JSX element
    const code = node.value;

    /*
     * Create an mdxJsxFlowElement node for the LiveCode component
     * with client:visible for lazy hydration
     */
    const jsxNode: MdxJsxFlowElement = {
      type: 'mdxJsxFlowElement',
      name: 'LiveCode',
      attributes: [
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
      children: [],
    };

    // Replace the code node with the JSX node
    parent.children.splice(index, 1, jsxNode as unknown as Code);
  }
}

function transformer(tree: Root): void {
  visit(tree, 'code', visitLiveCode);
}

/**
 * Remark plugin to transform code blocks with 'live' meta into LiveCode
 * components.
 *
 * Usage in markdown:
 *
 * ```js
 * const $ = cheerio.load('<h1>Hello</h1>');
 * return <>{$('h1').text()}</>;
 * ```
 *
 * @returns A transformer function.
 */
export function remarkLiveCode() {
  return transformer;
}
