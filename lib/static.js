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
    isWindow = util.isWindow,
    isDocument = util.isDocument,
    isPlainObject = util.isPlainObject,
    isFunction = _.isFunction,
    isObject = _.isObject,
    isArray = _.isArray,
    compact = _.compact,
    flatten = _.flatten;

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

function extend(target, source, deep) {
    for (key in source)
        if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
            if (isPlainObject(source[key]) && !isPlainObject(target[key]))
                target[key] = {};
            if (isArray(source[key]) && !isArray(target[key]))
                target[key] = [];
            extend(target[key], source[key], deep);
        }
        else if (source[key] !== undefined)
            target[key] = source[key];
}

// Copy all but undefined properties from one or more
// objects to the `target` object.
var extend = exports.extend = function(target){
    var deep, args = slice.call(arguments, 1);
    if (typeof target == 'boolean') {
        deep = target;
        target = args.shift();
    }
    args.forEach(function(arg){ extend(target, arg, deep); });
    return target;
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