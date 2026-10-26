/**
 * Methods for traversing the DOM structure.
 *
 * @module cheerio/traversing
 */

import * as select from 'cheerio-select';
import {
  type AnyNode,
  type Document,
  type Element,
  hasChildren,
  isDocument,
  isTag,
} from 'domhandler';
import {
  getChildren,
  getSiblings,
  nextElementSibling,
  prevElementSibling,
  uniqueSort,
} from 'domutils';
import type { Cheerio } from '../cheerio.js';
import { contains } from '../static.js';
import type { AcceptedFilters, FilterFunction } from '../types.js';
import { domEach, isCheerio } from '../utils.js';

const reContextSelector = /^\s*(?:[+~]|:scope\b)/;

/**
 * Matches the positional pseudo-classes that jQuery resolves against the whole
 * document (`:first`, `:last`, `:eq()`, `:lt()`, `:gt()`, `:even`, `:odd`, …).
 *
 * Evaluating them against a single element — or against the current selection —
 * gives a different answer, so calls that ask "does this element match?" have to
 * query the document first.
 *
 * @see {@link https://github.com/jquery/jquery/blob/main/src/selector/rbuggyQSA.js}
 */
const rePositionalSelector =
  /:(?:even|odd|eq|gt|lt|nth|first|last)(?:\([^)]*\)|)(?=[^-]|$)/i;

/**
 * Check whether a selector contains a positional pseudo-class.
 *
 * The regular expression alone is not precise enough: it also matches the same
 * text inside attribute values (`[data-x=":first"]`) and escaped identifiers
 * (`.foo\:first`), where it is literal text rather than a pseudo-class. Those
 * selectors do not need a document-wide lookup, so quoted, escaped and
 * attribute sections are skipped before testing.
 *
 * @private
 * @param selector - The selector to inspect.
 * @returns Whether the selector needs document context for matching.
 */
function _hasPositionalSelector(selector: string): boolean {
  if (!rePositionalSelector.test(selector)) {
    return false;
  }

  let unquoted = '';
  let quote: string | null = null;
  let attributeDepth = 0;

  for (let i = 0; i < selector.length; i++) {
    const char = selector[i];

    // Skip escaped characters, both inside and outside of quoted strings.
    if (char === '\\') {
      i += 1;
      continue;
    }

    if (quote) {
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === '[') {
      attributeDepth += 1;
      continue;
    }

    if (char === ']' && attributeDepth > 0) {
      attributeDepth -= 1;
      continue;
    }

    if (attributeDepth === 0) {
      unquoted += char;
    }
  }

  return rePositionalSelector.test(unquoted);
}

/**
 * Create a predicate that tests a single element against a selector.
 *
 * Selectors containing positional pseudo-classes are resolved against the
 * document — as jQuery does — instead of against the element alone. `cheerio` is
 * used to look up the document matches, and the result is cached for the caller.
 *
 * @private
 * @param cheerio - The selection the predicate is used from.
 * @param selector - The selector to test elements against.
 * @param options - Options used when matching plain selectors.
 * @returns A predicate for a single element.
 */
function _matcherFor(
  cheerio: Cheerio<AnyNode>,
  selector: string,
  options: select.Options = cheerio.options,
): (elem: Element) => boolean {
  if (!_hasPositionalSelector(selector)) {
    return (elem) => select.is(elem, selector, options);
  }

  const matched = new Set<AnyNode>(cheerio._make<AnyNode>(selector).toArray());
  return (elem) => matched.has(elem);
}

/**
 * Get the descendants of each element in the current set of matched elements,
 * filtered by a selector, jQuery object, or element.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('#fruits').find('li').length;
 * //=> 3
 * $('#fruits').find($('.apple')).length;
 * //=> 1
 * ```
 *
 * @param selectorOrHaystack - Element to look for.
 * @returns The found elements.
 * @see {@link https://api.jquery.com/find/}
 */
export function find<T extends AnyNode>(
  this: Cheerio<T>,
  selectorOrHaystack?: string | Cheerio<Element> | Element,
): Cheerio<Element> {
  if (!selectorOrHaystack) {
    return this._make([]);
  }

  if (typeof selectorOrHaystack !== 'string') {
    const haystack = isCheerio(selectorOrHaystack)
      ? selectorOrHaystack.toArray()
      : [selectorOrHaystack];

    const context = this.toArray();

    return this._make(
      haystack.filter((elem) => context.some((node) => contains(node, elem))),
    );
  }

  return this._findBySelector(selectorOrHaystack, Number.POSITIVE_INFINITY);
}

