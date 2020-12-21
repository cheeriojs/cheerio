/**
 * Methods for traversing the DOM structure.
 *
 * @module cheerio/traversing
 */

var select = require('cheerio-select-tmp');
var utils = require('../utils');
var domEach = utils.domEach;
var uniqueSort = require('htmlparser2').DomUtils.uniqueSort;
var isTag = utils.isTag;

/**
 * Get the descendants of each element in the current set of matched elements,
 * filtered by a selector, jQuery object, or element.
 *
 * @example
 *
 * $('#fruits').find('li').length
 * //=> 3
 * $('#fruits').find($('.apple')).length
 * //=> 1
 *
 * @param {string|cheerio|node} selectorOrHaystack - Element to look for.
 *
 * @see {@link http://api.jquery.com/find/}
 */
exports.find = function (selectorOrHaystack) {
  var elems = this.toArray().reduce(function (newElems, elem) {
    return newElems.concat(elem.children.filter(isTag));
  }, []);
  var contains = this.constructor.contains;
  var haystack;

  if (selectorOrHaystack && typeof selectorOrHaystack !== 'string') {
    if (selectorOrHaystack.cheerio) {
      haystack = selectorOrHaystack.get();
    } else {
      haystack = [selectorOrHaystack];
    }

    return this._make(
      haystack.filter(function (elem) {
        var idx;
        var len;
        for (idx = 0, len = this.length; idx < len; ++idx) {
          if (contains(this[idx], elem)) {
            return true;
          }
        }
      }, this)
    );
  }

  var options = { __proto__: this.options, context: this.toArray() };

  return this._make(select.select(selectorOrHaystack || '', elems, options));
};

/**
 * Get the parent of each element in the current set of matched elements,
 * optionally filtered by a selector.
 *
 * @example
 *
 * $('.pear').parent().attr('id')
 * //=> fruits
 *
 * @param {string} [selector] - If specified filter for parent.
 *
 * @see {@link http://api.jquery.com/parent/}
 */
exports.parent = function (selector) {
  var set = [];

  domEach(this, function (idx, elem) {
    var parentElem = elem.parent;
    if (
      parentElem &&
      parentElem.type !== 'root' &&
      set.indexOf(parentElem) < 0
    ) {
      set.push(parentElem);
    }
  });

  if (arguments.length) {
    set = exports.filter.call(set, selector, this);
  }

  return this._make(set);
};

/**
 * Get a set of parents filtered by `selector` of each element in the current
 * set of match elements.
 *
 * @example
 *
 * $('.orange').parents().length
 * // => 2
 * $('.orange').parents('#fruits').length
 * // => 1
 *
 * @param {string} [selector] - If specified filter for parents.
 *
 * @see {@link http://api.jquery.com/parents/}
 */
exports.parents = function (selector) {
  var parentNodes = [];

  // When multiple DOM elements are in the original set, the resulting set will
  // be in *reverse* order of the original elements as well, with duplicates
  // removed.
  this.get()
    .reverse()
    .forEach(function (elem) {
      traverseParents(this, elem.parent, selector, Infinity).forEach(function (
        node
      ) {
        if (parentNodes.indexOf(node) === -1) {
          parentNodes.push(node);
        }
      });
    }, this);

  return this._make(parentNodes);
};

/**
 * Get the ancestors of each element in the current set of matched elements, up
 * to but not including the element matched by the selector, DOM node, or
 * cheerio object.
 *
 * @example
 *
 * $('.orange').parentsUntil('#food').length
 * // => 1
 *
 * @param {string|node|cheerio} selector - Selector for element to stop at.
 * @param {string|Function} [filter] - Optional filter for parents.
 *
 * @see {@link http://api.jquery.com/parentsUntil/}
 */
