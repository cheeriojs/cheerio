import { DomUtils } from 'htmlparser2';
import { parse as parseWithHtmlparser2 } from './parsers/htmlparser2-adapter';
import { parse as parseWithParse5 } from './parsers/parse5-adapter';
import {
  Node,
  Document,
  NodeWithChildren,
  isDocument as checkIsDocument,
} from 'domhandler';
import type { InternalOptions } from './options';

/*
 * Parser
 */
export default function parse(
  content: string | Document | Node | Node[] | Buffer,
  options: InternalOptions,
  isDocument: boolean
): Document {
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(content)) {
    content = content.toString();
  }

  if (typeof content === 'string') {
    return options.xmlMode || options._useHtmlParser2
      ? parseWithHtmlparser2(content, options)
      : parseWithParse5(content, options, isDocument);
  }

  const doc = content as Node | Node[] | Document;

  if (!Array.isArray(doc) && checkIsDocument(doc)) {
    // If `doc` is already a root, just return it
    return doc;
  }

  // Add conent to new root element
  const root = new Document([]);

  // Update the DOM using the root
  update(doc, root);

  return root;
}

/**
 * Update the dom structure, for one changed layer.
 *
 * @param newChilds - The new children.
 * @param parent - The new parent.
 * @returns The parent node.
 */
export function update(
  newChilds: Node[] | Node,
  parent: NodeWithChildren | null
): Node | null {
  // Normalize
  const arr = Array.isArray(newChilds) ? newChilds : [newChilds];

  // Update parent
  if (parent) {
    parent.children = arr;
  } else {
    parent = null;
  }

  // Update neighbors
  for (let i = 0; i < arr.length; i++) {
    const node = arr[i];

    // Cleanly remove existing nodes from their previous structures.
    if (node.parent && node.parent.children !== arr) {
      DomUtils.removeElement(node);
    }

    if (parent) {
      node.prev = arr[i - 1] || null;
      node.next = arr[i + 1] || null;
    } else {
      node.prev = node.next = null;
    }

    node.parent = parent;
  }

  return parent;
}