/**
 * Find elements by a specific selector.
 *
 * @private
 * @category Traversing
 * @param selector - Selector to filter by.
 * @param limit - Maximum number of elements to match.
 * @returns The found elements.
 */
export function _findBySelector<T extends AnyNode>(
  this: Cheerio<T>,
  selector: string,
  limit: number,
): Cheerio<Element> {
  const context = this.toArray();

  const elems = reContextSelector.test(selector)
    ? context
    : this.children().toArray();

  const options = {
    context,
    root: this._root?.[0],

    // Pass options that are recognized by `cheerio-select`
    xmlMode: this.options.xmlMode,
    lowerCaseTags: this.options.lowerCaseTags,
    lowerCaseAttributeNames: this.options.lowerCaseAttributeNames,
    pseudos: this.options.pseudos,
    quirksMode: this.options.quirksMode,
  };

  return this._make(select.select(selector, elems, options, limit));
}

/**
 * Creates a matcher, using a particular mapping function. Matchers provide a
 * function that finds elements using a generating function, supporting
 * filtering.
 *
 * @private
 * @param matchMap - Mapping function.
 * @returns - Function for wrapping generating functions.
 */
function _getMatcher<P>(
  matchMap: (fn: (elem: AnyNode) => P, elems: Cheerio<AnyNode>) => Element[],
) {
  return (
    fn: (elem: AnyNode) => P,
    ...postFns: ((elems: Element[]) => Element[])[]
  ) =>
    function <T extends AnyNode>(
      this: Cheerio<T>,
      selector?: AcceptedFilters<Element>,
    ): Cheerio<Element> {
      let matched: Element[] = matchMap(fn, this);

      if (selector) {
        matched = filterArray(
          matched,
          selector,
          this.options.xmlMode,
          this._root?.[0],
          this.options,
        );
      }

      return this._make(
        // Post processing is only necessary if there is more than one element.
        this.length > 1 && matched.length > 1
          ? postFns.reduce((elems, fn) => fn(elems), matched)
          : matched,
      );
    };
}

/** Matcher that adds multiple elements for each entry in the input. */
const _matcher = _getMatcher((fn: (elem: AnyNode) => Element[], elems) =>
  elems.toArray().flatMap((elem) => fn(elem)),
);

/** Matcher that adds at most one element for each entry in the input. */
const _singleMatcher = _getMatcher(
  (fn: (elem: AnyNode) => Element | null, elems) => {
    const ret: Element[] = [];

    for (let i = 0; i < elems.length; i++) {
      const value = fn(elems[i]);
      if (value !== null) {
        ret.push(value);
      }
    }
    return ret;
  },
);

/**
 * Matcher that supports traversing until a condition is met.
 *
 * @param nextElem - Function that returns the next element.
 * @param postFns - Post processing functions.
 * @returns A function usable for `*Until` methods.
 */
function _matchUntil(
  nextElem: (elem: AnyNode) => Element | null,
  ...postFns: ((elems: Element[]) => Element[])[]
) {
  // We use a variable here that is used from within the matcher.
  let matches: ((el: Element, i: number) => boolean) | null = null;

  const innerMatcher = _getMatcher(
    (nextElem: (elem: AnyNode) => Element | null, elems) => {
      const matched: Element[] = [];

      domEach(elems, (elem) => {
        let i = 0;
        for (let next; (next = nextElem(elem)); elem = next, i++) {
          // FIXME: `matched` might still contain duplicates across starting elements.
          if (matches?.(next, i)) break;
          matched.push(next);
        }
      });

      return matched;
    },
  )(nextElem, ...postFns);

  return function <T extends AnyNode>(
    this: Cheerio<T>,
    selector?: AcceptedFilters<Element> | null,
    filterSelector?: AcceptedFilters<Element>,
  ): Cheerio<Element> {
    // Override `matches` variable with the new target.
    matches =
      typeof selector === 'string'
        ? _matcherFor(this, selector)
        : selector
          ? getFilterFn(selector)
          : null;

    const ret = innerMatcher.call(this, filterSelector);

    // Set `matches` to `null`, so we don't waste memory.
    matches = null;

    return ret;
  };
}

function _removeDuplicates<T extends AnyNode>(elems: T[]): T[] {
  return elems.length > 1 ? [...new Set<T>(elems)] : elems;
}

