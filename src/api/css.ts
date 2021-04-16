import { domEach, isTag } from '../utils';
import type { Element, Node } from 'domhandler';
import type { Cheerio } from '../cheerio';

/**
 * Get the value of a style property for the first element in the set of matched elements.
 *
 * @category CSS
 * @param names - Optionally the names of the property of interest.
 * @returns A map of all of the style properties.
 * @see {@link https://api.jquery.com/css/}
 */
export function css<T extends Node>(
  this: Cheerio<T>,
  names?: string[]
): Record<string, string>;
/**
 * Get the value of a style property for the first element in the set of matched elements.
 *
 * @category CSS
 * @param names - The name of the property.
 * @returns The property value for the given name.
 * @see {@link https://api.jquery.com/css/}
 */
export function css<T extends Node>(
  this: Cheerio<T>,
  name: string
): string | undefined;
/**
 * Set one CSS property for every matched element.
 *
 * @category CSS
 * @param prop - The name of the property.
 * @param val - The new value.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/css/}
 */
export function css<T extends Node>(
  this: Cheerio<T>,
  prop: string,
  val:
    | string
    | ((this: Element, i: number, style: string) => string | undefined)
): Cheerio<T>;
/**
 * Set multiple CSS properties for every matched element.
 *
 * @category CSS
 * @param prop - The name of the property.
 * @param val - The new value.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/css/}
 */
export function css<T extends Node>(
  this: Cheerio<T>,
  prop: Record<string, string>
): Cheerio<T>;
export function css<T extends Node>(
  this: Cheerio<T>,
  prop?: string | string[] | Record<string, string>,
  val?:
    | string
    | ((this: Element, i: number, style: string) => string | undefined)
): Cheerio<T> | Record<string, string> | string | undefined {
  if (
    (prop != null && val != null) ||
    // When `prop` is a "plain" object
    (typeof prop === 'object' && !Array.isArray(prop))
  ) {
    return domEach(this, (idx, el) => {
      if (isTag(el)) {
        // `prop` can't be an array here anymore.
        setCss(el, prop as string, val, idx);
      }
    });
  }

  return getCss(this[0], prop as string);
}

/**
 * Set styles of all elements.
 *
 * @private
 * @param el - Element to set style of.
 * @param prop - Name of property.
 * @param value - Value to set property to.
 * @param idx - Optional index within the selection.
 */
function setCss(
  el: Element,
  prop: string | Record<string, string>,
  value:
    | string
    | ((this: Element, i: number, style: string) => string | undefined)
    | undefined,
  idx: number
) {
  if (typeof prop === 'string') {
    const styles = getCss(el);

    const val =
      typeof value === 'function' ? value.call(el, idx, styles[prop]) : value;

    if (val === '') {
      delete styles[prop];
    } else if (val != null) {
      styles[prop] = val;
    }

    el.attribs.style = stringify(styles);
  } else if (typeof prop === 'object') {
    Object.keys(prop).forEach((k, i) => {
      setCss(el, k, prop[k], i);
    });
  }
}

/**
 * Get the parsed styles of the first element.
 *
 * @private
 * @category CSS
 * @param el - Element to get styles from.
 * @param props - Optionally the names of the properties of interest.
 * @returns The parsed styles.
 */
function getCss(el?: Node, props?: string[]): Record<string, string>;
/**
 * Get a property from the parsed styles of the first element.
 *
 * @private
 * @category CSS
 * @param el - Element to get styles from.
 * @param prop - Name of the prop.
 * @returns The value of the property.
 */
function getCss(el: Node, prop: string): string | undefined;
function getCss(
  el?: Node,
  prop?: string | string[]
): Record<string, string> | string | undefined {
  if (!el || !isTag(el)) return;

  const styles = parse(el.attribs.style);
  if (typeof prop === 'string') {
    return styles[prop];
  }
  if (Array.isArray(prop)) {
    const newStyles: Record<string, string> = {};
    prop.forEach((item) => {
      if (styles[item] != null) {
        newStyles[item] = styles[item];
      }
    });
    return newStyles;
  }
  return styles;
}

/**
 * Stringify `obj` to styles.
 *
 * @private
 * @category CSS
 * @param obj - Object to stringify.
 * @returns The serialized styles.
 */
function stringify(obj: Record<string, string>): string {
  return Object.keys(obj).reduce(
    (str, prop) => `${str}${str ? ' ' : ''}${prop}: ${obj[prop]};`,
    ''
  );
}

/**
 * Parse `styles`.
 *
 * @private
 * @category CSS
 * @param styles - Styles to be parsed.
 * @returns The parsed styles.
 */
function parse(styles: string): Record<string, string> {
  styles = (styles || '').trim();

  if (!styles) return {};

  return styles.split(';').reduce<Record<string, string>>((obj, str) => {
    const n = str.indexOf(':');
    // Skip if there is no :, or if it is the first/last character
    if (n < 1 || n === str.length - 1) return obj;
    obj[str.slice(0, n).trim()] = str.slice(n + 1).trim();
    return obj;
  }, {});
}
