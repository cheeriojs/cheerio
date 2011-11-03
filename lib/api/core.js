(function() {
  var $, get, pushStack, size, toArray, underscore;
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
    if (cheerio.isArray(elems)) {
      push.apply(ret, elems);
    } else {
      cheerio.merge(ret, elems);
    }
    ret.prevObject = this;
    ret.context = this.context;
    if (name === "find") {
      ret.selector = this.selector + (this.selector ? " " : "") + selector;
    } else {
      if (name) {
        ret.selector = this.selector + "." + name + "(" + selector + ")";
      }
    }
    return ret;
  };
  module.exports = $.fn.extend(exports);
}).call(this);