/**
 * Get the parent of each element in the current set of matched elements,
 * optionally filtered by a selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.pear').parent().attr('id');
 * //=> fruits
 * ```
 *
 * @param selector - If specified filter for parent.
 * @returns The parents.
 * @see {@link https://api.jquery.com/parent/}
 */
export const parent: <T extends AnyNode>(
  this: Cheerio<T>,
  selector?: AcceptedFilters<Element>,
) => Cheerio<Element> = _singleMatcher(
  ({ parent }) => (parent && !isDocument(parent) ? (parent as Element) : null),
  _removeDuplicates,
);

/**
 * Get a set of parents filtered by `selector` of each element in the current
 * set of match elements.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.orange').parents().length;
 * //=> 2
 * $('.orange').parents('#fruits').length;
 * //=> 1
 * ```
 *
 * @param selector - If specified filter for parents.
 * @returns The parents.
 * @see {@link https://api.jquery.com/parents/}
 */
export const parents: <T extends AnyNode>(
  this: Cheerio<T>,
  selector?: AcceptedFilters<Element>,
) => Cheerio<Element> = _matcher(
  (elem) => {
    const matched: Element[] = [];
    while (elem.parent && !isDocument(elem.parent)) {
      matched.push(elem.parent as Element);
      elem = elem.parent;
    }
    return matched;
  },
  uniqueSort,
  // eslint-disable-next-line unicorn/no-array-reverse
  (elems) => elems.reverse(),
);

/**
 * Get the ancestors of each element in the current set of matched elements, up
 * to but not including the element matched by the selector, DOM node, or
 * cheerio object.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.orange').parentsUntil('#food').length;
 * //=> 1
 * ```
 *
 * @param selector - Selector for element to stop at.
 * @param filterSelector - Optional filter for parents.
 * @returns The parents.
 * @see {@link https://api.jquery.com/parentsUntil/}
 */
export const parentsUntil: <T extends AnyNode>(
  this: Cheerio<T>,
  selector?: AcceptedFilters<Element> | null,
  filterSelector?: AcceptedFilters<Element>,
) => Cheerio<Element> = _matchUntil(
  ({ parent }) => (parent && !isDocument(parent) ? (parent as Element) : null),
  uniqueSort,
  // eslint-disable-next-line unicorn/no-array-reverse
  (elems) => elems.reverse(),
);

/**
 * For each element in the set, get the first element that matches the selector
 * by testing the element itself and traversing up through its ancestors in the
 * DOM tree.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.orange').closest();
 * //=> []
 *
 * $('.orange').closest('.apple');
 * // => []
 *
 * $('.orange').closest('li');
 * //=> [<li class="orange">Orange</li>]
 *
 * $('.orange').closest('#fruits');
 * //=> [<ul id="fruits"> ... </ul>]
 * ```
 *
 * @param selector - Selector for the element to find.
 * @returns The closest nodes.
 * @see {@link https://api.jquery.com/closest/}
 */
export function closest<T extends AnyNode>(
  this: Cheerio<T>,
  selector?: AcceptedFilters<Element>,
): Cheerio<AnyNode> {
  const set: AnyNode[] = [];

  if (!selector) {
    return this._make(set);
  }

  const selectOpts = {
    ...this.options,
    root: this._root?.[0],
  };

  const selectFn =
    typeof selector === 'string'
      ? _matcherFor(this, selector, selectOpts)
      : getFilterFn(selector);

  /*
   * Dedup: a linear scan is cheapest for the small result sets `closest`
   * usually produces. Once the set grows past `dedupThreshold` we switch to a
   * Set, so a pathological input with many distinct matches stays O(n) instead
   * of O(n^2). `set` always preserves document order.
   */
  const dedupThreshold = 100;
  let seen: Set<AnyNode> | undefined;

  domEach(this, (elem: AnyNode | null) => {
    if (elem && !isDocument(elem) && !isTag(elem)) {
      elem = elem.parent;
    }
    while (elem && isTag(elem)) {
      if (selectFn(elem, 0)) {
        // Do not add duplicate elements to the set
        if (seen ? !seen.has(elem) : !set.includes(elem)) {
          set.push(elem);
          if (seen) {
            seen.add(elem);
          } else if (set.length > dedupThreshold) {
            seen = new Set(set);
          }
        }
        break;
      }
      elem = elem.parent;
    }
  });

  return this._make(set);
}

/**
 * Gets the next sibling of each selected element, optionally filtered by a
 * selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.apple').next().hasClass('orange');
 * //=> true
 * ```
 *
 * @param selector - If specified filter for sibling.
 * @returns The next nodes.
 * @see {@link https://api.jquery.com/next/}
 */
