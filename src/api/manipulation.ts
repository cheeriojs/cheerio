import { hasChildren } from 'domhandler';
/**
 * Methods for modifying the DOM structure.
 *
 * @module cheerio/manipulation
 */

import { Node, NodeWithChildren, Element, Text } from 'domhandler';
import { default as parse, update as updateDOM } from '../parse';
import { html as staticHtml, text as staticText } from '../static';
import { domEach, cloneDom, isTag, isHtml, isCheerio } from '../utils';
import { DomUtils } from 'htmlparser2';
import type { Cheerio } from '../cheerio';
import type { BasicAcceptedElems, AcceptedElems } from '../types';

/**
 * Create an array of nodes, recursing into arrays and parsing strings if necessary.
 *
 * @private
 * @category Manipulation
 * @param elem - Elements to make an array of.
 * @param clone - Optionally clone nodes.
 * @returns The array of nodes.
 */
export function _makeDomArray<T extends Node>(
  this: Cheerio<T>,
  elem?: BasicAcceptedElems<Node>,
  clone?: boolean
): Node[] {
  if (elem == null) {
    return [];
  }
  if (isCheerio(elem)) {
    return clone ? cloneDom(elem.get()) : elem.get();
  }
  if (Array.isArray(elem)) {
    return elem.reduce<Node[]>(
      (newElems, el) => newElems.concat(this._makeDomArray(el, clone)),
      []
    );
  }
  if (typeof elem === 'string') {
    return parse(elem, this.options, false).children;
  }
  return clone ? cloneDom([elem]) : [elem];
}

function _insert(
  concatenator: (
    dom: Node[],
    children: Node[],
    parent: NodeWithChildren
  ) => void
) {
  return function <T extends Node>(
    this: Cheerio<T>,
    ...elems:
      | [(this: Node, i: number, html: string) => BasicAcceptedElems<Node>]
      | BasicAcceptedElems<Node>[]
  ) {
    const lastIdx = this.length - 1;

    return domEach(this, (i, el) => {
      if (!hasChildren(el)) return;
      const domSrc =
        typeof elems[0] === 'function'
          ? elems[0].call(el, i, staticHtml(el.children))
          : (elems as Node[]);

      const dom = this._makeDomArray(domSrc, i < lastIdx);
      concatenator(dom, el.children, el);
    });
  };
}

/**
 * Modify an array in-place, removing some number of elements and adding new
 * elements directly following them.
 *
 * @private
 * @category Manipulation
 * @param array - Target array to splice.
 * @param spliceIdx - Index at which to begin changing the array.
 * @param spliceCount - Number of elements to remove from the array.
 * @param newElems - Elements to insert into the array.
 * @param parent - The parent of the node.
 * @returns The spliced array.
 */
function uniqueSplice(
  array: Node[],
  spliceIdx: number,
  spliceCount: number,
  newElems: Node[],
  parent: NodeWithChildren
): Node[] {
  const spliceArgs: Parameters<typeof Array.prototype.splice> = [
    spliceIdx,
    spliceCount,
    ...newElems,
  ];
  const prev: Node | null = array[spliceIdx - 1] || null;
  const next: Node | null = array[spliceIdx + spliceCount] || null;

  /*
   * Before splicing in new elements, ensure they do not already appear in the
   * current array.
   */
  for (let idx = 0; idx < newElems.length; ++idx) {
    const node = newElems[idx];
    const oldParent = node.parent;

    if (oldParent) {
      const prevIdx = oldParent.children.indexOf(newElems[idx]);

      if (prevIdx > -1) {
        oldParent.children.splice(prevIdx, 1);
        if (parent === oldParent && spliceIdx > prevIdx) {
          spliceArgs[0]--;
        }
      }
    }

    node.parent = parent;

    if (node.prev) {
      node.prev.next = node.next ?? null;
    }

    if (node.next) {
      node.next.prev = node.prev ?? null;
    }

    node.prev = newElems[idx - 1] || prev;
    node.next = newElems[idx + 1] || next;
  }

  if (prev) {
    prev.next = newElems[0];
  }
  if (next) {
    next.prev = newElems[newElems.length - 1];
  }
  return array.splice(...spliceArgs);
}

