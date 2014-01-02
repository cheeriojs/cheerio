var _ = require('underscore'),
    parse = require('../parse'),
    $ = require('../static'),
    updateDOM = parse.update,
    evaluate = parse.evaluate,
    encode = require('../utils').encode,
    slice = Array.prototype.slice;

// Create an array of nodes, recursing into arrays and parsing strings if
// necessary
var makeDomArray = function(elem) {
  if (elem == null) {
    return [];
  } else if (elem.cheerio) {
    return elem.toArray();
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

    return this.each(function(i, el) {
      if (_.isFunction(elems[0])) {
        dom = makeDomArray(elems[0].call(el, i, this.html()));
      }
      updateDOM(concatenator(dom, el.children || (el.children = [])), el);
    });
  };
};

var append = exports.append = _insert(function(dom, children) {
  return children.concat(dom);
});

var prepend = exports.prepend = _insert(function(dom, children) {
  return dom.concat(children);
});

var after = exports.after = function() {
  var elems = slice.call(arguments),
      dom = makeDomArray(elems);

  this.each(function(i, el) {
    var parent = el.parent || el.root,
        siblings = parent.children,
        index = siblings.indexOf(el);

    // If not found, move on
    if (!~index) return;

    if (_.isFunction(elems[0])) {
      dom = makeDomArray(elems[0].call(el, i));
    }

    // Add element after `this` element
    siblings.splice.apply(siblings, [++index, 0].concat(dom));

    // Update next, prev, and parent pointers
    updateDOM(siblings, parent);
  });

  return this;
};

var before = exports.before = function() {
  var elems = slice.call(arguments),
      dom = makeDomArray(elems);

  this.each(function(i, el) {
    var parent = el.parent || el.root,
        siblings = parent.children,
        index = siblings.indexOf(el);

    // If not found, move on
    if (!~index) return;

    if (_.isFunction(elems[0])) {
      dom = makeDomArray(elems[0].call(el, i));
    }

    // Add element before `el` element
    siblings.splice.apply(siblings, [index, 0].concat(dom));

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

  elems.each(function(i, el) {
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
  var dom = makeDomArray(content);

  this.each(function(i, el) {
    var parent = el.parent || el.root,
        siblings = parent.children,
        index;

    if (_.isFunction(content)) {
      dom = makeDomArray(content.call(el, i));
    }

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
  this.each(function(i, el) {
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

  str = str.cheerio ? str.toArray() : evaluate(str);

  this.each(function(i, el) {
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
  this.each(function(i, el) {
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
