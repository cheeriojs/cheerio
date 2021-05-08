import {
  CheerioOptions,
  default as defaultOptions,
  flatten as flattenOptions,
} from './options';
import * as staticMethods from './static';
import { CheerioAPI, Cheerio } from './cheerio';
import parse from './parse';
import type { Node, Document } from 'domhandler';

/**
 * Create a querying function, bound to a document created from the provided
 * markup. Note that similar to web browser contexts, this operation may
 * introduce `<html>`, `<head>`, and `<body>` elements; set `isDocument` to
 * `false` to switch to fragment mode and disable this.
 *
 * See the README section titled "Loading" for additional usage information.
 *
 * @param content - Markup to be loaded.
 * @param options - Options for the created instance.
 * @param isDocument - Allows parser to be switched to fragment mode.
 * @returns The loaded document.
 */
export function load(
  content: string | Node | Node[] | Buffer,
  options?: CheerioOptions | null,
  isDocument?: boolean
): CheerioAPI {
  if ((content as string | null) == null) {
    throw new Error('cheerio.load() expects a string');
  }

  const internalOpts = { ...defaultOptions, ...flattenOptions(options) };

  if (typeof isDocument === 'undefined') isDocument = true;

  const root = parse(content, internalOpts, isDocument);

  /** Create an extended class here, so that extensions only live on one instance. */
  class LoadedCheerio<T> extends Cheerio<T> {}

  function initialize<T>(
    selector?: T extends Node
      ? string | Cheerio<T> | T[] | T
      : Cheerio<T> | T[],
    context?: string | Cheerio<Node> | Node[] | Node,
    r: string | Cheerio<Document> | Document | null = root,
    opts?: CheerioOptions
  ) {
    return new LoadedCheerio<T>(selector, context, r, {
      ...internalOpts,
      ...flattenOptions(opts),
    });
  }

  // Add in static methods & properties
  Object.assign(initialize, staticMethods, {
    load,
    // `_root` and `_options` are used in static methods.
    _root: root,
    _options: internalOpts,
    // Add `fn` for plugins
    fn: LoadedCheerio.prototype,
    // Add the prototype here to maintain `instanceof` behavior.
    prototype: LoadedCheerio.prototype,
  });

  return initialize as CheerioAPI;
}
