import type { CheerioAPI, Cheerio } from '.';
import { Node, Document } from 'domhandler';
import {
  InternalOptions,
  CheerioOptions,
  default as defaultOptions,
  flatten as flattenOptions,
} from './options';
import { select } from 'cheerio-select';
import { ElementType, DomUtils } from 'htmlparser2';
import { render as renderWithParse5 } from './parsers/parse5-adapter';
import { render as renderWithHtmlparser2 } from './parsers/htmlparser2-adapter';

/**
 * Helper function to render a DOM.
 *
 * @param that - Cheerio instance to render.
 * @param dom - The DOM to render. Defaults to `that`'s root.
 * @param options - Options for rendering.
 * @returns The rendered document.
 */
function render(
  that: CheerioAPI | undefined,
  dom: ArrayLike<Node> | Node | string | undefined,
  options: InternalOptions
): string {
  const toRender = dom
    ? typeof dom === 'string'
      ? select(dom, that?._root ?? [], options)
      : dom
    : that?._root.children;

  if (!toRender) return '';

  return options.xmlMode || options._useHtmlParser2
    ? renderWithHtmlparser2(toRender, options)
    : renderWithParse5(toRender);
}

/**
 * Checks if a passed object is an options object.
 *
 * @param dom - Object to check if it is an options object.
 * @returns Whether the object is an options object.
 */
function isOptions(
  dom?: string | ArrayLike<Node> | Node | InternalOptions | null
): dom is InternalOptions {
  return (
    typeof dom === 'object' &&
    dom != null &&
    !('length' in dom) &&
    !('type' in dom)
  );
}

/**
 * Renders the document.
 *
 * @param options - Options for the renderer.
 * @returns The rendered document.
 */
export function html(this: CheerioAPI | void, options?: CheerioOptions): string;
/**
 * Renders the document.
 *
 * @param dom - Element to render.
 * @param options - Options for the renderer.
 * @returns The rendered document.
 */
export function html(
  this: CheerioAPI | void,
  dom?: string | ArrayLike<Node> | Node,
  options?: CheerioOptions
): string;
export function html(
  this: CheerioAPI | void,
  dom?: string | ArrayLike<Node> | Node | CheerioOptions,
  options?: CheerioOptions
): string {
  /*
   * Be flexible about parameters, sometimes we call html(),
   * with options as only parameter
   * check dom argument for dom element specific properties
   * assume there is no 'length' or 'type' properties in the options object
   */
  if (!options && isOptions(dom)) {
    options = dom;
    dom = undefined;
  }

  /*
   * Sometimes `$.html()` is used without preloading html,
   * so fallback non-existing options to the default ones.
   */
  const opts = {
    ...defaultOptions,
    ...(this ? this._options : {}),
    ...flattenOptions(options ?? {}),
  };

  return render(
    this || undefined,
    dom as string | Cheerio<Node> | Node | undefined,
    opts
  );
}

/**
 * Render the document as XML.
 *
 * @param dom - Element to render.
 * @returns THe rendered document.
 */
export function xml(
  this: CheerioAPI,
  dom?: string | ArrayLike<Node> | Node
): string {
  const options = { ...this._options, xmlMode: true };

  return render(this, dom, options);
}

/**
 * Render the document as text.
 *
 * @param elements - Elements to render.
 * @returns The rendered document.
 */
export function text(
  this: CheerioAPI | void,
  elements?: ArrayLike<Node>
): string {
  const elems = elements ? elements : this ? this.root() : [];

  let ret = '';

  for (let i = 0; i < elems.length; i++) {
    const elem = elems[i];
    if (DomUtils.isText(elem)) ret += elem.data;
    else if (
      DomUtils.hasChildren(elem) &&
      elem.type !== ElementType.Comment &&
      elem.type !== ElementType.Script &&
      elem.type !== ElementType.Style
    ) {
      ret += text(elem.children);
    }
  }

  return ret;
}

