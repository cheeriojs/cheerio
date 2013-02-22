var _ = require('underscore'),
    select = require('cheerio-select'),
    utils = require('../utils'),
    isTag = utils.isTag;

var find = exports.find = function(selector) {
  if (!selector) return this;
  try {
    var elem = select(selector, [].slice.call(this.children()));
    return this.make(elem);
  } catch(e) {
    return this.make([]);
  }
};

var parent = exports.parent = function(elem) {
  if (this[0] && this[0].parent)
    return this.make(this[0].parent);
  else
    return this;
};

var next = exports.next = function(elem) {
  if (!this[0]) return this;

  var nextSibling = this[0].next;
  while (nextSibling) {
    if (isTag(nextSibling)) return this.make(nextSibling);
    nextSibling = nextSibling.next;
  }

  return this;
};

var prev = exports.prev = function(elem) {
  if (!this[0]) return this;

  var prevSibling = this[0].prev;
  while (prevSibling) {
    if (isTag(prevSibling)) return this.make(prevSibling);
    prevSibling = prevSibling.prev;
  }
  return this;
};

var siblings = exports.siblings = function(elem) {
  if (!this[0]) return this;
  var self = this,
      siblings = (this.parent()) ? this.parent().children()
                                 : this.siblingsAndMe();

  siblings = _.filter(siblings, function(elem) {
    return (elem !== self[0] && isTag(elem));
  });

  return this.make(siblings);
};

var children = exports.children = function(selector) {

  var elems = _.reduce(this, function(memo, elem) {
    return memo.concat(_.filter(elem.children, isTag));
  }, []);

  if (selector === undefined) return this.make(elems);
  else if (_.isNumber(selector)) return this.make(elems[selector]);

  return this.make(elems).filter(selector);
};

var each = exports.each = function(fn) {
  var length = this.length,
      el, i;

  for (i = 0; i < length; ++i) {
    el = this[i];
    if (fn.call(this.make(el), i, el) === false) {
      break;
    }
  }

  return this;
};

var map = exports.map = function(fn) {
  return _.map(this, function(el, i) {
    return fn.call(this.make(el), i, el);
  }, this);
};

var filter = exports.filter = function(match) {
  var make = _.bind(this.make, this);
  return make(_.filter(this, _.isString(match) ?
    function(el) { return select(match, el)[0] === el; }
  : function(el, i) { return match.call(make(el), i, el); }
  ));
};

var first = exports.first = function() {
  return this[0] ? this.make(this[0]) : this;
};

var last = exports.last = function() {
  return this[0] ? this.make(this[this.length - 1]) : this;
};

// Reduce the set of matched elements to the one at the specified index.
var eq = exports.eq = function(i) {
  i = +i;
  if (i < 0) i = this.length + i;
  return this[i] ? this.make(this[i]) : this.make([]);
};

var slice = exports.slice = function() {
  return this.make([].slice.apply(this, arguments));
};