exports.parentsUntil = function (selector, filter) {
  var parentNodes = [];
  var untilNode;
  var untilNodes;

  if (typeof selector === 'string') {
    untilNode = select.select(
      selector,
      this.parents().toArray(),
      this.options
    )[0];
  } else if (selector && selector.cheerio) {
    untilNodes = selector.toArray();
  } else if (selector) {
    untilNode = selector;
  }

  // When multiple DOM elements are in the original set, the resulting set will
  // be in *reverse* order of the original elements as well, with duplicates
  // removed.

  this.toArray()
    .reverse()
    .forEach(function (elem) {
      while ((elem = elem.parent)) {
        if (
          (untilNode && elem !== untilNode) ||
          (untilNodes && untilNodes.indexOf(elem) === -1) ||
          (!untilNode && !untilNodes)
        ) {
          if (isTag(elem) && parentNodes.indexOf(elem) === -1) {
            parentNodes.push(elem);
          }
        } else {
          break;
        }
      }
    }, this);

  return this._make(
    filter ? select.select(filter, parentNodes, this.options) : parentNodes
  );
};

/**
 * For each element in the set, get the first element that matches the selector
 * by testing the element itself and traversing up through its ancestors in
 * the DOM tree.
 *
 * @example
 *
 * $('.orange').closest()
 * // => []
 * $('.orange').closest('.apple')
 * // => []
 * $('.orange').closest('li')
 * // => [<li class="orange">Orange</li>]
 * $('.orange').closest('#fruits')
 * // => [<ul id="fruits"> ... </ul>]
 *
 * @param {string} [selector] - Selector for the element to find.
 *
 * @see {@link http://api.jquery.com/closest/}
 */
exports.closest = function (selector) {
  var set = [];

  if (!selector) {
    return this._make(set);
  }

  domEach(this, function (idx, elem) {
    var closestElem = traverseParents(this, elem, selector, 1)[0];

    // Do not add duplicate elements to the set
    if (closestElem && set.indexOf(closestElem) < 0) {
      set.push(closestElem);
    }
  });

  return this._make(set);
};

/**
 * Gets the next sibling of the first selected element, optionally filtered by
 * a selector.
 *
 * @example
 *
 * $('.apple').next().hasClass('orange')
 * //=> true
 *
 * @param {string} [selector] - If specified filter for sibling.
 *
 * @see {@link http://api.jquery.com/next/}
 */
exports.next = function (selector) {
  if (!this[0]) {
    return this;
  }
  var elems = [];

  this.toArray().forEach(function (elem) {
    while ((elem = elem.next)) {
      if (isTag(elem)) {
        elems.push(elem);
        return;
      }
    }
  });

  return selector
    ? exports.filter.call(elems, selector, this)
    : this._make(elems);
};

/**
 * Gets all the following siblings of the first selected element, optionally
 * filtered by a selector.
 *
 * @example
 *
 * $('.apple').nextAll()
 * //=> [<li class="orange">Orange</li>, <li class="pear">Pear</li>]
 * $('.apple').nextAll('.orange')
 * //=> [<li class="orange">Orange</li>]
 *
 * @param {string} [selector] - If specified filter for siblings.
 *
 * @see {@link http://api.jquery.com/nextAll/}
 */
exports.nextAll = function (selector) {
  if (!this[0]) {
    return this;
  }
  var elems = [];

  this.toArray().forEach(function (elem) {
    while ((elem = elem.next)) {
      if (isTag(elem) && elems.indexOf(elem) === -1) {
        elems.push(elem);
      }
    }
  });

  return selector
    ? exports.filter.call(elems, selector, this)
    : this._make(elems);
};

/**
 * Gets all the following siblings up to but not including the element matched
 * by the selector, optionally filtered by another selector.
 *
 * @example
 *
 * $('.apple').nextUntil('.pear')
 * //=> [<li class="orange">Orange</li>]
 *
 * @param {string|cheerio|node} selector - Selector for element to stop at.
 * @param {string} [filterSelector] - If specified filter for siblings.
 *
 * @see {@link http://api.jquery.com/nextUntil/}
 */