/**
 * Insert every element in the set of matched elements to the end of the target.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('<li class="plum">Plum</li>').appendTo('#fruits');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //      <li class="plum">Plum</li>
 * //    </ul>
 * ```
 *
 * @param target - Element to append elements to.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/appendTo/}
 */
export function appendTo<T extends Node>(
  this: Cheerio<T>,
  target: BasicAcceptedElems<Node>
): Cheerio<T> {
  const appendTarget = isCheerio(target) ? target : this._make(target);

  appendTarget.append(this);

  return this;
}

/**
 * Insert every element in the set of matched elements to the beginning of the target.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('<li class="plum">Plum</li>').prependTo('#fruits');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="plum">Plum</li>
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 * ```
 *
 * @param target - Element to prepend elements to.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/prependTo/}
 */
export function prependTo<T extends Node>(
  this: Cheerio<T>,
  target: BasicAcceptedElems<Node>
): Cheerio<T> {
  const prependTarget = isCheerio(target) ? target : this._make(target);

  prependTarget.prepend(this);

  return this;
}

/**
 * Inserts content as the *last* child of each of the selected elements.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('ul').append('<li class="plum">Plum</li>');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //      <li class="plum">Plum</li>
 * //    </ul>
 * ```
 *
 * @see {@link https://api.jquery.com/append/}
 */
export const append = _insert((dom, children, parent) => {
  uniqueSplice(children, children.length, 0, dom, parent);
});

/**
 * Inserts content as the *first* child of each of the selected elements.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('ul').prepend('<li class="plum">Plum</li>');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="plum">Plum</li>
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 * ```
 *
 * @see {@link https://api.jquery.com/prepend/}
 */
export const prepend = _insert((dom, children, parent) => {
  uniqueSplice(children, 0, 0, dom, parent);
});

function _wrap(
  insert: (
    el: Node,
    elInsertLocation: NodeWithChildren,
    wrapperDom: NodeWithChildren[]
  ) => void
) {
  return function <T extends Node>(
    this: Cheerio<T>,
    wrapper: AcceptedElems<Node>
  ) {
    const lastIdx = this.length - 1;
    const lastParent = this.parents().last();

    for (let i = 0; i < this.length; i++) {
      const el = this[i];

      const wrap =
        typeof wrapper === 'function'
          ? wrapper.call(el, i, el)
          : typeof wrapper === 'string' && !isHtml(wrapper)
          ? lastParent.find(wrapper).clone()
          : wrapper;

      const [wrapperDom] = this._makeDomArray(wrap, i < lastIdx);

      if (!wrapperDom || !DomUtils.hasChildren(wrapperDom)) continue;

      let elInsertLocation = wrapperDom;

      /*
       * Find the deepest child. Only consider the first tag child of each node
       * (ignore text); stop if no children are found.
       */
      let j = 0;

      while (j < elInsertLocation.children.length) {
        const child = elInsertLocation.children[j];
        if (isTag(child)) {
          elInsertLocation = child;
          j = 0;
        } else {
          j++;
        }
      }

      insert(el, elInsertLocation, [wrapperDom]);
    }

    return this;
  };
}

/**
 * The .wrap() function can take any string or object that could be passed to
 * the $() factory function to specify a DOM structure. This structure may be
 * nested several levels deep, but should contain only one inmost element. A
 * copy of this structure will be wrapped around each of the elements in the set
 * of matched elements. This method returns the original set of elements for
 * chaining purposes.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * const redFruit = $('<div class="red-fruit"></div>');
 * $('.apple').wrap(redFruit);
 *
 * //=> <ul id="fruits">
 * //     <div class="red-fruit">
 * //      <li class="apple">Apple</li>
 * //     </div>
 * //     <li class="orange">Orange</li>
 * //     <li class="plum">Plum</li>
 * //   </ul>
 *
 * const healthy = $('<div class="healthy"></div>');
 * $('li').wrap(healthy);
 *
 * //=> <ul id="fruits">
 * //     <div class="healthy">
 * //       <li class="apple">Apple</li>
 * //     </div>
 * //     <div class="healthy">
 * //       <li class="orange">Orange</li>
 * //     </div>
 * //     <div class="healthy">
 * //        <li class="plum">Plum</li>
 * //     </div>
 * //   </ul>
 * ```
 *
 * @param wrapper - The DOM structure to wrap around each element in the selection.
 * @see {@link https://api.jquery.com/wrap/}
 */
