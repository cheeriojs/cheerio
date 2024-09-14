/** @file Types used in signatures of Cheerio methods. */

type LowercaseLetters =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';

type AlphaNumeric =
  | `${number}`
  | LowercaseLetters
  | Uppercase<LowercaseLetters>;

type SelectorSpecial = '#' | '+' | '.' | ':' | '>' | '[' | '|' | '~';
/**
 * Type for identifying selectors. Allows us to "upgrade" queries using
 * selectors to return `Element`s.
 */
export type SelectorType =
  | `${AlphaNumeric}${string}`
  | `${SelectorSpecial}${AlphaNumeric}${string}`;

import type { AnyNode } from 'domhandler';

import type { Cheerio } from './cheerio.js';

/** Elements that can be passed to manipulation methods. */
export type BasicAcceptedElems<T extends AnyNode> = ArrayLike<T> | string | T;
/** Elements that can be passed to manipulation methods, including functions. */
export type AcceptedElems<T extends AnyNode> =
  | ((this: T, i: number, el: T) => BasicAcceptedElems<T>)
  | BasicAcceptedElems<T>;

/** Function signature, for traversal methods. */
export type FilterFunction<T> = (this: T, i: number, el: T) => boolean;
/** Supported filter types, for traversal methods. */
export type AcceptedFilters<T> = Cheerio<T> | FilterFunction<T> | string | T;
