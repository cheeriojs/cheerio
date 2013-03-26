var _ = require('underscore'),
    select = require('cheerio-select'),
    utils = require('../utils'),
		Cheerio = require('../cheerio'),
		parse = require('../parse'),
    isTag = utils.isTag,
		slice = Array.prototype.slice,
		$ = require('../static');

var find = exports.find = function(selector) {
  if (!selector) return this;
  try {
    var elem = select(selector, [].slice.call(this.children()));
    return this.make(elem);
  } catch(e) {
    return this.make([]);
  }
};

var add = exports.add = function(selector,context){
	var elems = slice.call(arguments),
		dom = $.makeCheerioArray(elems);

	return this.each(function(i, el){
		var siblings = el.parent.children;
		siblings = siblings.concat(dom);
		parse.update(siblings, el.parent);
		el.parent.children = siblings;
	});
};

var parent = exports.parent = function(elem) {
  if (this[0] && this[0].parent)
    return this.make(this[0].parent);
  else
    return this;
};

var closest = exports.closest = function(selector, context){
	var node = this[0], collection = false, that = this
	if (typeof selector == 'object') collection = this.make(selector)

	while (node && !(collection ? collection.indexOf(node) >= 0 : filter.call(this.make(node), selector).length > 0)){
		node = node !== context && !utils.isDocument(node) && node.parent
	}
	return Cheerio(node)
}

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

var index = exports.index = function(element){
	return element ? indexOf(Cheerio(element)[0]) : this.parent().children().indexOf(this[0]);
};

var indexOf = exports.indexOf = [].indexOf;

var has = exports.has = function(selector){
	return this.filter(function(){
		return utils.isObject(selector) ?
			$.contains(this, selector) :
			Cheerio(this).find(selector).size()
	});
};

exports.not = function(selector){
	var nodes=[];
	if (_.isFunction(selector) && selector.call !== undefined){
		this.each(function(idx){
			if (!selector.call(this,idx)) nodes.push(this)
		});
	}else {
		var excludes = typeof selector == 'string' ? this.filter(selector) :
			(utils.likeArray(selector) && _.isFunction(selector.item)) ? slice.call(selector) : Cheerio(selector);
		this.each(function(i, el){
			if (excludes.indexOf(el) < 0) nodes.push(el)
		})
	};
	var result = Cheerio(nodes);
	return result;
};

exports.is = function(selector){
	return this.length > 0 && this.parent().find(selector).length > 0;
}

/*
//including text and comment nodes.
exports.contents = function() {
	var elems = _.reduce(this, function(memo, elem) {
		return memo.concat(elem.children);
	}, []);
	return Cheerio(elems);
};
*/

var contents = exports.contents = function() {
	var all = [];
	_.each(this, function(el, i) {
			_.each(el.children, function(ch, j) {
					all.push(ch);
				});
		});
	return this.make(all);
}