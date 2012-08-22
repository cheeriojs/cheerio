/*
  Module dependencies
*/

var path = require('path'),
    select = require('cheerio-select'),
    parse = require('./api/parse').parse,
    utils = require('./api/utils'),
    _ = require('underscore');

/*
 * The API
 */

var api = ['traversing'];

/*
 * A simple way to check for HTML strings or ID strings
 */

var quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;

/*
 * Rough load
 */

var load = function(str, options) {
  var root = $.parse(str, options);

  return function(selector, context, r) {
    return new Cheerio(selector, context, r || root);
  };
};

/*
 * Instance of cheerio
 */

var Cheerio = module.exports = function(selector, context, root) {
  if(!(this instanceof Cheerio)) return new Cheerio(selector, context, root);

  // $(), $(null), $(undefined), $(false)
  if(!selector) return this;

  if(root) {
    if(typeof root === 'string') root = parse(root);
    this.root = this.make(root);
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
    context = this.root;
  }

  // console.log(selector);
  // console.log(this.root);
  // console.log(context);
  // If we still don't have a context, return
  if(!context) return this.make([]);

  // $context.find(str)
  return context.find(selector);
};

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

// /*
//  * Use underscore's extend method
//  */

// Cheerio.extend = function(obj, context) {
//   return _.extend(context || this, obj);
// };

/**
 * Plug in the API
 */
api.forEach(function(mod) {
  _.extend(Cheerio.prototype, require('./api/' + mod));
});
