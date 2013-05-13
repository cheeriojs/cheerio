/**
 * Module dependencies
 */

var select = require('cheerio-select'),
    parse = require('./parse'),
    render = require('./render'),
    util = require('./utils'),
		_ = require('underscore'),
    decode = util.decode,
    likeArray = util.likeArray,
    isPlainObject = util.isPlainObject,
    isFunction = _.isFunction,
    slice = Array.prototype.slice,
    isArray = _.isArray;

var class2type = {};

// Populate the class2type map
_.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(name, index) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

/**
 * $.load(str)
 */

var load = exports.load = function(str, options) {
  var Cheerio = require('./cheerio'),
      root = parse(str, options);

  var initialize = function(selector, context, r) {
    return new Cheerio(selector, context, r || root);
  };

  // Add in the static methods
  initialize.__proto__ = exports;

  // Add in the root
  initialize._root = root;

  return initialize;
};

/**
 * $.html([selector | dom])
 */

var html = exports.html = function(dom) {
  if (dom) {
    dom = (typeof dom === 'string') ? select(dom, this._root) : dom;
    return render(dom);
  } else if (this._root && this._root.children) {
    return render(this._root.children);
  } else {
    return '';
  }
};

/**
 * $.text(dom)
 */

var text = exports.text = function(elems) {
  if (!elems) return '';

  var ret = '',
      len = elems.length,
      elem;

  for (var i = 0; i < len; i ++) {
    elem = elems[i];
    if (elem.type === 'text') ret += decode(elem.data);
    else if (elem.children && elem.type !== 'comment') {
      ret += text(elem.children);
    }
  }

  return ret;
};

/**
 * $.root()
 */
var root = exports.root = function() {
  return this(this._root);
};

/**
 * $.contains()
 */
var contains = exports.contains = function(container, contained) {

  // According to the jQuery API, an element does not "contain" itself
  if (contained === container) {
    return false;
  }

  // Step up the descendents, stopping when the root element is reached
  // (signaled by `.parent` returning a reference to the same object)
  while (contained && contained !== contained.parent) {
    contained = contained.parent;
    if (contained === container) {
      return true;
    }
  }

  return false;
};

var each = exports.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
        for (i = 0; i < elements.length; i++)
            if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
        for (key in elements)
            if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
};

var camelCase, camelize;
camelCase = camelize = exports.camelCase = function(str){
    return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' });
};


// Copy all but undefined properties from one or more
// objects to the `target` object.
var extend = exports.extend = function(){
    var args, current, tmpTarget, options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		stack = [], 
		i = 1,
		length = arguments.length,
		deep = false;
		
	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !_.isFunction(target) ) {
		target = {};
	}
	
	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}
	
	args = slice.call(arguments, i);
	tmpTarget = target;
	stack.push(args.shift());	
	while (stack.length) {
		current = stack.pop();
		if(typeof current !== 'undefined'){
			for(var prop in current){
				src = tmpTarget[ prop ];
				copy = current[ prop ];

				// Prevent never-ending loop
				if ( tmpTarget === copy ) {         
					continue;
				}
				
				if( deep && copy && ( isPlainObject(copy) || (copyIsArray = isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						tmpTarget[name] = src && isArray(src) ? src : [];
					} else {
						tmpTarget[name] = src && isPlainObject(src) ? src : {};
					}
					stack.push(copy);
					tmpTarget = tmpTarget[name];
				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					tmpTarget[ name ] = copy;
					continue;
				}
			}
		}
		if(args.length && stack.length == 0) stack.push(args.shift());
	}
	// Return the modified object
	return target;
};

/*
 * A simple way to check for HTML strings or ID strings
 */

var quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;

/*
 * Check if string is HTML
 */
var isHtml = exports.isHtml = function(str) {
  // Faster than running regex, if str starts with `<` and ends with `>`, assume it's HTML
  if (str.charAt(0) === '<' && str.charAt(str.length - 1) === '>' && str.length >= 3) return true;

  // Run the regex
  var match = quickExpr.exec(str);
  return !!(match && match[1]);
};

/*
 Creates an array of cheerio objects,
 parsing strings if necessary
 */
exports.makeCheerioArray = function(elems) {
	return _.reduce(elems, function(dom, elem) {
		return dom.concat(elem.cheerio ? elem.toArray() : parse.evaluate(elem));
	}, []);
};


exports.trim = function(str) { return str.trim() };
exports.type = 	function type(obj) {
	return obj == null ? String(obj) :
		class2type[class2type.toString.call(obj)] || "object"
};
exports.isPlainObject = util.isPlainObject;
exports.isFunction = _.isFunction;
exports.inArray = function(elem, array, i){
	return [].indexOf.call(array, elem, i)
};
exports.isArray = _.isArray;
exports.parseJSON = function(str){return JSON.parse(str)};
exports.map = function(list, iterator){return _.map(list, iterator)};