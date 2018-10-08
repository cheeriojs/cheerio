/**
 * Methods for modifying the DOM structure.
 *
 * @alias manipulation
 * @mixin
 */
exports = exports; // eslint-disable-line no-self-assign
// The preceeding statement is necessary for proper documentation generation.

var parse = require('../parse'),
    html = require('../static').html,
    text = require('../static').text,
    updateDOM = parse.update,
    evaluate = parse.evaluate,
    utils = require('../utils'),
    domEach = utils.domEach,
    cloneDom = utils.cloneDom,
    isHtml = utils.isHtml,
    slice = Array.prototype.slice,
    _ = {
      flatten: require('lodash/flatten'),
      bind: require('lodash/bind'),
      forEach: require('lodash/forEach')
    };

/**
 * Create an array of nodes, recursing into arrays and parsing strings if
 * necessary.
 *
 * @param {cheerio|string|cheerio[]|string[]} [elem] - Elements to make an array of.
 * @param {boolean} [clone] - Optionally clone nodes.
 * @private
 */
exports._makeDomArray = function makeDomArray(elem, clone) {
  if (elem == null) {
    return [];
  } else if (elem.cheerio) {
    return clone ? cloneDom(elem.get(), elem.options) : elem.get();
  } else if (Array.isArray(elem)) {
    return _.flatten(
      elem.map(function(el) {
        return this._makeDomArray(el, clone);
      }, this)
    );
  } else if (typeof elem === 'string') {
    return evaluate(elem, this.options, false);
  } else {
    return clone ? cloneDom([elem]) : [elem];
  }
};

var _insert = function(concatenator) {
  return function() {
    var elems = slice.call(arguments),
        lastIdx = this.length - 1;

    return domEach(this, function(i, el) {
      var dom, domSrc;

      if (typeof elems[0] === 'function') {
        domSrc = elems[0].call(el, i, html(el.children));
      } else {
        domSrc = elems;
      }

      dom = this._makeDomArray(domSrc, i < lastIdx);
      concatenator(dom, el.children, el);
    });
  };
};

/*
 * Modify an array in-place, removing some number of elements and adding new
 * elements directly following them.
 *
 * @param {Array} array Target array to splice.
 * @param {Number} spliceIdx Index at which to begin changing the array.
 * @param {Number} spliceCount Number of elements to remove from the array.
 * @param {Array} newElems Elements to insert into the array.
 *
 * @private
 */