export const wrap = _wrap((el, elInsertLocation, wrapperDom) => {
  const { parent } = el;

  if (!parent) return;

  const siblings = parent.children;
  const index = siblings.indexOf(el);

  updateDOM([el], elInsertLocation);
  /*
   * The previous operation removed the current element from the `siblings`
   * array, so the `dom` array can be inserted without removing any
   * additional elements.
   */
  uniqueSplice(siblings, index, 0, wrapperDom, parent);
});

/**
 * The .wrapInner() function can take any string or object that could be passed
 * to the $() factory function to specify a DOM structure. This structure may be
 * nested several levels deep, but should contain only one inmost element. The
 * structure will be wrapped around the content of each of the elements in the
 * set of matched elements.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * const redFruit = $('<div class="red-fruit"></div>');
 * $('.apple').wrapInner(redFruit);
 *
 * //=> <ul id="fruits">
 * //     <li class="apple">
 * //       <div class="red-fruit">Apple</div>
 * //     </li>
 * //     <li class="orange">Orange</li>
 * //     <li class="pear">Pear</li>
 * //   </ul>
 *
 * const healthy = $('<div class="healthy"></div>');
 * $('li').wrapInner(healthy);
 *
 * //=> <ul id="fruits">
 * //     <li class="apple">
 * //       <div class="healthy">Apple</div>
 * //     </li>
 * //     <li class="orange">
 * //       <div class="healthy">Orange</div>
 * //     </li>
 * //     <li class="pear">
 * //       <div class="healthy">Pear</div>
 * //     </li>
 * //   </ul>
 * ```
 *
 * @param wrapper - The DOM structure to wrap around the content of each element
 *   in the selection.
 * @returns The instance itself, for chaining.
 * @see {@link https://api.jquery.com/wrapInner/}
 */
export const wrapInner = _wrap((el, elInsertLocation, wrapperDom) => {
  if (!hasChildren(el)) return;
  updateDOM(el.children, elInsertLocation);
  updateDOM(wrapperDom, el);
});

/**
 * The .unwrap() function, removes the parents of the set of matched elements
 * from the DOM, leaving the matched elements in their place.
 *
 * @category Manipulation
 * @example <caption>without selector</caption>
 *
 * ```js
 * const $ = cheerio.load(
 *   '<div id=test>\n  <div><p>Hello</p></div>\n  <div><p>World</p></div>\n</div>'
 * );
 * $('#test p').unwrap();
 *
 * //=> <div id=test>
 * //     <p>Hello</p>
 * //     <p>World</p>
 * //   </div>
 * ```
 *
 * @example <caption>with selector</caption>
 *
 * ```js
 * const $ = cheerio.load(
 *   '<div id=test>\n  <p>Hello</p>\n  <b><p>World</p></b>\n</div>'
 * );
 * $('#test p').unwrap('b');
 *
 * //=> <div id=test>
 * //     <p>Hello</p>
 * //     <p>World</p>
 * //   </div>
 * ```
 *
 * @param selector - A selector to check the parent element against. If an
 *   element's parent does not match the selector, the element won't be unwrapped.
 * @returns The instance itself, for chaining.
 * @see {@link https://api.jquery.com/unwrap/}
 */
export function unwrap<T extends Node>(
  this: Cheerio<T>,
  selector?: string
): Cheerio<T> {
  this.parent(selector)
    .not('body')
    .each((_, el) => {
      this._make(el).replaceWith(el.children);
    });
  return this;
}

