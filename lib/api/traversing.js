var _ = require('underscore'),
    select = require('cheerio-select'),
    $ = require('../cheerio');

var find = exports.find = function(selector) {
  if (!selector) return this;
  try {
    var elem = select(selector, this.toArray());
    return $(elem);
  } catch(e) {
    return [];
  }
};

var parent = exports.parent = function(elem) {
  if (this[0] && this[0].parent)
    return $(this[0].parent);
  else
    return $();
};

var next = exports.next = function(elem) {
  if (!this[0]) return $();

  var nextSibling = this[0].next;
  while (nextSibling) {
    if ($.isTag(nextSibling)) return $(nextSibling);
    nextSibling = nextSibling.next;
  }
  return $();
};

var prev = exports.prev = function(elem) {
  if (!this[0]) return $();

  var prevSibling = this[0].prev;
  while (prevSibling) {
    if ($.isTag(prevSibling)) return $(prevSibling);
    prevSibling = prevSibling.prev;
  }
  return $();
};

var siblings = exports.siblings = function(elem) {
  if (!this[0]) return $();

  var self = this,
      siblings = (this.parent()) ? this.parent().children()
                                 : this.siblingsAndMe();

  siblings = _.filter(siblings, function(elem) {
    return (elem !== self[0] && $.isTag(elem));
  });

  return $(siblings);
};

var children = exports.children = function(selector) {
  if (!this[0] || !this[0].children) return $();

  var children = _.filter(this[0].children, function(elem) {
    return ($.isTag(elem));
  });

  if (selector === undefined) return $(children);
  else if (_.isNumber(selector)) return $(children[selector]);

  return $(children).find(selector);
};

var each = exports.each = function(callback, args) {
  return $.each(this, callback, args);
};

var map = exports.map = function(fn, args) {
  var self = this;
  return self.toArray().map(function(el, i) {
    return fn.call(self[i], i, el);
  });
};

var first = exports.first = function() {
    return this[0] ? $(this[0]) : $();
};

var last = exports.last = function() {
    return this[0] ? $(this[this.length - 1]) : $();
};

// Reduce the set of matched elements to the one at the specified index.
var eq = exports.eq = function(i) {
  i = +i;
  if (i < 0) i = this.length + i;
  return this[i] ? $(this[i]) : $();
};

module.exports = $.fn.extend(exports);