export const next: <T extends AnyNode>(
  this: Cheerio<T>,
  selector?: AcceptedFilters<Element>,
) => Cheerio<Element> = _singleMatcher((elem) => nextElementSibling(elem));

/**
 * Gets all the following siblings of the each selected element, optionally
 * filtered by a selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.apple').nextAll();
 * //=> [<li class="orange">Orange</li>, <li class="pear">Pear</li>]
 * $('.apple').nextAll('.orange');
 * //=> [<li class="orange">Orange</li>]
 * ```
 *
 * @param selector - If specified filter for siblings.
 * @returns The next nodes.
 * @see {@link https://api.jquery.com/nextAll/}
 */
export const nextAll: <T extends AnyNode>(
  this: Cheerio<T>,
  selector?: AcceptedFilters<Element>,
) => Cheerio<Element> = _matcher((elem) => {
  const matched = [];
  while (elem.next) {
    elem = elem.next;
    if (isTag(elem)) matched.push(elem);
  }
  return matched;
}, _removeDuplicates);

/**
 * Gets all the following siblings up to but not including the element matched
 * by the selector, optionally filtered by another selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.apple').nextUntil('.pear');
 * //=> [<li class="orange">Orange</li>]
 * ```
 *
 * @param selector - Selector for element to stop at.
 * @param filterSelector - If specified filter for siblings.
 * @returns The next nodes.
 * @see {@link https://api.jquery.com/nextUntil/}
 */
export const nextUntil: <T extends AnyNode>(
  this: Cheerio<T>,
  selector?: AcceptedFilters<Element> | null,
  filterSelector?: AcceptedFilters<Element>,
) => Cheerio<Element> = _matchUntil(
  (el) => nextElementSibling(el),
  _removeDuplicates,
);

/**
 * Gets the previous sibling of each selected element optionally filtered by a
 * selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.orange').prev().hasClass('apple');
 * //=> true
 * ```
 *
 * @param selector - If specified filter for siblings.
 * @returns The previous nodes.
 * @see {@link https://api.jquery.com/prev/}
 */
export const prev: <T extends AnyNode>(
  this: Cheerio<T>,
  selector?: AcceptedFilters<Element>,
) => Cheerio<Element> = _singleMatcher((elem) => prevElementSibling(elem));

/**
 * Gets all the preceding siblings of each selected element, optionally filtered
 * by a selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.pear').prevAll();
 * //=> [<li class="orange">Orange</li>, <li class="apple">Apple</li>]
 *
 * $('.pear').prevAll('.orange');
 * //=> [<li class="orange">Orange</li>]
 * ```
 *
 * @param selector - If specified filter for siblings.
 * @returns The previous nodes.
 * @see {@link https://api.jquery.com/prevAll/}
 */
export const prevAll: <T extends AnyNode>(
  this: Cheerio<T>,
  selector?: AcceptedFilters<Element>,
) => Cheerio<Element> = _matcher((elem) => {
  const matched = [];
  while (elem.prev) {
    elem = elem.prev;
    if (isTag(elem)) matched.push(elem);
  }
  return matched;
}, _removeDuplicates);

/**
 * Gets all the preceding siblings up to but not including the element matched
 * by the selector, optionally filtered by another selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.pear').prevUntil('.apple');
 * //=> [<li class="orange">Orange</li>]
 * ```
 *
 * @param selector - Selector for element to stop at.
 * @param filterSelector - If specified filter for siblings.
 * @returns The previous nodes.
 * @see {@link https://api.jquery.com/prevUntil/}
 */
export const prevUntil: <T extends AnyNode>(
  this: Cheerio<T>,
  selector?: AcceptedFilters<Element> | null,
  filterSelector?: AcceptedFilters<Element>,
) => Cheerio<Element> = _matchUntil(
  (el) => prevElementSibling(el),
  _removeDuplicates,
);

/**
 * Get the siblings of each element (excluding the element) in the set of
 * matched elements, optionally filtered by a selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.pear').siblings().length;
 * //=> 2
 *
 * $('.pear').siblings('.orange').length;
 * //=> 1
 * ```
 *
 * @param selector - If specified filter for siblings.
 * @returns The siblings.
 * @see {@link https://api.jquery.com/siblings/}
 */