/**
 * The .wrapAll() function can take any string or object that could be passed to
 * the $() function to specify a DOM structure. This structure may be nested
 * several levels deep, but should contain only one inmost element. The
 * structure will be wrapped around all of the elements in the set of matched
 * elements, as a single group.
 *
 * @category Manipulation
 * @example <caption>With markup passed to `wrapAll`</caption>
 *
 * ```js
 * const $ = cheerio.load(
 *   '<div class="container"><div class="inner">First</div><div class="inner">Second</div></div>'
 * );
 * $('.inner').wrapAll("<div class='new'></div>");
 *
 * //=> <div class="container">
 * //     <div class='new'>
 * //       <div class="inner">First</div>
 * //       <div class="inner">Second</div>
 * //     </div>
 * //   </div>
 * ```
 *
 * @example <caption>With an existing cheerio instance</caption>
 *
 * ```js
 * const $ = cheerio.load(
 *   '<span>Span 1</span><strong>Strong</strong><span>Span 2</span>'
 * );
 * const wrap = $('<div><p><em><b></b></em></p></div>');
 * $('span').wrapAll(wrap);
 *
 * //=> <div>
 * //     <p>
 * //       <em>
 * //         <b>
 * //           <span>Span 1</span>
 * //           <span>Span 2</span>
 * //         </b>
 * //       </em>
 * //     </p>
 * //   </div>
 * //   <strong>Strong</strong>
 * ```
 *
 * @param wrapper - The DOM structure to wrap around all matched elements in the
 *   selection.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/wrapAll/}
 */
export function wrapAll<T extends Node>(
  this: Cheerio<T>,
  wrapper: AcceptedElems<T>
): Cheerio<T> {
  const el = this[0];
  if (el) {
    const wrap: Cheerio<Node> = this._make(
      typeof wrapper === 'function' ? wrapper.call(el, 0, el) : wrapper
    ).insertBefore(el);

    // If html is given as wrapper, wrap may contain text elements
    let elInsertLocation: Element | undefined;

    for (let i = 0; i < wrap.length; i++) {
      if (wrap[i].type === 'tag') elInsertLocation = wrap[i] as Element;
    }

    let j = 0;

    /*
     * Find the deepest child. Only consider the first tag child of each node
     * (ignore text); stop if no children are found.
     */
    while (elInsertLocation && j < elInsertLocation.children.length) {
      const child = elInsertLocation.children[j];
      if (child.type === 'tag') {
        elInsertLocation = child as Element;
        j = 0;
      } else {
        j++;
      }
    }

    if (elInsertLocation) this._make(elInsertLocation).append(this);
  }
  return this;
}

/* eslint-disable jsdoc/check-param-names*/

/**
 * Insert content next to each element in the set of matched elements.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('.apple').after('<li class="plum">Plum</li>');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="plum">Plum</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 * ```
 *
 * @param content - HTML string, DOM element, array of DOM elements or Cheerio
 *   to insert after each element in the set of matched elements.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/after/}
 */
export function after<T extends Node>(
  this: Cheerio<T>,
  ...elems:
    | [(this: Node, i: number, html: string) => BasicAcceptedElems<Node>]
    | BasicAcceptedElems<Node>[]
): Cheerio<T> {
  const lastIdx = this.length - 1;

  return domEach(this, (i, el) => {
    const { parent } = el;
    if (!DomUtils.hasChildren(el) || !parent) {
      return;
    }

    const siblings = parent.children;
    const index = siblings.indexOf(el);

    // If not found, move on
    /* istanbul ignore next */
    if (index < 0) return;

    const domSrc =
      typeof elems[0] === 'function'
        ? elems[0].call(el, i, staticHtml(el.children))
        : (elems as Node[]);

    const dom = this._makeDomArray(domSrc, i < lastIdx);

    // Add element after `this` element
    uniqueSplice(siblings, index + 1, 0, dom, parent);
  });
}

/* eslint-enable jsdoc/check-param-names*/

/**
 * Insert every element in the set of matched elements after the target.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('<li class="plum">Plum</li>').insertAfter('.apple');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="plum">Plum</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 * ```
 *
 * @param target - Element to insert elements after.
 * @returns The set of newly inserted elements.
 * @see {@link https://api.jquery.com/insertAfter/}
 */
export function insertAfter<T extends Node>(
  this: Cheerio<T>,
  target: BasicAcceptedElems<Node>
): Cheerio<T> {
  if (typeof target === 'string') {
    target = this._make<Node>(target);
  }

  this.remove();

  const clones: T[] = [];

  domEach(this._makeDomArray(target), (_, el) => {
    const clonedSelf = this.clone().toArray();
    const { parent } = el;
    if (!parent) {
      return;
    }

    const siblings = parent.children;
    const index = siblings.indexOf(el);

    // If not found, move on
    /* istanbul ignore next */
    if (index < 0) return;

    // Add cloned `this` element(s) after target element
    uniqueSplice(siblings, index + 1, 0, clonedSelf, parent);
    clones.push(...clonedSelf);
  });

  return this._make(clones);
}

