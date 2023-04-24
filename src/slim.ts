/**
 * @file Alternative entry point for Cheerio that always uses htmlparser2. This
 *   way, parse5 won't be loaded, saving some memory.
 */

export type {
  Cheerio,
  CheerioAPI,
  CheerioOptions,
  HTMLParser2Options,
  Node,
  AnyNode,
  ParentNode,
  Element,
  Document,
} from './index.js';

/**
 * Types used in signatures of Cheerio methods.
 *
 * @category Cheerio
 */
export * from './types.js';

import { getLoad } from './load.js';
import { getParse } from './parse.js';
import render from 'dom-serializer';
import { parseDocument } from 'htmlparser2';

/**
 * Create a querying function, bound to a document created from the provided
 * markup.
 *
 * @param content - Markup to be loaded.
 * @param options - Options for the created instance.
 * @param isDocument - Always `false` here, as we are always using
 *   `htmlparser2`.
 * @returns The loaded document.
 * @see {@link https://cheerio.js.org#loading} for additional usage information.
 */
export const load = getLoad(getParse(parseDocument), render);
