import { AnyNode, Document, isDocument, ParentNode } from 'domhandler';
import { parse as parseDocument, parseFragment, serializeOuter } from 'parse5';
import { adapter as htmlparser2Adapter } from 'parse5-htmlparser2-tree-adapter';
import type { InternalOptions } from '../options.js';

export function parseWithParse5(
  content: string,
  options: InternalOptions,
  isDocument: boolean,
  context: ParentNode | null
): Document {
  const opts = {
    scriptingEnabled:
      typeof options.scriptingEnabled === 'boolean'
        ? options.scriptingEnabled
        : true,
    treeAdapter: htmlparser2Adapter,
    sourceCodeLocationInfo: options.sourceCodeLocationInfo,
  };

  return isDocument
    ? parseDocument(content, opts)
    : parseFragment(context, content, opts);
}

const renderOpts = { treeAdapter: htmlparser2Adapter };

export function renderWithParse5(dom: AnyNode | ArrayLike<AnyNode>): string {
  /*
   * `dom-serializer` passes over the special "root" node and renders the
   * node's children in its place. To mimic this behavior with `parse5`, an
   * equivalent operation must be applied to the input array.
   */
  const nodes = 'length' in dom ? dom : [dom];
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (isDocument(node)) {
      Array.prototype.splice.call(nodes, index, 1, ...node.children);
    }
  }

  let result = '';
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    result += serializeOuter(node, renderOpts);
  }

  return result;
}
