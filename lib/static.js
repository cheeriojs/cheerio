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
    isArray = _.isArray;    

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

	args = Array.prototype.slice.call(arguments, i);
	stack.push(args.shift());
	tmpTarget = target;	
	while (stack.length) {
		current = stack.pop();
		if(typeof current !== 'undefined'){
			for(var prop in current){
				src = tmpTarget[ prop ];
				copy = current[ prop ];

				// Prevent never-ending loop
				if ( target === copy ) {         
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
				} else if ( typeof copy !== 'undefined' ) {
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
