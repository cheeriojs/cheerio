var _ = require('underscore'),
    parse = require('../parse'),
    $ = require('../static'),
    updateDOM = parse.update,
    evaluate = parse.evaluate,
    encode = require('../utils').encode,
    slice = Array.prototype.slice;

/*
  Creates an array of cheerio objects,
  parsing strings if necessary
*/
var makeCheerioArray = function(elems) {
  return _.reduce(elems, function(dom, elem) {
    return dom.concat(elem.cheerio ? elem.toArray() : evaluate(elem));
  }, []);
};

var append = exports.append = function() {
  var elems = slice.call(arguments),
      dom = makeCheerioArray(elems);

  this.each(function(i, el) {
    if (_.isFunction(elems[0])) {
      // No yet supported
      return this;
    } else {
      if (!el.children) el.children = [];
      el.children = el.children.concat(dom);
      updateDOM(el.children, el);
    }
  });

  return this;
};


/*
  TODO: Refactor, only one line difference between,
  this function and append
*/
var prepend = exports.prepend = function() {
  var elems = slice.call(arguments),
      dom = makeCheerioArray(elems);

  this.each(function(i, el) {
    if (_.isFunction(elems[0])) {
      // No yet supported
      return this;
    } else {
      if (!el.children) el.children = [];
      el.children = dom.concat(el.children);
      updateDOM(el.children, el);
    }
  });

  return this;
};

var after = exports.after = function() {
  var elems = slice.call(arguments),
      dom = makeCheerioArray(elems);

  this.each(function(i, el) {
    var siblings = el.parent.children,
        index = siblings.indexOf(el);

    // If not found, move on
    if (!~index) return;

    // Add element after `this` element
    siblings.splice.apply(siblings, [++index, 0].concat(dom));

    // Update next, prev, and parent pointers
    updateDOM(siblings, el.parent);
    el.parent.children = siblings;

  });

  return this;
};

var before = exports.before = function() {
  var elems = slice.call(arguments),
      dom = makeCheerioArray(elems);

  this.each(function(i, el) {
    var siblings = el.parent.children,
        index = siblings.indexOf(el);

    // If not found, move on
    if (!~index) return;

    // Add element before `el` element
    siblings.splice.apply(siblings, [index, 0].concat(dom));

    // Update next, prev, and parent pointers
    updateDOM(siblings, el.parent);
    el.parent.children = siblings;

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
    elems = elems.find(selector);

  elems.each(function(i, el) {
    var siblings = el.parent.children,
        index = siblings.indexOf(el);

    if (!~index) return;

    siblings.splice(index, 1);

    // Update next, prev, and parent pointers
    updateDOM(siblings, el.parent);
    el.parent.children = siblings;
  });

  return this;
};

var replaceWith = exports.replaceWith = function(content) {
  content = content.cheerio ? content.toArray() : evaluate(content);

  this.each(function(i, el) {
    var siblings = el.parent.children,
        index = siblings.indexOf(el);

    if (!~index) return;

    siblings.splice.apply(siblings, [index, 1].concat(content));

    updateDOM(siblings, el.parent);
    el.parent.children = siblings;
  });

  return this;
};

var empty = exports.empty = function() {
  this.each(function(i, el) {
    el.children = [];
  });
  return this;
};

var tidy = exports.tidy = function() {
  return $.tidy(this[0].children);
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

var text = exports.text = function(str) {
  // If `str` blank or an object
  if (!str || typeof str === 'object') {
    return $.text(this);
  } else if (_.isFunction(str)) {
    // Function support
    return this.each(function(i, el) {
      return this.text(str.call(el, i, this.text()));
    });
  }

  var elem = {
    data : encode(str),
    type : 'text',
    parent : null,
    prev : null,
    next : null,
    children : []
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
  return this.constructor($.html(this));
};