/* eslint-disable jsdoc/check-param-names*/

/**
 * Insert content previous to each element in the set of matched elements.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('.apple').before('<li class="plum">Plum</li>');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="plum">Plum</li>
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 * ```
 *
 * @param content - HTML string, DOM element, array of DOM elements or Cheerio
 *   to insert before each element in the set of matched elements.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/before/}
 */
export function before<T extends Node>(
  this: Cheerio<T>,
  ...elems:
    | [(this: Node, i: number, html: string) => BasicAcceptedElems<Node>]
    | BasicAcceptedElems<Node>[]
): Cheerio<T> {
  const lastIdx = this.length - 1;

  return domEach(this, (i, el) => {
    const { parent } = el;
    if (!DomUtils.hasChildren(el) || !parent) {
      return;
    }

    const siblings = parent.children;
    const index = siblings.indexOf(el);

    // If not found, move on
    /* istanbul ignore next */
    if (index < 0) return;

    const domSrc =
      typeof elems[0] === 'function'
        ? elems[0].call(el, i, staticHtml(el.children))
        : (elems as Node[]);

    const dom = this._makeDomArray(domSrc, i < lastIdx);

    // Add element before `el` element
    uniqueSplice(siblings, index, 0, dom, parent);
  });
}

/* eslint-enable jsdoc/check-param-names*/

/**
 * Insert every element in the set of matched elements before the target.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('<li class="plum">Plum</li>').insertBefore('.apple');
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="plum">Plum</li>
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 * ```
 *
 * @param target - Element to insert elements before.
 * @returns The set of newly inserted elements.
 * @see {@link https://api.jquery.com/insertBefore/}
 */
export function insertBefore<T extends Node>(
  this: Cheerio<T>,
  target: BasicAcceptedElems<Node>
): Cheerio<T> {
  const targetArr = this._make<Node>(target);

  this.remove();

  const clones: T[] = [];

  domEach(targetArr, (_, el) => {
    const clonedSelf = this.clone().toArray();
    const { parent } = el;
    if (!parent) {
      return;
    }

    const siblings = parent.children;
    const index = siblings.indexOf(el);

    // If not found, move on
    /* istanbul ignore next */
    if (index < 0) return;

    // Add cloned `this` element(s) after target element
    uniqueSplice(siblings, index, 0, clonedSelf, parent);
    clones.push(...clonedSelf);
  });

  return this._make(clones);
}

/**
 * Removes the set of matched elements from the DOM and all their children.
 * `selector` filters the set of matched elements to be removed.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('.pear').remove();
 * $.html();
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //    </ul>
 * ```
 *
 * @param selector - Optional selector for elements to remove.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/remove/}
 */
export function remove<T extends Node>(
  this: Cheerio<T>,
  selector?: string
): Cheerio<T> {
  // Filter if we have selector
  const elems = selector ? this.filter(selector) : this;

  domEach(elems, (_, el) => {
    DomUtils.removeElement(el);
    el.prev = el.next = el.parent = null;
  });

  return this;
}

/**
 * Replaces matched elements with `content`.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * const plum = $('<li class="plum">Plum</li>');
 * $('.pear').replaceWith(plum);
 * $.html();
 * //=> <ul id="fruits">
 * //     <li class="apple">Apple</li>
 * //     <li class="orange">Orange</li>
 * //     <li class="plum">Plum</li>
 * //   </ul>
 * ```
 *
 * @param content - Replacement for matched elements.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/replaceWith/}
 */
export function replaceWith<T extends Node>(
  this: Cheerio<T>,
  content: AcceptedElems<Node>
): Cheerio<T> {
  return domEach(this, (i, el) => {
    const { parent } = el;
    if (!parent) {
      return;
    }

    const siblings = parent.children;
    const cont =
      typeof content === 'function' ? content.call(el, i, el) : content;
    const dom = this._makeDomArray(cont);

    /*
     * In the case that `dom` contains nodes that already exist in other
     * structures, ensure those nodes are properly removed.
     */
    updateDOM(dom, null);

    const index = siblings.indexOf(el);

    // Completely remove old element
    uniqueSplice(siblings, index, 1, dom, parent);

    if (!dom.includes(el)) {
      el.parent = el.prev = el.next = null;
    }
  });
}

