/*
  Module dependencies
*/

var path = require('path'),
    select = require('cheerio-select'),
    parse = require('./parse'),
    evaluate = parse.evaluate,
    updateDOM = parse.update,
    _ = require('underscore');

/*
 * The API
 */

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
  if (!(this instanceof Cheerio)) return new Cheerio(selector, context, root);

  // $(), $(null), $(undefined), $(false)
  if (!selector) return this;

  if (root) {
    if (typeof root === 'string') root = parse(root);
    this._root = this.make(root, this);
  }

  // $($)
  if (selector.cheerio) return selector;

  // $(dom)
  if (selector.name || Array.isArray(selector))
    return this.make(selector, this);

  // $(<html>)
  if (typeof selector === 'string' && isHtml(selector)) {
    return this.make(parse(selector).children);
  }

  // If we don't have a context, maybe we have a root, from loading
  if (!context) {
    context = this._root;
  } else if (typeof context === 'string') {
    if (isHtml(context)) {
      // $('li', '<ul>...</ul>')
      context = parse(context);
      context = this.make(context, this);
    } else {
      // $('li', 'ul')
      selector = [context, selector].join(' ');
      context = this._root;
    }
  }

  // If we still don't have a context, return
  if (!context) return this;

  // #id, .class, tag
  return context.parent().find(selector);
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
  ignoreWhitespace: false,
  xmlMode: false,
  lowerCaseTags: false
};

/*
 * Make cheerio an array-like object
 */

Cheerio.prototype.length = 0;
Cheerio.prototype.sort = [].splice;

/*
 * Check if string is HTML
 */
var isHtml = function(str) {
  // Faster than running regex, if str starts with `<` and ends with `>`, assume it's HTML
  if (str.charAt(0) === '<' && str.charAt(str.length - 1) === '>' && str.length >= 3) return true;

  // Run the regex
  var match = quickExpr.exec(str);
  return !!(match && match[1]);
};

/*
 * Make a cheerio object
 */

Cheerio.prototype.make = function(dom, context) {
  if (dom.cheerio) return dom;
  dom = (Array.isArray(dom)) ? dom : [dom];
  return _.extend(context || new Cheerio(), dom, { length: dom.length });
};

/**
 * Turn a cheerio object into an array
 */

Cheerio.prototype.toArray = function() {
  return [].slice.call(this, 0);
};

/**
 * Plug in the API
 */
api.forEach(function(mod) {
  _.extend(Cheerio.prototype, require('./api/' + mod));
});
