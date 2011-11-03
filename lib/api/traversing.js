(function() {
  var $, children, each, next, parent, prev, siblings, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  _ = require("underscore");
  $ = require("../cheerio");
  /*
    Stupidly simple traversal
    
    TODO : Make it more jQuery-like
  */
  parent = exports.parent = function(elem) {
    if (this[0] && this[0].parent) {
      return $(this[0].parent);
    } else {
      return null;
    }
  };
  next = exports.next = function(elem) {
    var nextSibling;
    if (!this[0]) {
      return null;
    }
    nextSibling = this[0].next;
    while (nextSibling) {
      if (nextSibling.type === "tag") {
        return $(nextSibling);
      }
      nextSibling = nextSibling.next;
    }
    return null;
  };
  prev = exports.prev = function(elem) {
    var prevSibling;
    if (!this[0]) {
      return null;
    }
    prevSibling = this[0].prev;
    while (prevSibling) {
      if (prevSibling.type === "tag") {
        return $(prevSibling);
      }
      prevSibling = prevSibling.prev;
    }
    return null;
  };
  siblings = exports.siblings = function(elem) {
    siblings = _.filter(this.parent().children(), __bind(function(elem) {
      return elem !== this[0] && elem.type === "tag";
    }, this));
    return $(siblings);
  };
  children = exports.children = function(selector) {
    if (this[0] && this[0].children) {
      children = _.filter(this[0].children, function(elem) {
        return elem.type === "tag";
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
  module.exports = $.fn.extend(exports);
}).call(this);
