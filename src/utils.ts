import { DomUtils } from 'htmlparser2';
import { Node, cloneNode, Document } from 'domhandler';
import type { Cheerio } from './cheerio';

/**
 * Check if the DOM element is a tag.
 *
 * `isTag(type)` includes `<script>` and `<style>` tags.
 *
 * @private
 * @category Utils
 * @param type - DOM node to check.
 * @returns Whether the node is a tag.
 */
export const { isTag } = DomUtils;

/**
 * Checks if an object is a Cheerio instance.
 *
 * @category Utils
 * @param maybeCheerio - The object to check.
 * @returns Whether the object is a Cheerio instance.
 */
export function isCheerio<T>(maybeCheerio: any): maybeCheerio is Cheerio<T> {
  return maybeCheerio.cheerio != null;
}

/**
 * Convert a string to camel case notation.
 *
 * @private
 * @category Utils
 * @param str - String to be converted.
 * @returns String in camel case notation.
 */
export function camelCase(str: string): string {
  return str.replace(/[_.-](\w|$)/g, (_, x) => x.toUpperCase());
}

/**
 * Convert a string from camel case to "CSS case", where word boundaries are
 * described by hyphens ("-") and all characters are lower-case.
 *
 * @private
 * @category Utils
 * @param str - String to be converted.
 * @returns String in "CSS case".
 */
export function cssCase(str: string): string {
  return str.replace(/[A-Z]/g, '-$&').toLowerCase();
}

/**
 * Iterate over each DOM element without creating intermediary Cheerio instances.
 *
 * This is indented for use internally to avoid otherwise unnecessary memory
 * pressure introduced by _make.
 *
 * @category Utils
 * @param array - Array to iterate over.
 * @param fn - Function to call.
 * @returns The original instance.
 */
export function domEach<T extends Node, Arr extends ArrayLike<T> = Cheerio<T>>(
  array: Arr,
  fn: (index: number, elem: T) => void | false
): Arr {
  const len = array.length;
  for (let i = 0; i < len && fn(i, array[i]) !== false; i++);
  return array;
}

/**
 * Create a deep copy of the given DOM structure. Sets the parents of the copies
 * of the passed nodes to `null`.
 *
 * @private
 * @category Utils
 * @param dom - The htmlparser2-compliant DOM structure.
 * @returns - The cloned DOM.
 */
export function cloneDom<T extends Node>(dom: T | T[]): T[] {
  const clone =
    'length' in dom
      ? (Array.prototype.map.call(dom, (el) => cloneNode(el, true)) as T[])
      : [cloneNode(dom, true)];

  // Add a root node around the cloned nodes
  const root = new Document(clone);
  clone.forEach((node) => {
    node.parent = root;
  });

  return clone;
}

/**
 * A simple way to check for HTML strings. Tests for a `<` within a string,
 * immediate followed by a letter and eventually followed by a `>`.
 *
 * @private
 */
const quickExpr = /<[a-zA-Z][^]*>/;

/**
 * Check if string is HTML.
 *
 * @private
 * @category Utils
 * @param str - String to check.
 * @returns Indicates if `str` is HTML.
 */
export function isHtml(str: string): boolean {
  // Run the regex
  return quickExpr.test(str);
}
