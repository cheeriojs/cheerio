import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

interface DirectiveData {
  hName?: string;
  hProperties?: Record<string, string>;
  directiveLabel?: boolean;
}

interface DirectiveNode {
  type: string;
  name: string;
  data?: DirectiveData;
  children: DirectiveChild[];
}

interface DirectiveChild {
  type: string;
  value?: string;
  data?: DirectiveData;
  children?: DirectiveChild[];
}

const ADMONITION_TYPES = ['note', 'tip', 'warning', 'danger', 'info'] as const;

function visitAdmonition(node: unknown): void {
  const directive = node as DirectiveNode;
  if (directive.type === 'containerDirective') {
    if (
      !ADMONITION_TYPES.includes(
        directive.name as (typeof ADMONITION_TYPES)[number],
      )
    ) {
      return;
    }

    directive.data ??= {};
    const { data } = directive;

    /*
     * Get title from the directive label or use default
     * e.g., :::tip Title Here or just :::tip
     */
    let title =
      directive.name.charAt(0).toUpperCase() + directive.name.slice(1);

    // Check if there's a custom title in the first text
    const firstChild = directive.children[0];
    if (firstChild?.data?.directiveLabel) {
      title = firstChild.children?.[0]?.value ?? title;
      // Remove the label paragraph from children
      directive.children.shift();
    }

    data.hName = 'div';
    data.hProperties = {
      class: `admonition admonition-${directive.name}`,
      'data-type': directive.name,
    };

    // Prepend a title element
    directive.children.unshift({
      type: 'paragraph',
      data: {
        hName: 'p',
        hProperties: { class: 'admonition-title' },
      },
      children: [{ type: 'text', value: title }],
    });
  }
}

function transformer(tree: Root): void {
  visit(tree, visitAdmonition);
}

/**
 * Remark plugin to transform Docusaurus-style admonitions (:::note, :::tip,
 * etc.) into custom HTML elements that can be styled with Tailwind.
 *
 * @returns A transformer function.
 */
export function remarkAdmonitions() {
  return transformer;
}