exports.nextUntil = function (selector, filterSelector) {
  if (!this[0]) {
    return this;
  }
  var elems = [];
  var untilNode;
  var untilNodes;

  if (typeof selector === 'string') {
    untilNode = select.select(selector, this.nextAll().get(), this.options)[0];
  } else if (selector && selector.cheerio) {
    untilNodes = selector.get();
  } else if (selector) {
    untilNode = selector;
  }

  this.toArray().forEach(function (elem) {
    while ((elem = elem.next)) {
      if (
        (untilNode && elem !== untilNode) ||
        (untilNodes && untilNodes.indexOf(elem) === -1) ||
        (!untilNode && !untilNodes)
      ) {
        if (isTag(elem) && elems.indexOf(elem) === -1) {
          elems.push(elem);
        }
      } else {
        break;
      }
    }
  });

  return filterSelector
    ? exports.filter.call(elems, filterSelector, this)
    : this._make(elems);
};

/**
 * Gets the previous sibling of the first selected element optionally filtered
 * by a selector.
 *
 * @example
 *
 * $('.orange').prev().hasClass('apple')
 * //=> true
 *
 * @param {string} [selector] - If specified filter for siblings.
 *
 * @see {@link http://api.jquery.com/prev/}
 */
exports.prev = function (selector) {
  if (!this[0]) {
    return this;
  }
  var elems = [];

  this.toArray().forEach(function (elem) {
    while ((elem = elem.prev)) {
      if (isTag(elem)) {
        elems.push(elem);
        return;
      }
    }
  });

  return selector
    ? exports.filter.call(elems, selector, this)
    : this._make(elems);
};

/**
 * Gets all the preceding siblings of the first selected element, optionally
 * filtered by a selector.
 *
 * @example
 *
 * $('.pear').prevAll()
 * //=> [<li class="orange">Orange</li>, <li class="apple">Apple</li>]
 * $('.pear').prevAll('.orange')
 * //=> [<li class="orange">Orange</li>]
 *
 * @param {string} [selector] - If specified filter for siblings.
 *
 * @see {@link http://api.jquery.com/prevAll/}
 */
exports.prevAll = function (selector) {
  if (!this[0]) {
    return this;
  }
  var elems = [];

  this.toArray().forEach(function (elem) {
    while ((elem = elem.prev)) {
      if (isTag(elem) && elems.indexOf(elem) === -1) {
        elems.push(elem);
      }
    }
  });

  return selector
    ? exports.filter.call(elems, selector, this)
    : this._make(elems);
};

/**
 * Gets all the preceding siblings up to but not including the element matched
 * by the selector, optionally filtered by another selector.
 *
 * @example
 *
 * $('.pear').prevUntil('.apple')
 * //=> [<li class="orange">Orange</li>]
 *
 * @param {string|cheerio|node} selector - Selector for element to stop at.
 * @param {string} [filterSelector] - If specified filter for siblings.
 *
 * @see {@link http://api.jquery.com/prevUntil/}
 */
exports.prevUntil = function (selector, filterSelector) {
  if (!this[0]) {
    return this;
  }
  var elems = [];
  var untilNode;
  var untilNodes;

  if (typeof selector === 'string') {
    untilNode = select.select(selector, this.prevAll().get(), this.options)[0];
  } else if (selector && selector.cheerio) {
    untilNodes = selector.get();
  } else if (selector) {
    untilNode = selector;
  }

  this.toArray().forEach(function (elem) {
    while ((elem = elem.prev)) {
      if (
        (untilNode && elem !== untilNode) ||
        (untilNodes && untilNodes.indexOf(elem) === -1) ||
        (!untilNode && !untilNodes)
      ) {
        if (isTag(elem) && elems.indexOf(elem) === -1) {
          elems.push(elem);
        }
      } else {
        break;
      }
    }
  });

  return filterSelector
    ? exports.filter.call(elems, filterSelector, this)
    : this._make(elems);
};