export const siblings: <T extends AnyNode>(
  this: Cheerio<T>,
  selector?: AcceptedFilters<Element>,
) => Cheerio<Element> = _matcher(
  (elem) =>
    getSiblings(elem).filter((el): el is Element => isTag(el) && el !== elem),
  uniqueSort,
);

/**
 * Gets the element children of each element in the set of matched elements.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('#fruits').children().length;
 * //=> 3
 *
 * $('#fruits').children('.pear').text();
 * //=> Pear
 * ```
 *
 * @param selector - If specified filter for children.
 * @returns The children.
 * @see {@link https://api.jquery.com/children/}
 */
export const children: <T extends AnyNode>(
  this: Cheerio<T>,
  selector?: AcceptedFilters<Element>,
) => Cheerio<Element> = _matcher(
  (elem) => getChildren(elem).filter(isTag),
  _removeDuplicates,
);

/**
 * Gets the children of each element in the set of matched elements, including
 * text and comment nodes.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('#fruits').contents().length;
 * //=> 3
 * ```
 *
 * @returns The children.
 * @see {@link https://api.jquery.com/contents/}
 */
export function contents<T extends AnyNode>(
  this: Cheerio<T>,
): Cheerio<AnyNode> {
  const elems = this.toArray().flatMap((elem) =>
    hasChildren(elem) ? elem.children : [],
  );
  return this._make(elems);
}

/**
 * Iterates over a cheerio object, executing a function for each matched
 * element. When the callback is fired, the function is fired in the context of
 * the DOM element, so `this` refers to the current element, which is equivalent
 * to the function parameter `element`. To break out of the `each` loop early,
 * return with `false`.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * const fruits = [];
 *
 * $('li').each(function (i, elem) {
 *   fruits[i] = $(this).text();
 * });
 *
 * fruits.join(', ');
 * //=> Apple, Orange, Pear
 * ```
 *
 * @param fn - Function to execute.
 * @returns The instance itself, useful for chaining.
 * @see {@link https://api.jquery.com/each/}
 */
export function each<T>(
  this: Cheerio<T>,
  fn: (this: T, i: number, el: T) => void | boolean,
): Cheerio<T> {
  let i = 0;
  const len = this.length;
  while (i < len && fn.call(this[i], i, this[i]) !== false) ++i;
  return this;
}

/**
 * Pass each element in the current matched set through a function, producing a
 * new Cheerio object containing the return values. The function can return an
 * individual data item or an array of data items to be inserted into the
 * resulting set. If an array is returned, the elements inside the array are
 * inserted into the set. If the function returns null or undefined, no element
 * will be inserted.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('li')
 *   .map(function (i, el) {
 *     // this === el
 *     return $(this).text();
 *   })
 *   .toArray()
 *   .join(' ');
 * //=> "apple orange pear"
 * ```
 *
 * @param fn - Function to execute.
 * @returns The mapped elements, wrapped in a Cheerio collection.
 * @see {@link https://api.jquery.com/map/}
 */
export function map<T, M>(
  this: Cheerio<T>,
  fn: (this: T, i: number, el: T) => M[] | M | null | undefined,
): Cheerio<M> {
  const elems: M[] = [];
  for (let i = 0; i < this.length; i++) {
    const el = this[i];
    const val = fn.call(el, i, el);
    if (val != null) {
      /*
       * Accumulate in place; `concat` would copy the whole array each
       * iteration, making this O(n^2) in the size of the collection.
       */
      if (Array.isArray(val)) {
        for (let j = 0; j < val.length; j++) elems.push(val[j]);
      } else {
        elems.push(val);
      }
    }
  }
  return this._make(elems);
}

/**
 * Creates a function to test if a filter is matched.
 *
 * @param match - A filter.
 * @returns A function that determines if a filter has been matched.
 */
function getFilterFn<T>(
  match: FilterFunction<T> | Cheerio<T> | T,
): (el: T, i: number) => boolean {
  if (typeof match === 'function') {
    return (el, i) => (match as FilterFunction<T>).call(el, i, el);
  }
  if (isCheerio<T>(match)) {
    return (el) => Array.prototype.includes.call(match, el);
  }
  return (el) => match === el;
}

/**
 * Iterates over a cheerio object, reducing the set of selector elements to
 * those that match the selector or pass the function's test.
 *
 * This is the definition for using type guards; have a look below for other
 * ways to invoke this method. The function is executed in the context of the
 * selected element, so `this` refers to the current element.
 *
 * @category Traversing
 * @example <caption>Function</caption>
 *
 * ```js
 * $('li')
 *   .filter(function (i, el) {
 *     // this === el
 *     return $(this).attr('class') === 'orange';
 *   })
 *   .attr('class'); //=> orange
 * ```
 *
 * @param match - Value to look for, following the rules above.
 * @returns The filtered collection.
 * @see {@link https://api.jquery.com/filter/}
 */
