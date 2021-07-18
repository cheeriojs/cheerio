import { InternalOptions } from './options';
import type { Node, Document } from 'domhandler';
import { BasicAcceptedElems } from './types';

import * as Attributes from './api/attributes';
import * as Traversing from './api/traversing';
import * as Manipulation from './api/manipulation';
import * as Css from './api/css';
import * as Forms from './api/forms';

type AttributesType = typeof Attributes;
type TraversingType = typeof Traversing;
type ManipulationType = typeof Manipulation;
type CssType = typeof Css;
type FormsType = typeof Forms;

export abstract class Cheerio<T> implements ArrayLike<T> {
  length = 0;
  [index: number]: T;

  options: InternalOptions;
  /**
   * The root of the document. Can be set by using the `root` argument of the constructor.
   *
   * @private
   */
  _root: Cheerio<Document> | null;

  /**
   * Instance of cheerio. Methods are specified in the modules. Usage of this
   * constructor is not recommended. Please use $.load instead.
   *
   * @private
   * @param elements - The new selection.
   * @param root - Sets the root node.
   * @param options - Options for the instance.
   */
  constructor(
    elements: ArrayLike<T> | undefined,
    root: Cheerio<Document> | null,
    options: InternalOptions
  ) {
    this.options = options;
    this._root = root;

    if (elements) {
      for (let idx = 0; idx < elements.length; idx++) {
        this[idx] = elements[idx];
      }
      this.length = elements.length;
    }
  }

  prevObject: Cheerio<any> | undefined;
  /**
   * Make a cheerio object.
   *
   * @private
   * @param dom - The contents of the new object.
   * @param context - The context of the new object.
   * @returns The new cheerio object.
   */
  abstract _make<T>(
    dom: ArrayLike<T> | T | string,
    context?: BasicAcceptedElems<Node>
  ): Cheerio<T>;

  /**
   * Parses some content.
   *
   * @private
   * @param content - Content to parse.
   * @param options - Options for parsing.
   * @param isDocument - Allows parser to be switched to fragment mode.
   * @returns A document containing the `content`.
   */
  abstract _parse(
    content: string | Document | Node | Node[] | Buffer,
    options: InternalOptions,
    isDocument: boolean
  ): Document;

  /**
   * Render an element or a set of elements.
   *
   * @private
   * @param dom - DOM to render.
   * @returns The rendered DOM.
   */
  abstract _render(dom: Node | ArrayLike<Node>): string;
}

export interface Cheerio<T>
  extends AttributesType,
    TraversingType,
    ManipulationType,
    CssType,
    FormsType,
    Iterable<T> {
  cheerio: '[cheerio object]';

  splice: typeof Array.prototype.slice;
}

/** Set a signature of the object. */
Cheerio.prototype.cheerio = '[cheerio object]';

/*
 * Make cheerio an array-like object
 */
Cheerio.prototype.splice = Array.prototype.splice;

// Support for (const element of $(...)) iteration:
Cheerio.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

// Plug in the API
Object.assign(
  Cheerio.prototype,
  Attributes,
  Traversing,
  Manipulation,
  Css,
  Forms
);