/**
 * Gets the first selected element's siblings, excluding itself.
 *
 * @example
 *
 * $('.pear').siblings().length
 * //=> 2
 *
 * $('.pear').siblings('.orange').length
 * //=> 1
 *
 * @param {string} [selector] - If specified filter for siblings.
 *
 * @see {@link http://api.jquery.com/siblings/}
 */
exports.siblings = function (selector) {
  var parent = this.parent();

  var elems = (parent ? parent.children() : this.siblingsAndMe())
    .toArray()
    .filter(function (elem) {
      return isTag(elem) && !this.is(elem);
    }, this);

  if (selector !== undefined) {
    return exports.filter.call(elems, selector, this);
  }
  return this._make(elems);
};

/**
 * Gets the children of the first selected element.
 *
 * @example
 *
 * $('#fruits').children().length
 * //=> 3
 *
 * $('#fruits').children('.pear').text()
 * //=> Pear
 *
 * @param {string} [selector] - If specified filter for children.
 *
 * @see {@link http://api.jquery.com/children/}
 */
exports.children = function (selector) {
  var elems = this.toArray().reduce(function (newElems, elem) {
    return newElems.concat(elem.children.filter(isTag));
  }, []);

  if (selector === undefined) return this._make(elems);

  return exports.filter.call(elems, selector, this);
};

/**
 * Gets the children of each element in the set of matched elements, including
 * text and comment nodes.
 *
 * @example
 *
 * $('#fruits').contents().length
 * //=> 3
 *
 * @see {@link http://api.jquery.com/contents/}
 */
exports.contents = function () {
  var elems = this.toArray().reduce(function (newElems, elem) {
    return newElems.concat(elem.children);
  }, []);
  return this._make(elems);
};

/**
 * Iterates over a cheerio object, executing a function for each matched
 * element. When the callback is fired, the function is fired in the context of
 * the DOM element, so `this` refers to the current element, which is
 * equivalent to the function parameter `element`. To break out of the `each`
 * loop early, return with `false`.
 *
 * @example
 *
 * const fruits = [];
 *
 * $('li').each(function(i, elem) {
 *   fruits[i] = $(this).text();
 * });
 *
 * fruits.join(', ');
 * //=> Apple, Orange, Pear
 *
 * @param {Function} fn - Function to execute.
 *
 * @see {@link http://api.jquery.com/each/}
 */
exports.each = function (fn) {
  var i = 0;
  var len = this.length;
  while (i < len && fn.call(this[i], i, this[i]) !== false) ++i;
  return this;
};

/**
 * Pass each element in the current matched set through a function, producing a
 * new Cheerio object containing the return values. The function can return an
 * individual data item or an array of data items to be inserted into the
 * resulting set. If an array is returned, the elements inside the array are
 * inserted into the set. If the function returns null or undefined, no element
 * will be inserted.
 *
 * @example
 *
 * $('li').map(function(i, el) {
 *   // this === el
 *   return $(this).text();
 * }).get().join(' ');
 * //=> "apple orange pear"
 *
 * @param {Function} fn - Function to execute.
 *
 * @see {@link http://api.jquery.com/map/}
 */
exports.map = function (fn) {
  var elems = [];
  for (var i = 0; i < this.length; i++) {
    var el = this[i];
    var val = fn.call(el, i, el);
    if (val != null) {
      elems = elems.concat(val);
    }
  }
  return this._make(elems);
};

function getFilterFn(match) {
  if (typeof match === 'function') {
    return function (el, i) {
      return match.call(el, i, el);
    };
  } else if (match.cheerio) {
    return match.is.bind(match);
  }
  return function (el) {
    return match === el;
  };
}

