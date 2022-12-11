/**
 * The main types of Cheerio objects.
 *
 * @category Cheerio
 */
export type { Cheerio } from './cheerio.js';

/**
 * Types used in signatures of Cheerio methods.
 *
 * @category Cheerio
 */
export * from './types.js';
export type {
  CheerioOptions,
  HTMLParser2Options,
  Parse5Options,
} from './options.js';
/**
 * Re-exporting all of the node types.
 *
 * @category DOM Node
 */
export type { Node, AnyNode, ParentNode, Element, Document } from 'domhandler';

export type { CheerioAPI } from './load.js';
import { getLoad } from './load.js';
import { getParse } from './parse.js';
import { renderWithParse5, parseWithParse5 } from './parsers/parse5-adapter.js';
import renderWithHtmlparser2 from 'dom-serializer';
import { parseDocument as parseWithHtmlparser2 } from 'htmlparser2';

const parse = getParse((content, options, isDocument, context) =>
  options.xmlMode || options._useHtmlParser2
    ? parseWithHtmlparser2(content, options)
    : parseWithParse5(content, options, isDocument, context)
);

// Duplicate docs due to https://github.com/TypeStrong/typedoc/issues/1616
/**
 * Create a querying function, bound to a document created from the provided
 * markup.
 *
 * Note that similar to web browser contexts, this operation may introduce
 * `<html>`, `<head>`, and `<body>` elements; set `isDocument` to `false` to
 * switch to fragment mode and disable this.
 *
 * @param content - Markup to be loaded.
 * @param options - Options for the created instance.
 * @param isDocument - Allows parser to be switched to fragment mode.
 * @returns The loaded document.
 * @see {@link https://cheerio.js.org#loading} for additional usage information.
 */
export const load = getLoad(parse, (dom, options) =>
  options.xmlMode || options._useHtmlParser2
    ? renderWithHtmlparser2(dom, options)
    : renderWithParse5(dom)
);

const defaultInstance = load([]);

/**
 * The default cheerio instance.
 *
 * @deprecated Use the function returned by `load` instead. To access load, make
 *   sure you are importing `* as cheerio` instead of this default export.
 */
export default defaultInstance;

import * as staticMethods from './static.js';

/** {@inheritdoc staticMethods.html}. */
export const html = staticMethods.html.bind(defaultInstance);

/** {@inheritdoc staticMethods.xml}. */
export const xml = staticMethods.xml.bind(defaultInstance);

/** {@inheritdoc staticMethods.text}. */
export const text = staticMethods.text.bind(defaultInstance);

/**
 * The `.contains` method exported by the Cheerio module is deprecated.
 *
 * In order to promote consistency with the jQuery library, users are encouraged
 * to instead use the static method of the same name.
 *
 * @deprecated Use `contains` on the loaded instance instead.
 * @example
 *
 * ```js
 * const $ = cheerio.load('<div><p></p></div>');
 *
 * $.contains($('div').get(0), $('p').get(0));
 * //=> true
 *
 * $.contains($('p').get(0), $('div').get(0));
 * //=> false
 * ```
 *
 * @returns {boolean}
 */
export const { contains } = staticMethods;

/**
 * The `.merge` method exported by the Cheerio module is deprecated.
 *
 * In order to promote consistency with the jQuery library, users are encouraged
 * to instead use the static method of the same name.
 *
 * @deprecated Use `merge` on the loaded instance instead.
 * @example
 *
 * ```js
 * const $ = cheerio.load('');
 *
 * $.merge([1, 2], [3, 4]);
 * //=> [1, 2, 3, 4]
 * ```
 */
export const { merge } = staticMethods;

/**
 * The `.parseHTML` method exported by the Cheerio module is deprecated.
 *
 * In order to promote consistency with the jQuery library, users are encouraged
 * to instead use the static method of the same name as it is defined on the
 * "loaded" Cheerio factory function.
 *
 * @deprecated Use `parseHTML` on the loaded instance instead.
 * @example
 *
 * ```js
 * const $ = cheerio.load('');
 * $.parseHTML('<b>markup</b>');
 * ```
 */
export const { parseHTML } = staticMethods;

/**
 * The `.root` method exported by the Cheerio module is deprecated.
 *
 * Users seeking to access the top-level element of a parsed document should
 * instead use the `root` static method of a "loaded" Cheerio function.
 *
 * @deprecated Use `root` on the loaded instance instead.
 * @example
 *
 * ```js
 * const $ = cheerio.load('');
 * $.root();
 * ```
 */
export const { root } = staticMethods;