var uniqueSplice = function(array, spliceIdx, spliceCount, newElems, parent) {
  var spliceArgs = [spliceIdx, spliceCount].concat(newElems),
      prev = array[spliceIdx - 1] || null,
      next = array[spliceIdx] || null;
  var idx, len, prevIdx, node, oldParent;

  // Before splicing in new elements, ensure they do not already appear in the
  // current array.
  for (idx = 0, len = newElems.length; idx < len; ++idx) {
    node = newElems[idx];
    oldParent = node.parent || node.root;
    prevIdx = oldParent && oldParent.children.indexOf(newElems[idx]);

    if (oldParent && prevIdx > -1) {
      oldParent.children.splice(prevIdx, 1);
      if (parent === oldParent && spliceIdx > prevIdx) {
        spliceArgs[0]--;
      }
    }

    node.root = null;
    node.parent = parent;

    if (node.prev) {
      node.prev.next = node.next || null;
    }

    if (node.next) {
      node.next.prev = node.prev || null;
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
  return array.splice.apply(array, spliceArgs);
};

/**
 * Insert every element in the set of matched elements to the end of the
 * target.
 *
 * @param {string|cheerio} target - Element to append elements to.
 *
 * @example
 *
 * $('<li class="plum">Plum</li>').appendTo('#fruits')
 * $.html()
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //      <li class="plum">Plum</li>
 * //    </ul>
 *
 * @see {@link http://api.jquery.com/appendTo/}
 */
exports.appendTo = function(target) {
  if (!target.cheerio) {
    target = this.constructor.call(
      this.constructor,
      target,
      null,
      this._originalRoot
    );
  }

  target.append(this);

  return this;
};

/**
 * Insert every element in the set of matched elements to the beginning of the
 * target.
 *
 * @param {string|cheerio} target - Element to prepend elements to.
 *
 * @example
 *
 * $('<li class="plum">Plum</li>').prependTo('#fruits')
 * $.html()
 * //=>  <ul id="fruits">
 * //      <li class="plum">Plum</li>
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 *
 * @see {@link http://api.jquery.com/prependTo/}
 */
exports.prependTo = function(target) {
  if (!target.cheerio) {
    target = this.constructor.call(
      this.constructor,
      target,
      null,
      this._originalRoot
    );
  }

  target.prepend(this);

  return this;
};

/**
 * Inserts content as the *last* child of each of the selected elements.
 *
 * @method
 *
 * @example
 *
 * $('ul').append('<li class="plum">Plum</li>')
 * $.html()
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //      <li class="plum">Plum</li>
 * //    </ul>
 *
 * @see {@link http://api.jquery.com/append/}
 */
exports.append = _insert(function(dom, children, parent) {
  uniqueSplice(children, children.length, 0, dom, parent);
});

/**
 * Inserts content as the *first* child of each of the selected elements.
 *
 * @method
 *
 * @example
 *
 * $('ul').prepend('<li class="plum">Plum</li>')
 * $.html()
 * //=>  <ul id="fruits">
 * //      <li class="plum">Plum</li>
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 *
 * @see {@link http://api.jquery.com/prepend/}
 */
exports.prepend = _insert(function(dom, children, parent) {
  uniqueSplice(children, 0, 0, dom, parent);
});

/**
 * The .wrap() function can take any string or object that could be passed to
 * the $() factory function to specify a DOM structure. This structure may be
 * nested several levels deep, but should contain only one inmost element. A
 * copy of this structure will be wrapped around each of the elements in the
 * set of matched elements. This method returns the original set of elements
 * for chaining purposes.
 *
 * @param {cheerio} wrapper - The DOM structure to wrap around each element in the selection.
 *
 * @example
 *
 * const redFruit = $('<div class="red-fruit"></div>')
 * $('.apple').wrap(redFruit)
 *
 * //=> <ul id="fruits">
 * //     <div class="red-fruit">
 * //      <li class="apple">Apple</li>
 * //     </div>
 * //     <li class="orange">Orange</li>
 * //     <li class="plum">Plum</li>
 * //   </ul>
 *
 * const healthy = $('<div class="healthy"></div>')
 * $('li').wrap(healthy)
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
 *
 * @see {@link http://api.jquery.com/wrap/}
 */
exports.wrap = function(wrapper) {
  var wrapperFn = typeof wrapper === 'function' && wrapper,
      lastIdx = this.length - 1;

  _.forEach(
    this,
    _.bind(function(el, i) {
      var parent = el.parent || el.root,
          siblings = parent.children,
          wrapperDom,
          elInsertLocation,
          j,
          index;

      if (!parent) {
        return;
      }

      if (wrapperFn) {
        wrapper = wrapperFn.call(el, i);
      }

      if (typeof wrapper === 'string' && !isHtml(wrapper)) {
        wrapper = this.parents()
          .last()
          .find(wrapper)
          .clone();
      }

      wrapperDom = this._makeDomArray(wrapper, i < lastIdx).slice(0, 1);
      elInsertLocation = wrapperDom[0];
      // Find the deepest child. Only consider the first tag child of each node
      // (ignore text); stop if no children are found.
      j = 0;

      while (elInsertLocation && elInsertLocation.children) {
        if (j >= elInsertLocation.children.length) {
          break;
        }

        if (elInsertLocation.children[j].type === 'tag') {
          elInsertLocation = elInsertLocation.children[j];
          j = 0;
        } else {
          j++;
        }
      }
      index = siblings.indexOf(el);

      updateDOM([el], elInsertLocation);
      // The previous operation removed the current element from the `siblings`
      // array, so the `dom` array can be inserted without removing any
      // additional elements.
      uniqueSplice(siblings, index, 0, wrapperDom, parent);
    }, this)
  );

  return this;
};

/**
 * Insert content next to each element in the set of matched elements.
 *
 * @example
 *
 * $('.apple').after('<li class="plum">Plum</li>')
 * $.html()
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="plum">Plum</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 *
 * @see {@link http://api.jquery.com/after/}
 */
exports.after = function() {
  var elems = slice.call(arguments),
      lastIdx = this.length - 1;

  domEach(this, function(i, el) {
    var parent = el.parent || el.root;
    if (!parent) {
      return;
    }

    var siblings = parent.children,
        index = siblings.indexOf(el),
        domSrc,
        dom;

    // If not found, move on
    if (index < 0) return;

    if (typeof elems[0] === 'function') {
      domSrc = elems[0].call(el, i, html(el.children));
    } else {
      domSrc = elems;
    }
    dom = this._makeDomArray(domSrc, i < lastIdx);

    // Add element after `this` element
    uniqueSplice(siblings, index + 1, 0, dom, parent);
  });

  return this;
};

/**
 * Insert every element in the set of matched elements after the target.
 *
 * @example
 *
 * $('<li class="plum">Plum</li>').insertAfter('.apple')
 * $.html()
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="plum">Plum</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 *
 * @param {string|cheerio} target - Element to insert elements after.
 *
 * @see {@link http://api.jquery.com/insertAfter/}
 */
exports.insertAfter = function(target) {
  var clones = [],
      self = this;
  if (typeof target === 'string') {
    target = this.constructor.call(
      this.constructor,
      target,
      null,
      this._originalRoot
    );
  }
  target = this._makeDomArray(target);
  self.remove();
  domEach(target, function(i, el) {
    var clonedSelf = self._makeDomArray(self.clone());
    var parent = el.parent || el.root;
    if (!parent) {
      return;
    }

    var siblings = parent.children,
        index = siblings.indexOf(el);

    // If not found, move on
    if (index < 0) return;

    // Add cloned `this` element(s) after target element
    uniqueSplice(siblings, index + 1, 0, clonedSelf, parent);
    clones.push(clonedSelf);
  });
  return this.constructor.call(this.constructor, this._makeDomArray(clones));
};

/**
 * Insert content previous to each element in the set of matched elements.
 *
 * @example
 *
 * $('.apple').before('<li class="plum">Plum</li>')
 * $.html()
 * //=>  <ul id="fruits">
 * //      <li class="plum">Plum</li>
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 *
 * @see {@link http://api.jquery.com/before/}
 */
exports.before = function() {
  var elems = slice.call(arguments),
      lastIdx = this.length - 1;

  domEach(this, function(i, el) {
    var parent = el.parent || el.root;
    if (!parent) {
      return;
    }

    var siblings = parent.children,
        index = siblings.indexOf(el),
        domSrc,
        dom;

    // If not found, move on
    if (index < 0) return;

    if (typeof elems[0] === 'function') {
      domSrc = elems[0].call(el, i, html(el.children));
    } else {
      domSrc = elems;
    }

    dom = this._makeDomArray(domSrc, i < lastIdx);

    // Add element before `el` element
    uniqueSplice(siblings, index, 0, dom, parent);
  });

  return this;
};

/**
 * Insert every element in the set of matched elements before the target.
 *
 * @example
 *
 * $('<li class="plum">Plum</li>').insertBefore('.apple')
 * $.html()
 * //=>  <ul id="fruits">
 * //      <li class="plum">Plum</li>
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //      <li class="pear">Pear</li>
 * //    </ul>
 *
 * @param {string|cheerio} target - Element to insert elements before.
 *
 * @see {@link http://api.jquery.com/insertBefore/}
 */
exports.insertBefore = function(target) {
  var clones = [],
      self = this;
  if (typeof target === 'string') {
    target = this.constructor.call(
      this.constructor,
      target,
      null,
      this._originalRoot
    );
  }
  target = this._makeDomArray(target);
  self.remove();
  domEach(target, function(i, el) {
    var clonedSelf = self._makeDomArray(self.clone());
    var parent = el.parent || el.root;
    if (!parent) {
      return;
    }

    var siblings = parent.children,
        index = siblings.indexOf(el);

    // If not found, move on
    if (index < 0) return;

    // Add cloned `this` element(s) after target element
    uniqueSplice(siblings, index, 0, clonedSelf, parent);
    clones.push(clonedSelf);
  });
  return this.constructor.call(this.constructor, this._makeDomArray(clones));
};

/**
 * Removes the set of matched elements from the DOM and all their children.
 * `selector` filters the set of matched elements to be removed.
 *
 * @example
 *
 * $('.pear').remove()
 * $.html()
 * //=>  <ul id="fruits">
 * //      <li class="apple">Apple</li>
 * //      <li class="orange">Orange</li>
 * //    </ul>
 *
 * @param {string} [selector] - Optional selector for elements to remove.
 *
 * @see {@link http://api.jquery.com/remove/}
 */
exports.remove = function(selector) {
  var elems = this;

  // Filter if we have selector
  if (selector) elems = elems.filter(selector);

  domEach(elems, function(i, el) {
    var parent = el.parent || el.root;
    if (!parent) {
      return;
    }

    var siblings = parent.children,
        index = siblings.indexOf(el);

    if (index < 0) return;

    siblings.splice(index, 1);
    if (el.prev) {
      el.prev.next = el.next;
    }
    if (el.next) {
      el.next.prev = el.prev;
    }
    el.prev = el.next = el.parent = el.root = null;
  });

  return this;
};

/**
 * Replaces matched elements with `content`.
 *
 * @example
 *
 * const plum = $('<li class="plum">Plum</li>')
 * $('.pear').replaceWith(plum)
 * $.html()
 * //=> <ul id="fruits">
 * //     <li class="apple">Apple</li>
 * //     <li class="orange">Orange</li>
 * //     <li class="plum">Plum</li>
 * //   </ul>
 *
 * @param {cheerio|Function} content - Replacement for matched elements.
 *
 * @see {@link http://api.jquery.com/replaceWith/}
 */
exports.replaceWith = function(content) {
  var self = this;

  domEach(this, function(i, el) {
    var parent = el.parent || el.root;
    if (!parent) {
      return;
    }

    var siblings = parent.children,
        dom = self._makeDomArray(
          typeof content === 'function' ? content.call(el, i, el) : content
        ),
        index;

    // In the case that `dom` contains nodes that already exist in other
    // structures, ensure those nodes are properly removed.
    updateDOM(dom, null);

    index = siblings.indexOf(el);

    // Completely remove old element
    uniqueSplice(siblings, index, 1, dom, parent);
    el.parent = el.prev = el.next = el.root = null;
  });

  return this;
};

/**
 * Empties an element, removing all its children.
 *
 * @example
 *
 * $('ul').empty()
 * $.html()
 * //=>  <ul id="fruits"></ul>
 *
 * @see {@link http://api.jquery.com/empty/}
 */
exports.empty = function() {
  domEach(this, function(i, el) {
    _.forEach(el.children, function(child) {
      child.next = child.prev = child.parent = null;
    });

    el.children.length = 0;
  });
  return this;
};

/**
 * Gets an HTML content string from the first selected element. If `htmlString`
 * is specified, each selected element's content is replaced by the new
 * content.
 *
 * @param {string} str - If specified used to replace selection's contents.
 *
 * @example
 *
 * $('.orange').html()
 * //=> Orange
 *
 * $('#fruits').html('<li class="mango">Mango</li>').html()
 * //=> <li class="mango">Mango</li>
 *
 * @see {@link http://api.jquery.com/html/}
 */
exports.html = function(str) {
  if (str === undefined) {
    if (!this[0] || !this[0].children) return null;
    return html(this[0].children, this.options);
  }

  var opts = this.options;

  domEach(this, function(i, el) {
    _.forEach(el.children, function(child) {
      child.next = child.prev = child.parent = null;
    });

    var content = str.cheerio
      ? str.clone().get()
      : evaluate('' + str, opts, false);

    updateDOM(content, el);
  });

  return this;
};

exports.toString = function() {
  return html(this, this.options);
};

/**
 * Get the combined text contents of each element in the set of matched
 * elements, including their descendants. If `textString` is specified, each
 * selected element's content is replaced by the new text content.
 *
 * @param {string} [str] - If specified replacement for the selected element's contents.
 *
 * @example
 *
 * $('.orange').text()
 * //=> Orange
 *
 * $('ul').text()
 * //=>  Apple
 * //    Orange
 * //    Pear
 *
 * @see {@link http://api.jquery.com/text/}
 */
exports.text = function(str) {
  // If `str` is undefined, act as a "getter"
  if (str === undefined) {
    return text(this);
  } else if (typeof str === 'function') {
    // Function support
    var self = this;
    return domEach(this, function(i, el) {
      return exports.text.call(self._make(el), str.call(el, i, text([el])));
    });
  }

  var opts = this.options;

  // Append text node to each selected elements
  domEach(this, function(i, el) {
    _.forEach(el.children, function(child) {
      child.next = child.prev = child.parent = null;
    });

    var textNode = evaluate(' ', opts)[0];
    textNode.data = str;

    updateDOM(textNode, el);
  });

  return this;
};

/**
 * Clone the cheerio object.
 *
 * @example
 *
 * const moreFruit = $('#fruits').clone()
 *
 * @see {@link http://api.jquery.com/clone/}
 */
exports.clone = function() {
  return this._make(cloneDom(this.get(), this.options));
};
