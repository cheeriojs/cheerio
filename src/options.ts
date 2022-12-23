import type { DomHandlerOptions } from 'domhandler';
import type { ParserOptions } from 'htmlparser2';
import type { Options as SelectOptions } from 'cheerio-select';

/**
 * Options accepted by htmlparser2, the default parser for XML.
 *
 * @see https://github.com/fb55/htmlparser2/wiki/Parser-options
 */
export interface HTMLParser2Options extends DomHandlerOptions, ParserOptions {}
/** Options for parse5, the default parser for HTML. */
export interface Parse5Options {
  /** Disable scripting in parse5, so noscript tags would be parsed. */
  scriptingEnabled?: boolean;
  /** Enable location support for parse5. */
  sourceCodeLocationInfo?: boolean;
}

/**
 * Options accepted by Cheerio.
 *
 * Please note that parser-specific options are _only recognized_ if the
 * relevant parser is used.
 */
export interface CheerioOptions extends Parse5Options {
  /** Recommended way of configuring htmlparser2 when wanting to parse XML. */
  xml?: HTMLParser2Options | boolean;

  /**
   * Enable xml mode, which will switch Cheerio to use htmlparser2.
   *
   * @deprecated Please use the `xml` option instead.
   */
  xmlMode?: boolean;

  /** The base URI for the document. Used for the `href` and `src` props. */
  baseURI?: string | URL; // eslint-disable-line n/no-unsupported-features/node-builtins

  /**
   * Is the document in quirks mode?
   *
   * This will lead to `.className` and `#id` being case-insensitive.
   *
   * @default false
   */
  quirksMode?: SelectOptions['quirksMode'];
  /**
   * Extension point for pseudo-classes.
   *
   * Maps from names to either strings of functions.
   *
   * - A string value is a selector that the element must match to be selected.
   * - A function is called with the element as its first argument, and optional
   *   parameters second. If it returns true, the element is selected.
   *
   * @example
   *
   * ```js
   * const $ = cheerio.load(
   *   '<div class="foo"></div><div data-bar="boo"></div>',
   *   {
   *     pseudos: {
   *       // `:foo` is an alias for `div.foo`
   *       foo: 'div.foo',
   *       // `:bar(val)` is equivalent to `[data-bar=val s]`
   *       bar: (el, val) => el.attribs['data-bar'] === val,
   *     },
   *   }
   * );
   *
   * $(':foo').length; // 1
   * $('div:bar(boo)').length; // 1
   * $('div:bar(baz)').length; // 0
   * ```
   */
  pseudos?: SelectOptions['pseudos'];
}

/** Internal options for Cheerio. */
export interface InternalOptions
  extends HTMLParser2Options,
    Omit<CheerioOptions, 'xml'> {
  /**
   * Whether to use htmlparser2.
   *
   * This is set to true if `xml` is set to true.
   */
  _useHtmlParser2?: boolean;
}

const defaultOpts: InternalOptions = {
  _useHtmlParser2: false,
};

/**
 * Flatten the options for Cheerio.
 *
 * This will set `_useHtmlParser2` to true if `xml` is set to true.
 *
 * @param options - The options to flatten.
 * @param baseOptions - The base options to use.
 * @returns The flattened options.
 */
export function flattenOptions(
  options?: CheerioOptions | null,
  baseOptions?: InternalOptions
): InternalOptions {
  if (!options) {
    return baseOptions ?? defaultOpts;
  }

  const opts: InternalOptions = {
    _useHtmlParser2: !!options.xmlMode,
    ...baseOptions,
    ...options,
  };

  if (options.xml) {
    opts._useHtmlParser2 = true;
    opts.xmlMode = true;

    if (options.xml !== true) {
      Object.assign(opts, options.xml);
    }
  } else if (options.xmlMode) {
    opts._useHtmlParser2 = true;
  }

  return opts;
}
