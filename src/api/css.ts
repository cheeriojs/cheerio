import { type AnyNode, type Element, isTag } from 'domhandler';
import type { Cheerio } from '../cheerio.js';
import { domEach } from '../utils.js';

/**
 * Get the value of a style property for the first element in the set of matched
 * elements.
 *
 * @category CSS
 * @param names - Optionally the names of the properties of interest.
 * @returns A map of all of the style properties.
 * @see {@link https://api.jquery.com/css/}
 */
export function css<T extends AnyNode>(
  this: Cheerio<T>,
  names?: string[],
): Record<string, string> | undefined;
/**
 * Get the value of a style property for the first element in the set of matched
 * elements.
 *
 * @category CSS
 * @param name - The name of the property.
 * @returns The property value for the given name.
 * @see {@link https://api.jquery.com/css/}
 */
export function css<T extends AnyNode>(
  this: Cheerio<T>,
  name: string,
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
export function css<T extends AnyNode>(
  this: Cheerio<T>,
  prop: string,
  val: string | ((this: Element, i: number, style: string) => string | void),
): Cheerio<T>;
/**
 * Set multiple CSS properties for every matched element.
 *
 * @category CSS
 * @param map - A map of property names and values.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/css/}
 */
export function css<T extends AnyNode>(
  this: Cheerio<T>,
  map: Record<string, string>,
): Cheerio<T>;
/**
 * Set multiple CSS properties for every matched element.
 *
 * @category CSS
 * @param prop - The names of the properties.
 * @param val - The new values.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/css/}
 */
export function css<T extends AnyNode>(
  this: Cheerio<T>,
  prop?: string | string[] | Record<string, string>,
  val?: string | ((this: Element, i: number, style: string) => string | void),
): Cheerio<T> | Record<string, string> | string | undefined {
  if (
    (prop != null && val != null) ||
    // When `prop` is a "plain" object
    (typeof prop === 'object' && !Array.isArray(prop))
  ) {
    return domEach(this, (el, i) => {
      if (isTag(el)) {
        // `prop` can't be an array here anymore.
        setCss(el, prop as string, val, i);
      }
    });
  }

  if (this.length === 0) {
    return;
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
    | ((this: Element, i: number, style: string) => string | void)
    | undefined,
  idx: number,
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

    el.attribs['style'] = stringify(styles);
  } else if (typeof prop === 'object') {
    const keys = Object.keys(prop);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      setCss(el, k, prop[k], i);
    }
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
function getCss(el: AnyNode, props?: string[]): Record<string, string>;
/**
 * Get a property from the parsed styles of the first element.
 *
 * @private
 * @category CSS
 * @param el - Element to get styles from.
 * @param prop - Name of the prop.
 * @returns The value of the property.
 */
function getCss(el: AnyNode, prop: string): string | undefined;
function getCss(
  el: AnyNode,
  prop?: string | string[],
): Record<string, string> | string | undefined {
  if (!(el && isTag(el))) return;

  const styles = parse(el.attribs['style']);
  if (typeof prop === 'string') {
    return styles[prop];
  }
  if (Array.isArray(prop)) {
    const newStyles: Record<string, string> = {};
    for (const item of prop) {
      if (styles[item] != null) {
        newStyles[item] = styles[item];
      }
    }
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
    '',
  );
}

// Matches styles that could nest a `;` or `:` inside one of their values
const nestableValue = /["'()]/;

/**
 * Add the declaration `str` to `obj`.
 *
 * @private
 * @category CSS
 * @param obj - The styles parsed so far.
 * @param key - The property of the preceding declaration, if any.
 * @param str - The declaration to add.
 * @param n - The index of the colon separating property from value, or `-1`.
 * @returns The property to treat as preceding the next declaration.
 */
function addDeclaration(
  obj: Record<string, string>,
  key: string | undefined,
  str: string,
  n: number,
): string | undefined {
  // If there is no :, or if it is the first/last character, add to the previous item's value
  if (n < 1 || n === str.length - 1) {
    const trimmed = str.trimEnd();
    if (trimmed.length > 0 && key !== undefined) {
      obj[key] += `;${trimmed}`;
    }
    return key;
  }

  const prop = str.slice(0, n).trim();
  obj[prop] = str.slice(n + 1).trim();
  return prop;
}

/**
 * Parse the declarations of `styles`, skipping over strings and parentheses, so
 * that a `;` or `:` inside a value such as `url(data:image/png;base64,…)` does
 * not separate declarations.
 *
 * @private
 * @category CSS
 * @param obj - The object to add the parsed declarations to.
 * @param styles - Styles to be parsed.
 */
function parseNested(obj: Record<string, string>, styles: string): void {
  let key: string | undefined;
  let start = 0;
  let colon = -1;
  let depth = 0;
  let quote = '';

  for (let i = 0; i < styles.length; i++) {
    const char = styles[i];

    if (quote) {
      // Skip the character after a backslash, so `"\""` stays a single string
      if (char === '\\') i += 1;
      else if (char === quote) quote = '';
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === '(') {
      depth += 1;
      continue;
    }

    if (char === ')') {
      if (depth > 0) depth -= 1;
      continue;
    }

    if (depth > 0) continue;

    if (char === ':') {
      if (colon < 0) colon = i;
    } else if (char === ';') {
      const str = styles.slice(start, i);
      key = addDeclaration(obj, key, str, colon < 0 ? -1 : colon - start);
      start = i + 1;
      colon = -1;
    }
  }

  const str = styles.slice(start);
  addDeclaration(obj, key, str, colon < 0 ? -1 : colon - start);
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

  const obj: Record<string, string> = {};

  if (nestableValue.test(styles)) {
    parseNested(obj, styles);
    return obj;
  }

  let key: string | undefined;

  for (const str of styles.split(';')) {
    key = addDeclaration(obj, key, str, str.indexOf(':'));
  }

  return obj;
}
