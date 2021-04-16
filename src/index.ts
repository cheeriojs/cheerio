import Cheerio from './cheerio';

/**
 * The default cheerio instance.
 *
 * @deprecated Use the function returned by `load` instead.
 */
export default Cheerio;

/**
 * The main types of Cheerio objects.
 *
 * @category Cheerio
 */
export type { Cheerio, CheerioAPI } from './cheerio';
/**
 * Types used in signatures of Cheerio methods.
 *
 * @category Cheerio
 */
export * from './types';
export type {
  CheerioOptions,
  HTMLParser2Options,
  Parse5Options,
} from './options';
/**
 * Re-exporting all of the node types.
 *
 * @category DOM Node
 */
export type { Node, NodeWithChildren, Element, Document } from 'domhandler';

/** The current version of Cheerio. */
export { version } from '../package.json';

export * from './load';
import { load } from './load';
// We add this here, to avoid a cyclic depenency
Cheerio.load = load;
import * as staticMethods from './static';

/**
 * In order to promote consistency with the jQuery library, users are encouraged
 * to instead use the static method of the same name.
 *
 * @deprecated
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
 * In order to promote consistency with the jQuery library, users are encouraged
 * to instead use the static method of the same name.
 *
 * @deprecated
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
 * In order to promote consistency with the jQuery library, users are encouraged
 * to instead use the static method of the same name as it is defined on the
 * "loaded" Cheerio factory function.
 *
 * @deprecated See {@link static/parseHTML}.
 * @example
 *
 * ```js
 * const $ = cheerio.load('');
 * $.parseHTML('<b>markup</b>');
 * ```
 */
export const { parseHTML } = staticMethods;

/**
 * Users seeking to access the top-level element of a parsed document should
 * instead use the `root` static method of a "loaded" Cheerio function.
 *
 * @deprecated
 * @example
 *
 * ```js
 * const $ = cheerio.load('');
 * $.root();
 * ```
 */
export const { root } = staticMethods;
