/*
  Module dependencies
*/

var path = require('path'),
    parse = require('./parse'),
    evaluate = parse.evaluate,
    _ = require('lodash');

/*
 * The API
 */

var api = ['attributes', 'traversing', 'manipulation', 'css'];

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
    this._root = Cheerio.call(this, root);
  }

  // $($)
  if (selector.cheerio) return selector;

  // $(dom)
  if (isNode(selector))
    selector = [selector];

  // $([dom])
  if (Array.isArray(selector)) {
    _.forEach(selector, function(elem, idx) {
      this[idx] = elem;
    }, this);
    this.length = selector.length;
    return this;
  }

  // $(<html>)
  if (typeof selector === 'string' && isHtml(selector)) {
    return Cheerio.call(this, parse(selector).children);
  }

  // If we don't have a context, maybe we have a root, from loading
  if (!context) {
    context = this._root;
  } else if (typeof context === 'string') {
    if (isHtml(context)) {
      // $('li', '<ul>...</ul>')
      context = parse(context);
      context = Cheerio.call(this, context);
    } else {
      // $('li', 'ul')
      selector = [context, selector].join(' ');
      context = this._root;
    }
  } else if (isNode(context))
    context = Cheerio.call(this, context);

  // If we still don't have a context, return
  if (!context) return this;

  // #id, .class, tag
  return context.find(selector);
};

/**
 * Mix in `static`
 */

_.extend(Cheerio, require('./static'));

/*
 * Set a signature of the object
 */

Cheerio.prototype.cheerio = '[cheerio object]';

/*
 * Cheerio default options
 */

Cheerio.prototype.options = {
  normalizeWhitespace: false,
  xmlMode: false,
  lowerCaseTags: false
};

/*
 * Make cheerio an array-like object
 */

Cheerio.prototype.length = 0;
Cheerio.prototype.splice = Array.prototype.splice;

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
 *
 * @api private
 */

Cheerio.prototype._make = function(dom) {
  var cheerio = new Cheerio(dom);
  cheerio.prevObject = this;
  return cheerio;
};

/**
 * Turn a cheerio object into an array
 *
 * @deprecated
 */

Cheerio.prototype.toArray = function() {
  return this.get();
};

/**
 * Plug in the API
 */
api.forEach(function(mod) {
  _.extend(Cheerio.prototype, require('./api/' + mod));
});

var isNode = function(obj) {
  return obj.name || obj.type === 'text' || obj.type === 'comment';
};