export function filter<T, S extends T>(
  this: Cheerio<T>,
  match: (this: T, index: number, value: T) => value is S,
): Cheerio<S>;
/**
 * Iterates over a cheerio object, reducing the set of selector elements to
 * those that match the selector or pass the function's test.
 *
 * - When a Cheerio selection is specified, return only the elements contained in
 *   that selection.
 * - When an element is specified, return only that element (if it is contained in
 *   the original selection).
 * - If using the function method, the function is executed in the context of the
 *   selected element, so `this` refers to the current element.
 *
 * @category Traversing
 * @example <caption>Selector</caption>
 *
 * ```js
 * $('li').filter('.orange').attr('class');
 * //=> orange
 * ```
 *
 * @example <caption>Function</caption>
 *
 * ```js
 * $('li')
 *   .filter(function (i, el) {
 *     // this === el
 *     return $(this).attr('class') === 'orange';
 *   })
 *   .attr('class'); //=> orange
 * ```
 *
 * @param match - Value to look for, following the rules above. See
 *   {@link AcceptedFilters}.
 * @returns The filtered collection.
 * @see {@link https://api.jquery.com/filter/}
 */
export function filter<T, S extends AcceptedFilters<T>>(
  this: Cheerio<T>,
  match: S,
): Cheerio<S extends string ? Element : T>;
export function filter<T>(
  this: Cheerio<T>,
  match: AcceptedFilters<T>,
): Cheerio<unknown> {
  return this._make<unknown>(
    filterArray(
      this.toArray(),
      match,
      this.options.xmlMode,
      this._root?.[0],
      this.options,
    ),
  );
}

/**
 * Filter an array of nodes with either a selector or predicate.
 *
 * @param nodes - The nodes to filter.
 * @param match - Selector or predicate used to keep nodes.
 * @param xmlMode - Whether selector matching should use XML mode.
 * @param root - Optional document root used for selector matching.
 * @param options - Options used for selector matching.
 */
export function filterArray<T>(
  nodes: T[],
  match: AcceptedFilters<T>,
  xmlMode?: boolean,
  root?: Document,
  options?: select.Options,
): Element[] | T[] {
  return typeof match === 'string'
    ? select.filter(match, nodes as unknown as AnyNode[], {
        ...options,
        xmlMode: xmlMode ?? options?.xmlMode,
        root: root ?? options?.root,
      })
    : nodes.filter(getFilterFn<T>(match));
}

/**
 * Checks the current list of elements and returns `true` if _any_ of the
 * elements match the selector. If using an element or Cheerio selection,
 * returns `true` if _any_ of the elements match. If using a predicate function,
 * the function is executed in the context of the selected element, so `this`
 * refers to the current element.
 *
 * @category Traversing
 * @param selector - Selector for the selection.
 * @returns Whether or not the selector matches an element of the instance.
 * @see {@link https://api.jquery.com/is/}
 */
export function is<T>(
  this: Cheerio<T>,
  selector?: AcceptedFilters<T>,
): boolean {
  const nodes = this.toArray();

  if (typeof selector === 'string') {
    /*
     * Positional selectors are document-relative: jQuery resolves them against
     * the whole document and checks whether any element of the selection is part
     * of the result.
     */
    if (_hasPositionalSelector(selector)) {
      const matched = new Set<AnyNode>(this._make<AnyNode>(selector).toArray());
      return nodes.some((node) => matched.has(node as AnyNode));
    }

    return select.some(
      (nodes as unknown as AnyNode[]).filter(isTag),
      selector,
      this.options,
    );
  }

  return selector ? nodes.some(getFilterFn<T>(selector)) : false;
}

