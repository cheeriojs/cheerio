import {
  type AnyNode,
  type Document,
  isDocument,
  type ParentNode,
} from 'domhandler';
import { parse as parseDocument, parseFragment, serializeOuter } from 'parse5';
import { adapter as htmlparser2Adapter } from 'parse5-htmlparser2-tree-adapter';
import type { InternalOptions } from '../options.js';

/**
 * Parse the content with `parse5` in the context of the given `ParentNode`.
 *
 * @param content - The content to parse.
 * @param options - A set of options to use to parse.
 * @param isDocument - Whether to parse the content as a full HTML document.
 * @param context - The context in which to parse the content.
 * @returns The parsed content.
 */
export function parseWithParse5(
  content: string,
  options: InternalOptions,
  isDocument: boolean,
  context: ParentNode | null,
): Document {
  options.treeAdapter ??= htmlparser2Adapter;

  if (options.scriptingEnabled !== false) {
    options.scriptingEnabled = true;
  }

  return isDocument
    ? parseDocument(content, options)
    : parseFragment(context, content, options);
}

const renderOpts = { treeAdapter: htmlparser2Adapter };

/**
 * Renders the given DOM tree with `parse5` and returns the result as a string.
 *
 * @param dom - The DOM tree to render.
 * @returns The rendered document.
 */
export function renderWithParse5(dom: AnyNode | ArrayLike<AnyNode>): string {
  const nodes = 'length' in dom ? dom : [dom];
  let result = '';
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (isDocument(node)) {
      // A document renders as its children, nested documents included.
      const stack: AnyNode[] = [node];
      for (let next = stack.pop(); next; next = stack.pop()) {
        if (isDocument(next)) {
          const { children } = next;
          for (let child = children.length - 1; child >= 0; child -= 1) {
            stack.push(children[child]);
          }
        } else {
          result += serializeOuter(next, renderOpts);
        }
      }
      continue;
    }
    result += serializeOuter(node, renderOpts);
  }

  return result;
}
