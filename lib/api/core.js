var underscore = require('underscore'),
    $ = require('../cheerio'),
    isArray = Array.isArray;

var size = exports.size = function() {
  return this.length;
};

var toArray = exports.toArray = function() {
  return Array.prototype.slice.call(this, 0);
};

var get = exports.get = function(num) {
  if (num === undefined) return this.toArray();

  if (~num) {
    return this[num];
  } else {
    // Reverse lookup
    return this[this.length + num];
  }
};

var pushStack = exports.pushStack = function(elems, name, selector) {
  var ret = this.constructor();

  if (isArray(elems)) {
    push.apply(ret, elems);
  } else {
    $.merge(ret, elems);
  }

  ret.prevObject = this;
  ret.context = this.context;

  if (name === 'find') {
    ret.selector = this.selector + (this.selector ? ' ' : '') + selector;
  } else if (name) {
    ret.selector = this.selector + '.' + name + '(' + selector + ')';
  }
  return ret;
};

var siblingsAndMe = exports.siblingsAndMe = function() {
  var siblings = [],
      raw = this[0],
      element = raw;

  while (element.prev) {
    element = element.prev;
  }

  siblings.push(element);

  while (element.next) {
    element = element.next;
    siblings.push(element);
  }

  return siblings;
};

module.exports = $.fn.extend(exports);
