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

  options = { ...defaultOptions, ...flattenOptions(options) };

  if (typeof isDocument === 'undefined') isDocument = true;

  const root = parse(content, options, isDocument);

  class initialize<T> extends Cheerio<T> {
    // Mimic jQuery's prototype alias for plugin authors.
    static fn = initialize.prototype;

    constructor(
      selector?: T extends Node
        ? string | Cheerio<T> | T[] | T
        : Cheerio<T> | T[],
      context?: string | Cheerio<Node> | Node[] | Node,
      r: string | Cheerio<Document> | Document = root,
      opts?: CheerioOptions
    ) {
      // @ts-expect-error Using `this` before calling the constructor.
      if (!(this instanceof initialize)) {
        return new initialize(selector, context, r, opts);
      }
      super(selector, context, r, { ...options, ...opts });
    }
  }

  /*
   * Keep a reference to the top-level scope so we can chain methods that implicitly
   * resolve selectors; e.g. $("<span>").(".bar"), which otherwise loses ._root
   */
  initialize.prototype._originalRoot = root;

  // Add in the static methods
  Object.assign(initialize, staticMethods, { load });

  // Add in the root
  initialize._root = root;
  // Store options
  initialize._options = options;

  return (initialize as unknown) as CheerioAPI;
}
