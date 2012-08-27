/*
  Module dependencies
*/

var path = require('path'),
    select = require('cheerio-select'),
    parse = require('./parse'),
    evaluate = parse.evaluate,
    updateDOM = parse.update,
    utils = require('./api/utils'),
    _ = require('underscore');

/*
 * The API
 */
// ['core', 'utils', 'parse', 'render', 'attributes', 'traversing', 'manipulation']

var api = ['attributes', 'traversing', 'manipulation'];

/*
 * A simple way to check for HTML strings or ID strings
 */

var quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;

/**
 * Static Methods
 */

var $ = require('./static');

/*
 * Instance of cheerio
 */

var Cheerio = module.exports = function(selector, context, root) {
  if(!(this instanceof Cheerio)) return new Cheerio(selector, context, root);

  // $(), $(null), $(undefined), $(false)
  if(!selector) return this;

  if(root) {
    if(typeof root === 'string') root = parse(root);
    this._root = this.make(root);
  }

  // $($)
  if(selector.cheerio) return selector;

  // $(dom)
  if(selector.name || _.isArray(selector)) return this.make(selector);

  // $(<html>)
  if(typeof selector === 'string' && isHtml(selector)) {
    return this.make(parse(selector).children);
  }

  // Normalize the context
  if(context) {
    if( typeof context === 'string' ) context = parse(context).children;
    context = this.make(context);
  } else {
    context = this._root;
  }

  // If we still don't have a context, return
  if(!context) return this.make([]);

  return context.find(selector);
};

/**
 * Inherit from `static`
 */

Cheerio.__proto__ = require('./static');

/*
 * Set a signature of the object
 */

Cheerio.prototype.cheerio = '[cheerio object]';

/*
 * Cheerio default options
 */

Cheerio.prototype.options = {
  ignoreWhitespace : false,
  xmlMode : false,
  lowerCaseTags : false
};

/*
 * Make cheerio an array-like object
 */

Cheerio.prototype.length = 0;
Cheerio.prototype.sort = [].splice;

/*
 * Check if string is HTML
 */
function isHtml(str) {
  // Faster than running regex, if str starts with `<` and ends with `>`, assume it's HTML
  if ( str.charAt(0) === "<" && str.charAt( str.length - 1 ) === ">" && str.length >= 3 ) return true;

  // Run the regex
  var match = quickExpr.exec(str);
  return (match && match[1]) ? true : false;
}

/*
 * Make a cheerio object
 */

Cheerio.prototype.make = function(dom, context) {
  if(dom.cheerio) return dom;
  dom = (_.isArray(dom)) ? dom : [dom];
  return _.extend(context || new Cheerio(), dom, { length : dom.length });
};

/**
 * Turn a cheerio object into an array
 */

Cheerio.prototype.toArray = function() {
  return [].slice.call(this, 0);
};

/**
 * Get a cheerio-wrapped root object
 */

Cheerio.prototype.root = function() {
  console.log(this._root);
  return this.make(this._root);
};

// /*
//  * Use underscore's extend method
//  */

// Cheerio.extend = function(obj, context) {
//   return _.extend(context || this, obj);
// };

/*
 * Add in the static methods
 */

// Cheerio = _.extend(Cheerio, require('./static'));

/**
 * Plug in the API
 */
api.forEach(function(mod) {
  _.extend(Cheerio.prototype, require('./api/' + mod));
});