/**
 * Empties an element, removing all its children.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('ul').empty();
 * $.html();
 * //=>  <ul id="fruits"></ul>
 * ```
 *
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/empty/}
 */
export function empty<T extends Node>(this: Cheerio<T>): Cheerio<T> {
  return domEach(this, (_, el) => {
    if (!DomUtils.hasChildren(el)) return;
    el.children.forEach((child) => {
      child.next = child.prev = child.parent = null;
    });

    el.children.length = 0;
  });
}

/**
 * Gets an HTML content string from the first selected element. If `htmlString`
 * is specified, each selected element's content is replaced by the new content.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('.orange').html();
 * //=> Orange
 *
 * $('#fruits').html('<li class="mango">Mango</li>').html();
 * //=> <li class="mango">Mango</li>
 * ```
 *
 * @param str - If specified used to replace selection's contents.
 * @returns The instance itself.
 * @see {@link https://api.jquery.com/html/}
 */
export function html<T extends Node>(this: Cheerio<T>): string | null;
export function html<T extends Node>(
  this: Cheerio<T>,
  str: string | Cheerio<T>
): Cheerio<T>;
export function html<T extends Node>(
  this: Cheerio<T>,
  str?: string | Cheerio<Node>
): Cheerio<T> | string | null {
  if (str === undefined) {
    const el = this[0];
    if (!el || !DomUtils.hasChildren(el)) return null;
    return staticHtml(el.children, this.options);
  }

  // Keep main options unchanged
  const opts = { ...this.options, context: null as NodeWithChildren | null };

  return domEach(this, (_, el) => {
    if (!DomUtils.hasChildren(el)) return;
    el.children.forEach((child) => {
      child.next = child.prev = child.parent = null;
    });

    opts.context = el;

    const content = isCheerio(str)
      ? str.clone().get()
      : parse(`${str}`, opts, false).children;

    updateDOM(content, el);
  });
}

/**
 * Turns the collection to a string. Alias for `.html()`.
 *
 * @category Manipulation
 * @returns The rendered document.
 */
export function toString<T extends Node>(this: Cheerio<T>): string {
  return staticHtml(this, this.options);
}

/**
 * Get the combined text contents of each element in the set of matched
 * elements, including their descendants. If `textString` is specified, each
 * selected element's content is replaced by the new text content.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * $('.orange').text();
 * //=> Orange
 *
 * $('ul').text();
 * //=>  Apple
 * //    Orange
 * //    Pear
 * ```
 *
 * @param str - If specified replacement for the selected element's contents.
 * @returns The instance itself when setting text, otherwise the rendered document.
 * @see {@link https://api.jquery.com/text/}
 */
export function text<T extends Node>(this: Cheerio<T>): string;
export function text<T extends Node>(
  this: Cheerio<T>,
  str: string | ((this: Node, i: number, text: string) => string)
): Cheerio<T>;
export function text<T extends Node>(
  this: Cheerio<T>,
  str?: string | ((this: Node, i: number, text: string) => string)
): Cheerio<T> | string {
  // If `str` is undefined, act as a "getter"
  if (str === undefined) {
    return staticText(this);
  }
  if (typeof str === 'function') {
    // Function support
    return domEach(this, (i, el) => {
      text.call(this._make(el), str.call(el, i, staticText([el])));
    });
  }

  // Append text node to each selected elements
  return domEach(this, (_, el) => {
    if (!DomUtils.hasChildren(el)) return;
    el.children.forEach((child) => {
      child.next = child.prev = child.parent = null;
    });

    const textNode = new Text(str);

    updateDOM(textNode, el);
  });
}

/**
 * Clone the cheerio object.
 *
 * @category Manipulation
 * @example
 *
 * ```js
 * const moreFruit = $('#fruits').clone();
 * ```
 *
 * @returns The cloned object.
 * @see {@link https://api.jquery.com/clone/}
 */
export function clone<T extends Node>(this: Cheerio<T>): Cheerio<T> {
  return this._make(cloneDom(this.get()));
}
