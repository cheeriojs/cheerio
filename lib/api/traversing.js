(function() {
  var $, children, each, map, find, next, parent, prev, siblings, soupselect, _;

  _ = require("underscore");

  soupselect = require("soupselect");

  $ = require("../cheerio");

  /*
    Stupidly simple traversal
    
    TODO : Make it more jQuery-like
  */

  find = exports.find = function(selector) {
    var elem;
    if (!selector) return this;
    //console.log('before soup',selector, this);
    elem = soupselect.select(this.toArray(), selector);
    //console.log('after soup', elem)
    return $(elem);
  };

  parent = exports.parent = function(elem) {
    if (this[0] && this[0].parent) {
      return $(this[0].parent);
    } else {
      return null;
    }
  };

  next = exports.next = function(elem) {
    var nextSibling;
    if (!this[0]) return null;
    nextSibling = this[0].next;
    while (nextSibling) {
      if ($.isTag(nextSibling)) return $(nextSibling);
      nextSibling = nextSibling.next;
    }
    return null;
  };

  prev = exports.prev = function(elem) {
    var prevSibling;
    if (!this[0]) return null;
    prevSibling = this[0].prev;
    while (prevSibling) {
      if ($.isTag(prevSibling)) return $(prevSibling);
      prevSibling = prevSibling.prev;
    }
    return null;
  };

  siblings = exports.siblings = function(elem) {
    var sibs;
    var _this = this;
    if (this.parent()) {
      sibs = this.parent().children();
    } else {
      sibs = this.siblingsAndMe();
    }
    siblings = _.filter(sibs, function(elem) {
      return elem !== _this[0] && $.isTag(elem);
    });
    return $(siblings);
  };

  children = exports.children = function(selector) {
    if (this[0] && this[0].children) {
      children = _.filter(this[0].children, function(elem) {
        return $.isTag(elem);
      });
      if (selector !== void 0) {
        if (_.isNumber(selector)) {
          if (children[selector]) {
            return $(children[selector]);
          } else {
            return null;
          }
        } else {
          return $(children).find(selector);
        }
      }
      return $(children);
    } else {
      return null;
    }
  };

  each = exports.each = function(callback, args) {
    return $.each(this, callback, args);
  };

  map = exports.map = function(callback, args) {
    return $.map(this, callback, args);
  };

  module.exports = $.fn.extend(exports);

}).call(this);