/**
 * Remove elements from the set of matched elements. Given a Cheerio object that
 * represents a set of DOM elements, the `.not()` method constructs a new
 * Cheerio object from a subset of the matching elements. The supplied selector
 * is tested against each element; the elements that don't match the selector
 * will be included in the result.
 *
 * The `.not()` method can take a function as its argument in the same way that
 * `.filter()` does. Elements for which the function returns `true` are excluded
 * from the filtered set; all other elements are included.
 *
 * @category Traversing
 * @example <caption>Selector</caption>
 *
 * ```js
 * $('li').not('.apple').length;
 * //=> 2
 * ```
 *
 * @example <caption>Function</caption>
 *
 * ```js
 * $('li').not(function (i, el) {
 *   // this === el
 *   return $(this).attr('class') === 'orange';
 * }).length; //=> 2
 * ```
 *
 * @param match - Value to look for, following the rules above.
 * @returns The filtered collection.
 * @see {@link https://api.jquery.com/not/}
 */
export function not<T extends AnyNode>(
  this: Cheerio<T>,
  match: AcceptedFilters<T>,
): Cheerio<T> {
  let nodes = this.toArray();

  if (typeof match === 'string') {
    const matches = new Set<AnyNode>(select.filter(match, nodes, this.options));
    nodes = nodes.filter((el) => !matches.has(el));
  } else {
    const filterFn = getFilterFn(match);
    nodes = nodes.filter((el, i) => !filterFn(el, i));
  }

  return this._make(nodes);
}

/**
 * Filters the set of matched elements to only those which have the given DOM
 * element as a descendant or which have a descendant that matches the given
 * selector. Equivalent to `.filter(':has(selector)')`.
 *
 * @category Traversing
 * @example <caption>Selector</caption>
 *
 * ```js
 * $('ul').has('.pear').attr('id');
 * //=> fruits
 * ```
 *
 * @example <caption>Element</caption>
 *
 * ```js
 * $('ul').has($('.pear')[0]).attr('id');
 * //=> fruits
 * ```
 *
 * @param selectorOrHaystack - Element to look for.
 * @returns The filtered collection.
 * @see {@link https://api.jquery.com/has/}
 */
export function has(
  this: Cheerio<AnyNode | Element>,
  selectorOrHaystack: string | Cheerio<Element> | Element,
): Cheerio<AnyNode | Element> {
  /*
   * `:has()` short-circuits searches, but it cannot represent positional
   * selectors such as `:first`. Use a descendant search for those.
   */
  const useHasSelector =
    typeof selectorOrHaystack === 'string' &&
    !_hasPositionalSelector(selectorOrHaystack);

  return this.filter(
    useHasSelector
      ? `:has(${selectorOrHaystack})`
      : (_, el) => this._make(el).find(selectorOrHaystack).length > 0,
  );
}

/**
 * Will select the first element of a cheerio object.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('#fruits').children().first().text();
 * //=> Apple
 * ```
 *
 * @returns The first element.
 * @see {@link https://api.jquery.com/first/}
 */
export function first<T extends AnyNode>(this: Cheerio<T>): Cheerio<T> {
  return this.length > 1 ? this._make(this[0]) : this;
}

/**
 * Will select the last element of a cheerio object.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('#fruits').children().last().text();
 * //=> Pear
 * ```
 *
 * @returns The last element.
 * @see {@link https://api.jquery.com/last/}
 */
export function last<T>(this: Cheerio<T>): Cheerio<T> {
  return this.length > 0 ? this._make(this[this.length - 1]) : this;
}

/**
 * Reduce the set of matched elements to the one at the specified index. Use
 * `.eq(-i)` to count backwards from the last selected element.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('li').eq(0).text();
 * //=> Apple
 *
 * $('li').eq(-1).text();
 * //=> Pear
 * ```
 *
 * @param i - Index of the element to select.
 * @returns The element at the `i`th position.
 * @see {@link https://api.jquery.com/eq/}
 */
export function eq<T>(this: Cheerio<T>, i: number): Cheerio<T> {
  /*
   * Not redundant: JavaScript callers pass string indices, and `eq('-1')`
   * would otherwise reach `this.length + i` as string concatenation.
   */
  // eslint-disable-next-line unicorn/no-useless-coercion
  i = +i;

  // Use the first identity optimization if possible
  if (i === 0 && this.length <= 1) return this;

  if (i < 0) i = this.length + i;
  return this._make(this[i] ?? []);
}

/**
 * Retrieve one of the elements matched by the Cheerio object, at the `i`th
 * position.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('li').get(0).tagName;
 * //=> li
 * ```
 *
 * @param i - Element to retrieve.
 * @returns The element at the `i`th position.
 * @see {@link https://api.jquery.com/get/}
 */
export function get<T>(this: Cheerio<T>, i: number): T | undefined;
/**
 * Retrieve all elements matched by the Cheerio object, as an array.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('li').get().length;
 * //=> 3
 * ```
 *
 * @returns All elements matched by the Cheerio object.
 * @see {@link https://api.jquery.com/get/}
 */