/**
 * Parses a string into an array of DOM nodes. The `context` argument has no
 * meaning for Cheerio, but it is maintained for API compatibility with jQuery.
 *
 * @param data - Markup that will be parsed.
 * @param context - Will be ignored. If it is a boolean it will be used as the
 *   value of `keepScripts`.
 * @param keepScripts - If false all scripts will be removed.
 * @returns The parsed DOM.
 * @alias Cheerio.parseHTML
 * @see {@link https://api.jquery.com/jQuery.parseHTML/}
 */
export function parseHTML(
  this: CheerioAPI,
  data: string,
  context?: unknown | boolean,
  keepScripts?: boolean
): Node[];
export function parseHTML(this: CheerioAPI, data?: '' | null): null;
export function parseHTML(
  this: CheerioAPI,
  data?: string | null,
  context?: unknown | boolean,
  keepScripts = typeof context === 'boolean' ? context : false
): Node[] | null {
  if (!data || typeof data !== 'string') {
    return null;
  }

  if (typeof context === 'boolean') {
    keepScripts = context;
  }

  const parsed = this.load(data, defaultOptions, false);
  if (!keepScripts) {
    parsed('script').remove();
  }

  /*
   * The `children` array is used by Cheerio internally to group elements that
   * share the same parents. When nodes created through `parseHTML` are
   * inserted into previously-existing DOM structures, they will be removed
   * from the `children` array. The results of `parseHTML` should remain
   * constant across these operations, so a shallow copy should be returned.
   */
  return parsed.root()[0].children.slice();
}

/**
 * Sometimes you need to work with the top-level root element. To query it, you
 * can use `$.root()`.
 *
 * @example
 *
 * ```js
 * $.root().append('<ul id="vegetables"></ul>').html();
 * //=> <ul id="fruits">...</ul><ul id="vegetables"></ul>
 * ```
 *
 * @returns Cheerio instance wrapping the root node.
 * @alias Cheerio.root
 */
export function root(this: CheerioAPI): Cheerio<Document> {
  return this(this._root);
}

/**
 * Checks to see if the `contained` DOM element is a descendant of the
 * `container` DOM element.
 *
 * @param container - Potential parent node.
 * @param contained - Potential child node.
 * @returns Indicates if the nodes contain one another.
 * @alias Cheerio.contains
 * @see {@link https://api.jquery.com/jQuery.contains/}
 */
export function contains(container: Node, contained: Node): boolean {
  // According to the jQuery API, an element does not "contain" itself
  if (contained === container) {
    return false;
  }

  /*
   * Step up the descendants, stopping when the root element is reached
   * (signaled by `.parent` returning a reference to the same object)
   */
  let next: Node | null = contained;
  while (next && next !== next.parent) {
    next = next.parent;
    if (next === container) {
      return true;
    }
  }

  return false;
}

interface WritableArrayLike<T> extends ArrayLike<T> {
  length: number;
  [n: number]: T;
}

/**
 * $.merge().
 *
 * @param arr1 - First array.
 * @param arr2 - Second array.
 * @returns `arr1`, with elements of `arr2` inserted.
 * @alias Cheerio.merge
 * @see {@link https://api.jquery.com/jQuery.merge/}
 */
export function merge<T>(
  arr1: WritableArrayLike<T>,
  arr2: ArrayLike<T>
): ArrayLike<T> | undefined {
  if (!isArrayLike(arr1) || !isArrayLike(arr2)) {
    return;
  }
  let newLength = arr1.length;
  const len = +arr2.length;

  for (let i = 0; i < len; i++) {
    arr1[newLength++] = arr2[i];
  }
  arr1.length = newLength;
  return arr1;
}

/**
 * @param item - Item to check.
 * @returns Indicates if the item is array-like.
 */
function isArrayLike(item: any): item is ArrayLike<unknown> {
  if (Array.isArray(item)) {
    return true;
  }

  if (
    typeof item !== 'object' ||
    !Object.prototype.hasOwnProperty.call(item, 'length') ||
    typeof item.length !== 'number' ||
    item.length < 0
  ) {
    return false;
  }

  for (let i = 0; i < item.length; i++) {
    if (!(i in item)) {
      return false;
    }
  }
  return true;
}
