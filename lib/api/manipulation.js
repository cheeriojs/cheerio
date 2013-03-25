var _ = require('underscore'),
    parse = require('../parse'),
    $ = require('../static'),
    updateDOM = parse.update,
    evaluate = parse.evaluate,
    encode = require('../utils').encode,
    slice = Array.prototype.slice,
		util = require('../utils'),
		Cheerio = require('../cheerio');

/*
  Creates an array of cheerio objects,
  parsing strings if necessary
*/
var makeCheerioArray = function(elems) {
  return _.reduce(elems, function(dom, elem) {
    return dom.concat(elem.cheerio ? elem.toArray() : evaluate(elem));
  }, []);
};

var _insert = function(concatenator) {
  return function() {
    var elems = slice.call(arguments),
        dom = makeCheerioArray(elems);

    return this.each(function(i, el) {
      if (_.isFunction(elems[0])) return el; // not yet supported
      updateDOM(concatenator(dom, el.children || (el.children = [])), el);
    });
  };
};

var append = exports.append = _insert(function(dom, children) {
  return children.concat(dom);
});

/*
var appendTo = exports.appendTo = function(target){
	var elems = slice.call(arguments),
		dom = makeCheerioArray(elems);

};
*/

var prepend = exports.prepend = _insert(function(dom, children) {
  return dom.concat(children);
});

var prependTo = exports.prependTo = function(target){
	Cheerio(target).prepend(this);
	return this;
};

var after = exports.after = function() {
  var elems = slice.call(arguments),
      dom = makeCheerioArray(elems);

  this.each(function(i, el) {
    var siblings = el.parent.children,
        index = siblings.indexOf(el);

    // If not found, move on
    if (!~index) return;

    // Add element after `this` element
    siblings.splice.apply(siblings, [++index, 0].concat(dom));

    // Update next, prev, and parent pointers
    updateDOM(siblings, el.parent);
    el.parent.children = siblings;

  });

  return this;
};

var before = exports.before = function() {
  var elems = slice.call(arguments),
      dom = makeCheerioArray(elems);

  this.each(function(i, el) {
    var siblings = el.parent.children,
        index = siblings.indexOf(el);

    // If not found, move on
    if (!~index) return;

    // Add element before `el` element
    siblings.splice.apply(siblings, [index, 0].concat(dom));

    // Update next, prev, and parent pointers
    updateDOM(siblings, el.parent);
    el.parent.children = siblings;

  });

  return this;
};

/*
  remove([selector])
*/
var remove = exports.remove = function(selector) {
  var elems = this;

  // Filter if we have selector
  if (selector)
    elems = elems.filter(selector);

  elems.each(function(i, el) {
    var siblings = el.parent.children,
        index = siblings.indexOf(el);

    if (!~index) return;

    siblings.splice(index, 1);

    // Update next, prev, and parent pointers
    updateDOM(siblings, el.parent);
    el.parent.children = siblings;
  });

  return this;
};

var add = exports.add = function(selector,context){
	var elems = slice.call(arguments),
		dom = makeCheerioArray(elems);

	return this.each(function(i, el){
		var siblings = el.parent.children;
		siblings = siblings.concat(dom);
		updateDOM(siblings, el.parent);
		el.parent.children = siblings;
	});
};

var is = exports.is = function(selector){
	//return this.length > 0 && zepto.matches(this[0], selector)
};

var replaceWith = exports.replaceWith = function(content) {
  content = content.cheerio ? content.toArray() : evaluate(content);

  this.each(function(i, el) {
    var siblings = el.parent.children,
        index = siblings.indexOf(el);

    if (!~index) return;

    siblings.splice.apply(siblings, [index, 1].concat(content));

    updateDOM(siblings, el.parent);
    el.parent.children = siblings;
  });

  return this;
};

var empty = exports.empty = function() {
  this.each(function(i, el) {
    el.children = [];
  });
  return this;
};

/**
 * Set/Get the HTML
 */
var html = exports.html = function(str) {
  if (str === undefined) {
    if (!this[0] || !this[0].children) return null;
    return $.html(this[0].children);
  }

  str = str.cheerio ? str.toArray() : evaluate(str);

  this.each(function(i, el) {
    el.children = str;
    updateDOM(el.children, el);
  });

  return this;
};

var toString = exports.toString = function() {
  return $.html(this);
};

var text = exports.text = function(str) {
  // If `str` blank or an object
  if (!str || typeof str === 'object') {
    return $.text(this);
  } else if (_.isFunction(str)) {
    // Function support
    return this.each(function(i, el) {
      return this.text(str.call(el, i, this.text()));
    });
  }

  var elem = {
    data: encode(str),
    type: 'text',
    parent: null,
    prev: null,
    next: null,
    children: []
  };

  // Append text node to each selected elements
  this.each(function(i, el) {
    el.children = elem;
    updateDOM(el.children, el);
  });

  return this;
};

var clone = exports.clone = function() {
  // Turn it into HTML, then recreate it,
  // Seems to be the easiest way to reconnect everything correctly
  return this.constructor($.html(this));
};

var hide = exports.hide = function(){
	return this.css("display", "none");
};

var show = exports.show = function(){
	return this.css("display", "block");
};

var _getStyleNumber = function(el, property, value){
	//convert to number
	if(value !== undefined && typeof value != 'number'){
		value = parseInt(value);
		if(isNaN(value)) value = 0;
	};

	var result = el.css(property, value);
	//convert to int
	if(value === undefined){
		result = parseInt(result);
		if(isNaN(result)) result = 0;
	};

	return result;
};

var height = exports.height = function(value){
	return _getStyleNumber(this, 'height', value);
};

var width = exports.width = function(value){
	return _getStyleNumber(this, 'width', value);
};

var toggle = exports.toggle = function(setting){
	return this.each(function(){
		(setting === undefined ? this.css("display") == "none" : setting) ? this.show() : this.hide();
	});
};

var toggleClass = exports.toggleClass = function(name, when){
	return this.each(function(idx){
		var that = this;
		name.split(/\s+/g).forEach(function(klass){
			(when === undefined ? !that.hasClass(klass) : when) ?
				that.addClass(klass) : that.removeClass(klass)
		});
	});
};

var forEach = exports.forEach = function(iterator){
	_.every(this, iterator);
};

var get = exports.get = function(idx){
	return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length];
};

exports.size = function(){
	return this.length;
};

var wrap = exports.wrap = function(structure){
	var func = _.isFunction(structure)
	if (this[0] && !func){
		var dom   = Cheerio(structure).get(0),
			clone = dom.parentNode || this.length > 1;
	};

	return this.each(function(index){
		var target;
		if(func){
			target = structure.call(this, index);
		}else{
			target = clone ? Cheerio(dom).clone() : dom;
		};
		this.wrapAll(target);
		return this;
	});
};

var wrapAll = exports.wrapAll = function(structure){
	if (this[0]) {
		Cheerio(this[0]).before(structure = Cheerio(structure))
		var children
		// drill down to the inmost element
		while ((children = structure.children()).length) structure = children.first()
		Cheerio(structure).append(this);
	};
	return this;
};


var wrapInner = exports.wrapInner = function(structure){
	var func = _.isFunction(structure)
	return this.each(function(index){
		var self = Cheerio(this), contents = self.contents();
		var dom  = func ? structure.call(this, index) : structure;
		contents.length ? contents.wrapAll(dom) : self.append(dom);
	});
};

var unwrap = exports.unwrap = function(){
	this.parent().each(function(){
		var $this = Cheerio(this);
		$this.replaceWith($this.children());
	});
	return this;
};