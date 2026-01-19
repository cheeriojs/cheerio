import { visit } from 'unist-util-visit';

/**
 * Remark plugin to transform Docusaurus-style admonitions (:::note, :::tip,
 * etc.) into custom HTML elements that can be styled with Tailwind.
 */
export function remarkAdmonitions() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'containerDirective') {
        const admonitionTypes = ['note', 'tip', 'warning', 'danger', 'info'];

        if (!admonitionTypes.includes(node.name)) {
          return;
        }

        const data = node.data || (node.data = {});

        // Get title from the directive label or use default
        // e.g., :::tip Title Here or just :::tip
        let title = node.name.charAt(0).toUpperCase() + node.name.slice(1);

        // Check if there's a custom title in the first text
        if (node.children[0]?.data?.directiveLabel) {
          title = node.children[0].children?.[0]?.value || title;
          // Remove the label paragraph from children
          node.children.shift();
        }

        data.hName = 'div';
        data.hProperties = {
          class: `admonition admonition-${node.name}`,
          'data-type': node.name,
        };

        // Prepend a title element
        node.children.unshift({
          type: 'paragraph',
          data: {
            hName: 'p',
            hProperties: { class: 'admonition-title' },
          },
          children: [{ type: 'text', value: title }],
        });
      }
    });
  };
}
