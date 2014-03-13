var _ = require('lodash'),
    parse = require('../parse'),
    $ = require('../static'),
    updateDOM = parse.update,
    evaluate = parse.evaluate,
    utils = require('../utils'),
    domEach = utils.domEach,
    encode = utils.encode,
    slice = Array.prototype.slice;
// Create an array of nodes, recursing into arrays and parsing strings if
// necessary
var makeDomArray = function(elem) {
  if (elem == null) {
    return [];
  } else if (elem.cheerio) {
    return elem.get();
  } else if (_.isArray(elem)) {
    return _.flatten(elem.map(makeDomArray));
  } else if (_.isString(elem)) {
    return evaluate(elem);
  } else {
    return [elem];
  }
};

var _insert = function(concatenator) {
  return function() {
    var elems = slice.call(arguments),
        dom = makeDomArray(elems);

    if (_.isFunction(elems[0])) {
      return this.each(function(i, el) {
        dom = makeDomArray(elems[0].call(el, i, this.html()));
        concatenator(dom, el.children);
        updateDOM(el.children, el);
      });
    } else {
      return domEach(this, function(i, el) {
        concatenator(dom, el.children);
        updateDOM(el.children, el);
      });
    }
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
 * @api private
 */
var uniqueSplice = function(array, spliceIdx, spliceCount, newElems) {
  var spliceArgs = [spliceIdx, spliceCount].concat(newElems);
  var idx, len, prevIdx;

  // Before splicing in new elements, ensure they do not already appear in the
  // current array.
  for (idx = 0, len = newElems.length; idx < len; ++idx) {
    prevIdx = array.indexOf(newElems[idx]);
    if (prevIdx > -1) {
      array.splice(prevIdx, 1);
    }
  }

  return array.splice.apply(array, spliceArgs);
};

var append = exports.append = _insert(function(dom, children) {
  uniqueSplice(children, children.length, 0, dom);
});

var prepend = exports.prepend = _insert(function(dom, children) {
  uniqueSplice(children, 0, 0, dom);
});

var after = exports.after = function() {
  var elems = slice.call(arguments),
      dom = makeDomArray(elems);

  domEach(this, function(i, el) {
    var parent = el.parent || el.root,
        siblings = parent.children,
        index = siblings.indexOf(el);

    // If not found, move on
    if (!~index) return;

    if (_.isFunction(elems[0])) {
      dom = makeDomArray(elems[0].call(el, i));
    }

    // Add element after `this` element
    uniqueSplice(siblings, ++index, 0, dom);

    // Update next, prev, and parent pointers
    updateDOM(siblings, parent);
  });

  return this;
};

var before = exports.before = function() {
  var elems = slice.call(arguments),
      dom = makeDomArray(elems);

  domEach(this, function(i, el) {
    var parent = el.parent || el.root,
        siblings = parent.children,
        index = siblings.indexOf(el);

    // If not found, move on
    if (!~index) return;

    if (_.isFunction(elems[0])) {
      dom = makeDomArray(elems[0].call(el, i));
    }

    // Add element before `el` element
    uniqueSplice(siblings, index, 0, dom);

    // Update next, prev, and parent pointers
    updateDOM(siblings, parent);
  });

  return this;
};

/*
  remove([selector])
*/
var remove = exports.remove = function(selector) {
  var elems = this;

  // Filter if we have selector
  if (selector)
    elems = elems.filter(selector);

  domEach(elems, function(i, el) {
    var parent = el.parent || el.root,
        siblings = parent.children,
        index = siblings.indexOf(el);

    if (!~index) return;

    siblings.splice(index, 1);

    // Update next, prev, and parent pointers
    updateDOM(siblings, parent);
  });

  return this;
};

var replaceWith = exports.replaceWith = function(content) {
  domEach(this, function(i, el) {
    var parent = el.parent || el.root,
        siblings = parent.children,
        dom = makeDomArray(_.isFunction(content) ? content.call(el, i, el) : content),
        index;

    // In the case that `dom` contains nodes that already exist in other
    // structures, ensure those nodes are properly removed.
    updateDOM(dom, null);

    index = siblings.indexOf(el);

    // Completely remove old element
    siblings.splice.apply(siblings, [index, 1].concat(dom));
    el.parent = el.prev = el.next = null;

    updateDOM(siblings, parent);
  });

  return this;
};

var empty = exports.empty = function() {
  domEach(this, function(i, el) {
    el.children = [];
  });
  return this;
};

/**
 * Set/Get the HTML
 */
var html = exports.html = function(str) {
  if (str === undefined) {
    if (!this[0] || !this[0].children) return null;
    return $.html(this[0].children);
  }

  str = str.cheerio ? str.get() : evaluate(str);

  domEach(this, function(i, el) {
    el.children = str;
    updateDOM(el.children, el);
  });

  return this;
};

var toString = exports.toString = function() {
  return $.html(this);
};

var text = exports.text = function(str) {
  // If `str` is undefined, act as a "getter"
  if (str === undefined) {
    return $.text(this);
  } else if (_.isFunction(str)) {
    // Function support
    return this.each(function(i, el) {
      return this.text(str.call(el, i, this.text()));
    });
  }

  var elem = {
    data: encode(str),
    type: 'text',
    parent: null,
    prev: null,
    next: null,
    children: []
  };

  // Append text node to each selected elements
  domEach(this, function(i, el) {
    el.children = elem;
    updateDOM(el.children, el);
  });

  return this;
};

var clone = exports.clone = function() {
  // Turn it into HTML, then recreate it,
  // Seems to be the easiest way to reconnect everything correctly
  return this._make($.html(this));
};