/**
 * Iterates over a cheerio object, reducing the set of selector elements to
 * those that match the selector or pass the function's test. When a Cheerio
 * selection is specified, return only the elements contained in that
 * selection. When an element is specified, return only that element (if it is
 * contained in the original selection). If using the function method, the
 * function is executed in the context of the selected element, so `this`
 * refers to the current element.
 *
 * @function
 * @param {string | Function} match - Value to look for, following the rules above.
 * @param {node[]} container - Optional node to filter instead.
 *
 * @example <caption>Selector</caption>
 *
 * $('li').filter('.orange').attr('class');
 * //=> orange
 *
 * @example <caption>Function</caption>
 *
 * $('li').filter(function(i, el) {
 *   // this === el
 *   return $(this).attr('class') === 'orange';
 * }).attr('class')
 * //=> orange
 *
 * @see {@link http://api.jquery.com/filter/}
 */
exports.filter = function (match, container) {
  container = container || this;
  var elements = this.toArray ? this.toArray() : this;

  if (typeof match === 'string') {
    elements = select.filter(match, elements, container.options);
  } else {
    elements = elements.filter(getFilterFn(match));
  }

  return container._make(elements);
};

/**
 * Remove elements from the set of matched elements. Given a jQuery object that
 * represents a set of DOM elements, the `.not()` method constructs a new
 * jQuery object from a subset of the matching elements. The supplied selector
 * is tested against each element; the elements that don't match the selector
 * will be included in the result. The `.not()` method can take a function as
 * its argument in the same way that `.filter()` does. Elements for which the
 * function returns true are excluded from the filtered set; all other elements
 * are included.
 *
 * @function
 * @param {string | Function} match - Value to look for, following the rules above.
 * @param {node[]} container - Optional node to filter instead.
 *
 * @example <caption>Selector</caption>
 *
 * $('li').not('.apple').length;
 * //=> 2
 *
 * @example <caption>Function</caption>
 *
 * $('li').not(function(i, el) {
 *   // this === el
 *   return $(this).attr('class') === 'orange';
 * }).length;
 * //=> 2
 *
 * @see {@link http://api.jquery.com/not/}
 */
exports.not = function (match, container) {
  container = container || this;
  var elements = container.toArray ? container.toArray() : container;
  var matches;
  var filterFn;

  if (typeof match === 'string') {
    matches = new Set(select.filter(match, elements, this.options));
    elements = elements.filter(function (el) {
      return !matches.has(el);
    });
  } else {
    filterFn = getFilterFn(match);
    elements = elements.filter(function (el, i) {
      return !filterFn(el, i);
    });
  }

  return container._make(elements);
};

/**
 * Filters the set of matched elements to only those which have the given DOM
 * element as a descendant or which have a descendant that matches the given
 * selector. Equivalent to `.filter(':has(selector)')`.
 *
 * @example <caption>Selector</caption>
 *
 * $('ul').has('.pear').attr('id');
 * //=> fruits
 *
 * @example <caption>Element</caption>
 *
 * $('ul').has($('.pear')[0]).attr('id');
 * //=> fruits
 *
 * @param {string|cheerio|node} selectorOrHaystack - Element to look for.
 *
 * @see {@link http://api.jquery.com/has/}
 */
exports.has = function (selectorOrHaystack) {
  var that = this;
  return exports.filter.call(this, function () {
    return that._make(this).find(selectorOrHaystack).length > 0;
  });
};

/**
 * Will select the first element of a cheerio object.
 *
 * @example
 *
 * $('#fruits').children().first().text()
 * //=> Apple
 *
 * @see {@link http://api.jquery.com/first/}
 */
exports.first = function () {
  return this.length > 1 ? this._make(this[0]) : this;
};

/**
 * Will select the last element of a cheerio object.
 *
 * @example
 *
 * $('#fruits').children().last().text()
 * //=> Pear
 *
 * @see {@link http://api.jquery.com/last/}
 */
exports.last = function () {
  return this.length > 1 ? this._make(this[this.length - 1]) : this;
};

/**
 * Reduce the set of matched elements to the one at the specified index. Use
 * `.eq(-i)` to count backwards from the last selected element.
 *
 * @example
 *
 * $('li').eq(0).text()
 * //=> Apple
 *
 * $('li').eq(-1).text()
 * //=> Pear
 *
 * @param {number} i - Index of the element to select.
 *
 * @see {@link http://api.jquery.com/eq/}
 */
