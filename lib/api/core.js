(function() {
  var $, get, pushStack, siblingsAndMe, size, toArray, underscore;

  underscore = require('underscore');

  $ = require('../cheerio');

  size = exports.size = function() {
    return this.length;
  };

  toArray = exports.toArray = function() {
    return Array.prototype.slice.call(this, 0);
  };

  get = exports.get = function(num) {
    if (num === void 0) {
      return this.toArray();
    } else {
      if (num < 0) {
        return this[this.length + num];
      } else {
        return this[num];
      }
    }
  };

  pushStack = exports.pushStack = function(elems, name, selector) {
    var ret;
    ret = this.constructor();
    if ($.isArray(elems)) {
      push.apply(ret, elems);
    } else {
      $.merge(ret, elems);
    }
    ret.prevObject = this;
    ret.context = this.context;
    if (name === "find") {
      ret.selector = this.selector + (this.selector ? " " : "") + selector;
    } else {
      if (name) ret.selector = this.selector + "." + name + "(" + selector + ")";
    }
    return ret;
  };

  siblingsAndMe = exports.siblingsAndMe = function() {
    var element, raw, siblings;
    siblings = [];
    raw = this[0];
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

}).call(this);
