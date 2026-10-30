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
 * Whether a code point can be part of a CSS identifier.
 *
 * @param char - The character to check.
 * @returns Whether the character is an identifier code point.
 */
function isIdentChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    code >= 0x80 || // Non-ASCII is always an identifier code point in CSS.
    (code >= 0x30 && code <= 0x39) ||
    (code >= 0x41 && code <= 0x5a) ||
    (code >= 0x61 && code <= 0x7a) ||
    char === '-' ||
    char === '_' ||
    char === '\\'
  );
}

/**
 * Split a `style` attribute into individual declarations. Semicolons inside
 * quoted strings, comments, or parentheses (as in
 * `url("data:image/svg+xml;utf8,...")`) do not terminate a declaration.
 *
 * @param styles - Styles to be split.
 * @returns The individual declarations.
 */
function splitDeclarations(styles: string): string[] {
  const declarations: string[] = [];

  let quote: string | undefined;
  let url = false;
  let depth = 0;
  let start = 0;

  for (let i = 0; i < styles.length; i++) {
    const char = styles[i];

    if (url) {
      /*
       * Inside an unquoted url() token, content is consumed raw until the
       * closing parenthesis; comments and quotes are not recognized there.
       */
      if (char === '\\') {
        i++; // Skip the escaped character.
      } else if (char === ')') {
        url = false;
      }

      continue;
    }

    if (quote !== undefined) {
      if (char === '\\') {
        i++; // Skip the escaped character.
      } else if (
        char === quote ||
        /*
         * An unescaped newline ends a (bad) string per CSS Syntax; later
         * declarations must not be swallowed into it.
         */
        ['\n', '\r', '\f'].includes(char)
      ) {
        quote = undefined;
      }

      continue;
    }

    if (char === '\\') {
      i++; // Skip escaped characters outside of quotes, such as `\\;`.
      continue;
    }

    if (char === '/' && styles[i + 1] === '*') {
      // Skip CSS comments; they may contain semicolons.
      const end = styles.indexOf('*/', i + 2);
      i = end === -1 ? styles.length : end + 1;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === '(') {
      /*
       * `url(` directly after the identifier `url` starts an unquoted URL
       * token unless its argument is quoted.
       */
      if (
        i >= 3 &&
        ['u', 'U'].includes(styles[i - 3]) &&
        ['r', 'R'].includes(styles[i - 2]) &&
        ['l', 'L'].includes(styles[i - 1]) &&
        (i === 3 || !isIdentChar(styles[i - 4]))
      ) {
        let j = i + 1;

        while (j < styles.length && [' ', '\t', '\n', '\r', '\f'].includes(styles[j])) {
          j++;
        }

        if (styles[j] !== '"' && styles[j] !== "'") {
          url = true;
          continue;
        }
      }

      depth++;
      continue;
    }

    if (char === ')') {
      if (depth > 0) depth--;
      continue;
    }

    if (char === ';' && depth === 0) {
      declarations.push(styles.slice(start, i));
      start = i + 1;
    }
  }

  declarations.push(styles.slice(start));

  return declarations;
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
