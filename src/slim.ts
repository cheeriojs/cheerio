/**
 * @file Alternative entry point for Cheerio that always uses htmlparser2. This
 *   way, parse5 won't be loaded, saving some memory.
 */
import { type CheerioAPI, getLoad } from './load.js';
import { type CheerioOptions } from './options.js';
import { getParse } from './parse.js';
import type { AnyNode } from 'domhandler';
import render from 'dom-serializer';
import { parseDocument } from 'htmlparser2';

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
export const load: (
  content: string | AnyNode | AnyNode[] | Buffer,
  options?: CheerioOptions | null,
  isDocument?: boolean,
) => CheerioAPI = getLoad(getParse(parseDocument), render);