export function get<T>(this: Cheerio<T>): T[];
export function get<T>(this: Cheerio<T>, i?: number): T | T[] {
  if (i == null) {
    return this.toArray();
  }
  return this[i < 0 ? this.length + i : i];
}

/**
 * Retrieve all the DOM elements contained in the jQuery set as an array.
 *
 * @example
 *
 * ```js
 * $('li').toArray();
 * //=> [ {...}, {...}, {...} ]
 * ```
 *
 * @returns The contained items.
 */
export function toArray<T>(this: Cheerio<T>): T[] {
  return (Array.prototype as T[]).slice.call(this);
}

/**
 * Search for a given element from among the matched elements.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.pear').index();
 * //=> 2 $('.orange').index('li');
 * //=> 1
 * $('.apple').index($('#fruit, li'));
 * //=> 1
 * ```
 *
 * @param selectorOrNeedle - Element to look for.
 * @returns The index of the element.
 * @see {@link https://api.jquery.com/index/}
 */
export function index<T extends AnyNode>(
  this: Cheerio<T>,
  selectorOrNeedle?: string | Cheerio<AnyNode> | AnyNode,
): number {
  let $haystack: Cheerio<AnyNode>;
  let needle: AnyNode;

  if (selectorOrNeedle == null) {
    $haystack = this.parent().children();
    needle = this[0];
  } else if (typeof selectorOrNeedle === 'string') {
    $haystack = this._make<AnyNode>(selectorOrNeedle);
    needle = this[0];
  } else {
    // eslint-disable-next-line unicorn/no-this-assignment
    $haystack = this;
    needle = isCheerio(selectorOrNeedle)
      ? selectorOrNeedle[0]
      : selectorOrNeedle;
  }

  return Array.prototype.indexOf.call($haystack, needle);
}

/**
 * Gets the elements matching the specified range (0-based position).
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('li').slice(1).eq(0).text();
 * //=> 'Orange'
 *
 * $('li').slice(1, 2).length;
 * //=> 1
 * ```
 *
 * @param start - A position at which the elements begin to be selected. If
 *   negative, it indicates an offset from the end of the set.
 * @param end - A position at which the elements stop being selected. If
 *   negative, it indicates an offset from the end of the set. If omitted, the
 *   range continues until the end of the set.
 * @returns The elements matching the specified range.
 * @see {@link https://api.jquery.com/slice/}
 */
export function slice<T>(
  this: Cheerio<T>,
  start?: number,
  end?: number,
): Cheerio<T> {
  return this._make<T>(Array.prototype.slice.call(this, start, end));
}

/**
 * End the most recent filtering operation in the current chain and return the
 * set of matched elements to its previous state.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('li').eq(0).end().length;
 * //=> 3
 * ```
 *
 * @returns The previous state of the set of matched elements.
 * @see {@link https://api.jquery.com/end/}
 */
export function end<T>(this: Cheerio<T>): Cheerio<AnyNode> {
  return (this.prevObject as Cheerio<AnyNode> | null) ?? this._make([]);
}

/**
 * Add elements to the set of matched elements.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('.apple').add('.orange').length;
 * //=> 2
 * ```
 *
 * @param other - Elements to add.
 * @param context - Optionally the context of the new selection.
 * @returns The combined set.
 * @see {@link https://api.jquery.com/add/}
 */
export function add<S extends AnyNode, T extends AnyNode>(
  this: Cheerio<T>,
  other: string | Cheerio<S> | S | S[],
  context?: Cheerio<S> | string,
): Cheerio<S | T> {
  const selection = this._make(other, context);
  const contents = uniqueSort([...this.get(), ...selection.get()]);
  return this._make(contents);
}

/**
 * Add the previous set of elements on the stack to the current set, optionally
 * filtered by a selector.
 *
 * @category Traversing
 * @example
 *
 * ```js
 * $('li').eq(0).addBack('.orange').length;
 * //=> 2
 * ```
 *
 * @param selector - Selector for the elements to add.
 * @returns The combined set.
 * @see {@link https://api.jquery.com/addBack/}
 */
export function addBack<T extends AnyNode>(
  this: Cheerio<T>,
  selector?: string,
): Cheerio<AnyNode> {
  return this.prevObject
    ? this.add<AnyNode, T>(
        selector ? this.prevObject.filter(selector) : this.prevObject,
      )
    : this;
}
