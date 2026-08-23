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

  let key: string | undefined;

  for (const str of splitDeclarations(styles)) {
    const n = str.indexOf(':');
    // If there is no :, or if it is the first/last character, add to the previous item's value
    if (n < 1 || n === str.length - 1) {
      const trimmed = str.trimEnd();
      if (trimmed.length > 0 && key !== undefined) {
        obj[key] += `;${trimmed}`;
      }
    } else {
      key = str.slice(0, n).trim();
      obj[key] = str.slice(n + 1).trim();
    }
  }

  return obj;
}

/**
 * Split a style attribute into declarations at top-level semicolons only.
 * Semicolons inside quoted strings, comments, or any block (parentheses such
 * as data URIs in `url(...)`, braces, brackets) do not terminate a
 * declaration.
 *
 * @private
 * @category CSS
 * @param styles - The style attribute value.
 * @returns The individual declarations.
 */
function splitDeclarations(styles: string): string[] {
  const declarations: string[] = [];
  let start = 0;
  let quote: string | undefined;
  let inComment = false;
  let urlDepth = 0;
  let depth = 0;

  for (let i = 0; i < styles.length; i++) {
    const ch = styles.charCodeAt(i);

    if (inComment) {
      if (
        ch === 42 /* Asterisk */ &&
        styles.charCodeAt(i + 1) === 47 /* Slash */
      ) {
        inComment = false;
        i++;
      }
      continue;
    }
    if (quote !== undefined) {
      if (ch === 92 /* Backslash */) {
        i++;
      } else if (styles[i] === quote) {
        quote = undefined;
      }
      continue;
    }
    if (ch === 92 /* Backslash */) {
      // An escaped character is data, not structure.
      i++;
      continue;
    }
    if (
      urlDepth === 0 &&
      ch === 47 /* Slash */ &&
      styles.charCodeAt(i + 1) === 42 /* Asterisk */
    ) {
      /*
       * Comments are recognized everywhere except inside an unquoted
       * `url()` token, where CSS treats the characters as part of the URL.
       */
      inComment = true;
      i++;
      continue;
    }
    if (
      urlDepth === 0 &&
      (ch === 34 /* Double quote */ || ch === 39) /* Single quote */
    ) {
      quote = styles[i];
      continue;
    }
    if (ch === 40 /* Opening parenthesis */) {
      depth++;
      // `url(` starts a URL token unless the value is a quoted string,
      // which the quote branch above handles as an ordinary string.
      if (urlDepth === 0 && isUrlToken(styles, i)) {
        urlDepth = depth;
      }
      continue;
    }
    if (ch === 41 /* Closing parenthesis */) {
      if (depth > 0) {
        if (urlDepth === depth) urlDepth = 0;
        depth--;
      }
      continue;
    }
    if (ch === 123 /* Opening brace */ || ch === 91 /* Opening bracket */) {
      depth++;
      continue;
    }
    if (ch === 125 /* Closing brace */ || ch === 93 /* Closing bracket */) {
      if (depth > 0) depth--;
      continue;
    }
    if (ch === 59 /* Semicolon */ && depth === 0) {
      declarations.push(styles.slice(start, i));
      start = i + 1;
    }
  }

  declarations.push(styles.slice(start));

  return declarations;
}

const WHITESPACE_RE = /\s/;

/**
 * Whether the opening parenthesis at `index` begins an unquoted `url()` token.
 *
 * @private
 * @category CSS
 * @param styles - The style attribute value.
 * @param index - Index of the opening parenthesis.
 * @returns Whether this parenthesis opens a URL token.
 */
function isUrlToken(styles: string, index: number): boolean {
  if (index < 3 || styles.slice(index - 3, index).toLowerCase() !== 'url') {
    return false;
  }
  // A quoted url("...") is a normal string, handled by the quote branch.
  let next = index + 1;
  while (next < styles.length && WHITESPACE_RE.test(styles[next])) next++;
  const nextCh = styles.charCodeAt(next);
  return nextCh !== 34 /* Double quote */ && nextCh !== 39 /* Single quote */;
}
