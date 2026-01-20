import { visit } from 'unist-util-visit';

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
 */
export function remarkLiveCode() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      // Check if the code block has 'live' in its meta
      if (node.meta?.includes('live')) {
        // Transform the code node into an MDX JSX element
        const code = node.value;

        /*
         * Create an mdxJsxFlowElement node for the LiveCode component
         * with client:visible for lazy hydration
         */
        const jsxNode = {
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
        parent.children.splice(index, 1, jsxNode);
      }
    });
  };
}
