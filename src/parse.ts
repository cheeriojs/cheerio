import {
  type AnyNode,
  isDocument as checkIsDocument,
  Document,
  type ParentNode,
} from 'domhandler';
import { removeElement } from 'domutils';
import type { InternalOptions } from './options.js';

/**
 * Get the parse function with options.
 *
 * @param parser - The parser function.
 * @returns The parse function with options.
 */
export function getParse(
  parser: (
    content: string,
    options: InternalOptions,
    isDocument: boolean,
    context: ParentNode | null,
  ) => Document,
) {
  /**
   * Parse a HTML string or a node.
   *
   * @param content - The HTML string or node.
   * @param options - The parser options.
   * @param isDocument - If `content` is a document.
   * @param context - The context node in the DOM tree.
   * @returns The parsed document node.
   */
  return function parse(
    content: string | Document | AnyNode | AnyNode[] | Buffer,
    options: InternalOptions,
    isDocument: boolean,
    context: ParentNode | null,
  ): Document {
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(content)) {
      content = content.toString();
    }

    if (typeof content === 'string') {
      return parser(content, options, isDocument, context);
    }

    // `load($.root().get())` passes a document in an array: use it as the root instead of moving it below a new one.
    if (
      Array.isArray(content) &&
      content.length === 1 &&
      checkIsDocument(content[0])
    ) {
      content = content[0];
    }

    const doc = content as AnyNode | AnyNode[] | Document;

    if (!Array.isArray(doc) && checkIsDocument(doc)) {
      // If `doc` is already a root, just return it
      return doc;
    }

    // Add content to new root element
    const root = new Document([]);

    // Update the DOM using the root
    update(doc, root);

    return root;
  };
}

/**
 * Update the dom structure, for one changed layer.
 *
 * @param newChilds - The new children.
 * @param parent - The new parent.
 * @returns The parent node.
 */
export function update(
  newChilds: AnyNode[] | AnyNode,
  parent: ParentNode | null,
): ParentNode | null {
  // Normalize
  const arr = Array.isArray(newChilds) ? newChilds : [newChilds];

  // Update parent
  if (parent) {
    parent.children = arr;
  } else {
    parent = null;
  }

  // Cleanly remove existing nodes from their previous structures.
  removeElements(
    arr.filter((node) => node.parent && node.parent.children !== arr),
  );

  // Update neighbors
  for (let i = 0; i < arr.length; i++) {
    const node = arr[i];

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

/**
 * Remove nodes from their parents.
 *
 * Every parent's `children` array is compacted once, instead of being scanned
 * and spliced for each removed node, which would be quadratic when removing
 * many siblings.
 *
 * @param nodes - The nodes to remove.
 */
export function removeElements(nodes: ArrayLike<AnyNode>): void {
  if (nodes.length === 1) {
    removeElement(nodes[0]);
    return;
  }

  const removed = new Set<AnyNode>();
  const parents = new Set<ParentNode>();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node.parent) {
      parents.add(node.parent);
      removed.add(node);
    }
    node.prev = node.next = node.parent = null;
  }

  for (const { children } of parents) {
    let length = 0;
    for (const child of children) {
      if (!removed.has(child)) children[length++] = child;
    }
    children.length = length;
  }
}