exports.eq = function (i) {
  i = +i;

  // Use the first identity optimization if possible
  if (i === 0 && this.length <= 1) return this;

  if (i < 0) i = this.length + i;
  return this[i] ? this._make(this[i]) : this._make([]);
};

/**
 * Retrieve the DOM elements matched by the Cheerio object. If an index is
 * specified, retrieve one of the elements matched by the Cheerio object.
 *
 * @example
 *
 * $('li').get(0).tagName
 * //=> li
 *
 * If no index is specified, retrieve all elements matched by the Cheerio object:
 *
 * @example
 *
 * $('li').get().length
 * //=> 3
 *
 * @param {number} [i] - Element to retrieve.
 *
 * @see {@link http://api.jquery.com/get/}
 */
exports.get = function (i) {
  if (i == null) {
    return Array.prototype.slice.call(this);
  }
  return this[i < 0 ? this.length + i : i];
};

/**
 * Search for a given element from among the matched elements.
 *
 * @example
 *
 * $('.pear').index()
 * //=> 2
 * $('.orange').index('li')
 * //=> 1
 * $('.apple').index($('#fruit, li'))
 * //=> 1
 *
 * @param {string|cheerio|node} [selectorOrNeedle] - Element to look for.
 *
 * @see {@link http://api.jquery.com/index/}
 */
exports.index = function (selectorOrNeedle) {
  var $haystack;
  var needle;

  if (arguments.length === 0) {
    $haystack = this.parent().children();
    needle = this[0];
  } else if (typeof selectorOrNeedle === 'string') {
    $haystack = this._make(selectorOrNeedle);
    needle = this[0];
  } else {
    $haystack = this;
    needle = selectorOrNeedle.cheerio ? selectorOrNeedle[0] : selectorOrNeedle;
  }

  return $haystack.get().indexOf(needle);
};

/**
 * Gets the elements matching the specified range.
 *
 * @example
 *
 * $('li').slice(1).eq(0).text()
 * //=> 'Orange'
 *
 * $('li').slice(1, 2).length
 * //=> 1
 *
 * @see {@link http://api.jquery.com/slice/}
 */
exports.slice = function () {
  return this._make([].slice.apply(this, arguments));
};

function traverseParents(self, elem, selector, limit) {
  var elems = [];
  while (elem && elems.length < limit && elem.type !== 'root') {
    if (!selector || exports.filter.call([elem], selector, self).length) {
      elems.push(elem);
    }
    elem = elem.parent;
  }
  return elems;
}

/**
 * End the most recent filtering operation in the current chain and return the
 * set of matched elements to its previous state.
 *
 * @example
 *
 * $('li').eq(0).end().length
 * //=> 3
 *
 * @see {@link http://api.jquery.com/end/}
 */
exports.end = function () {
  return this.prevObject || this._make([]);
};

/**
 * Add elements to the set of matched elements.
 *
 * @example
 *
 * $('.apple').add('.orange').length
 * //=> 2
 *
 * @param {string|cheerio} other - Elements to add.
 * @param {cheerio} [context] - Optionally the context of the new selection.
 *
 * @see {@link http://api.jquery.com/add/}
 */
exports.add = function (other, context) {
  var selection = this._make(other, context);
  var contents = uniqueSort(selection.get().concat(this.get()));

  for (var i = 0; i < contents.length; ++i) {
    selection[i] = contents[i];
  }
  selection.length = contents.length;

  return selection;
};

/**
 * Add the previous set of elements on the stack to the current set, optionally
 * filtered by a selector.
 *
 * @example
 *
 * $('li').eq(0).addBack('.orange').length
 * //=> 2
 *
 * @param {string} selector - Selector for the elements to add.
 *
 * @see {@link http://api.jquery.com/addBack/}
 */
exports.addBack = function (selector) {
  return this.add(
    arguments.length ? this.prevObject.filter(selector) : this.prevObject
  );
};
