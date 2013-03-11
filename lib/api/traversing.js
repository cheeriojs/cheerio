var traversing = module.exports = {},
    _ = require('underscore'),
    select = require('cheerio-select'),
    utils = require('../utils'),
    isTag = utils.isTag;

traversing.find = function find(selector) {
  if (!selector) return this;
  try {
    var elem = select(selector, [].slice.call(this.children()));
    return this.make(elem);
  } catch(e) {
    return this.make([]);
  }
};

traversing.parent = function parent(elem) {
  if (this[0] && this[0].parent)
    return this.make(this[0].parent);
  else
    return this;
};

traversing.next = function next(elem) {
  if (!this[0]) return this;

  var nextSibling = this[0].next;
  while (nextSibling) {
    if (isTag(nextSibling)) return this.make(nextSibling);
    nextSibling = nextSibling.next;
  }
  return this;
};

traversing.prev = function prev(elem) {
  if (!this[0]) return this;

  var prevSibling = this[0].prev;
  while (prevSibling) {
    if (isTag(prevSibling)) return this.make(prevSibling);
    prevSibling = prevSibling.prev;
  }
  return this;
};

traversing.siblings = function siblings(elem) {
  if (!this[0]) return this;
  return this.make(_.filter(
    this.parent() ? this.parent().children() : this.siblingsAndMe(),
    function(elem) { return elem !== this[0] && isTag(elem); },
    this));
};

traversing.children = function children(selector) {
  var elems = _.reduce(this, function(memo, elem) {
    return memo.concat(_.filter(elem.children, isTag));
  }, []);

  if (selector === undefined) return this.make(elems);
  else if (_.isNumber(selector)) return this.make(elems[selector]);
  return this.make(elems).filter(selector);
};

traversing.each = function each(fn) {
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

traversing.map = function map(fn) {
  return _.map(this, function(el, i) {
    return fn.call(this.make(el), i, el);
  }, this);
};

traversing.filter = function filter(match) {
  var make = _.bind(this.make, this);
  return make(_.filter(this, _.isString(match) ?
    function(el) { return select(match, el)[0] === el; }
  : function(el, i) { return match.call(make(el), i, el); }
  ));
};

traversing.first = function first() {
  return this[0] ? this.make(this[0]) : this;
};

traversing.last = function last() {
  return this[0] ? this.make(this[this.length - 1]) : this;
};

// Reduce the set of matched elements to the one at the specified index.
traversing.eq = function eq(i) {
  i = +i;
  if (i < 0) i = this.length + i;
  return this[i] ? this.make(this[i]) : this.make([]);
};

var slice = exports.slice = function() {
  return this.make([].slice.apply(this, arguments));
};
