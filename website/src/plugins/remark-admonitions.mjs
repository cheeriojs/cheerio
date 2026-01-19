import { visit } from 'unist-util-visit';
import { h } from 'hastscript';

/**
 * Remark plugin to transform Docusaurus-style admonitions (:::note, :::tip,
 * etc.) into custom HTML elements that can be styled with Tailwind.
 */
export function remarkAdmonitions() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const admonitionTypes = ['note', 'tip', 'warning', 'danger', 'info'];

        if (!admonitionTypes.includes(node.name)) {
          return;
        }

        const data = node.data || (node.data = {});
        const tagName = 'div';
        const title =
          node.children[0]?.type === 'paragraph'
            ? node.attributes?.title ||
              node.name.charAt(0).toUpperCase() + node.name.slice(1)
            : node.name.charAt(0).toUpperCase() + node.name.slice(1);

        data.hName = tagName;
        data.hProperties = h(tagName, {
          class: `admonition admonition-${node.name}`,
          'data-type': node.name,
          'data-title': title,
        }).properties;
      }
    });
  };
}
