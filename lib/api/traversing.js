var _ = require('underscore'),
    select = require('cheerio-select'),
    utils = require('../utils'),
		Cheerio = require('../cheerio'),
		parse = require('../parse'),
    isTag = utils.isTag,
		slice = Array.prototype.slice,
		$ = require('../static');

var find = exports.find = function(selector) {
  return this.make(select(selector, [].slice.call(this.children())));
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


var parents = exports.parents = function(selector) {
  if (this[0] && this[0].parent) {
    var elems = traverseParents(this, this[0].parent, selector, Infinity);
    return elems.length ? elems : this;
  }
  return this;
};

var closest = exports.closest = function(selector) {
  if (this[0] && selector) {
    return traverseParents(this, this[0], selector, 1)
  }
  return [];
};

var next = exports.next = function() {
  var elem = this[0];
  while ((elem = elem.next)) if (isTag(elem)) return this.make(elem);
  return this.make([]);
};

var prev = exports.prev = function() {
  var elem = this[0];
  while ((elem = elem.prev)) if (isTag(elem)) return this.make(elem);
  return this.make([]);
};

var siblings = exports.siblings = function(selector) {
  var elems = _.filter(
    this.parent() ? this.parent().children() : this.siblingsAndMe(),
    function(elem) { return isTag(elem) && elem !== this[0]; },
    this
  );
  if (selector !== undefined) {
    elems = this.make(select(selector, elems));
  }
  return this.make(elems);
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
  var i = 0, len = this.length;
  while (i < len && fn.call(this.make(this[i]), i, this[i]) !== false) ++i;
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


var slice = exports.slice = function() {
  return this.make([].slice.apply(this, arguments));
};

function traverseParents(self, elem, selector, limit) {
  var elems = [];
  while (elems.length < limit && elem.type !== 'root') {
    if (!selector || self.make(elem).filter(selector).length) {
      elems.push(elem);
    }
    elem = elem.parent;
  }
  return self.make(elems);
}