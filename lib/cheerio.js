/*global Symbol*/
/*
  Module dependencies
*/

var parse = require('./parse'),
    defaultOptions = require('./options').default,
    flattenOptions = require('./options').flatten,
    isHtml = require('./utils').isHtml,
    _ = {
      extend: require('lodash/assignIn'),
      bind: require('lodash/bind'),
      forEach: require('lodash/forEach'),
      defaults: require('lodash/defaults')
    };

/*
 * The API
 */
var api = [
  require('./api/attributes'),
  require('./api/traversing'),
  require('./api/manipulation'),
  require('./api/css'),
  require('./api/forms')
];

/**
 * Instance of cheerio. Methods are specified in the modules.
 * Usage of this constructor is not recommended. Please use $.load instead.
 *
 * @class
 * @hideconstructor
 * @param {string|cheerio|node|node[]} selector - The new selection.
 * @param {string|cheerio|node|node[]} [context] - Context of the selection.
 * @param {string|cheerio|node|node[]} [root] - Sets the root node.
 * @param {object} [options] - Options for the instance.
 *
 * @mixes attributes
 * @mixes css
 * @mixes forms
 * @mixes manipulation
 * @mixes traversing
 */
var Cheerio = (module.exports = function(selector, context, root, options) {
  if (!(this instanceof Cheerio))
    return new Cheerio(selector, context, root, options);

  this.options = _.defaults(
    flattenOptions(options),
    this.options,
    defaultOptions
  );

  // $(), $(null), $(undefined), $(false)
  if (!selector) return this;

  if (root) {
    if (typeof root === 'string') root = parse(root, this.options, false);
    this._root = Cheerio.call(this, root);
  }

  // $($)
  if (selector.cheerio) return selector;

  // $(dom)
  if (isNode(selector)) selector = [selector];

  // $([dom])
  if (Array.isArray(selector)) {
    _.forEach(
      selector,
      _.bind(function(elem, idx) {
        this[idx] = elem;
      }, this)
    );
    this.length = selector.length;
    return this;
  }

  // $(<html>)
  if (typeof selector === 'string' && isHtml(selector)) {
    return Cheerio.call(this, parse(selector, this.options, false).children);
  }

  // If we don't have a context, maybe we have a root, from loading
  if (!context) {
    context = this._root;
  } else if (typeof context === 'string') {
    if (isHtml(context)) {
      // $('li', '<ul>...</ul>')
      context = parse(context, this.options, false);
      context = Cheerio.call(this, context);
    } else {
      // $('li', 'ul')
      selector = [context, selector].join(' ');
      context = this._root;
    }
  } else if (!context.cheerio) {
    // $('li', node), $('li', [nodes])
    context = Cheerio.call(this, context);
  }

  // If we still don't have a context, return
  if (!context) return this;

  // #id, .class, tag
  return context.find(selector);
});

/*
 * Set a signature of the object
 */
Cheerio.prototype.cheerio = '[cheerio object]';

/*
 * Make cheerio an array-like object
 */
Cheerio.prototype.length = 0;
Cheerio.prototype.splice = Array.prototype.splice;

/*
 * Make a cheerio object
 *
 * @private
 */
Cheerio.prototype._make = function(dom, context) {
  var cheerio = new this.constructor(dom, context, this._root, this.options);
  cheerio.prevObject = this;
  return cheerio;
};

/**
 * Retrieve all the DOM elements contained in the jQuery set as an array.
 *
 * @example
 * $('li').toArray()
 * //=> [ {...}, {...}, {...} ]
 */
Cheerio.prototype.toArray = function() {
  return this.get();
};

// Support for (const element of $(...)) iteration:
if (typeof Symbol !== 'undefined') {
  Cheerio.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
}

// Plug in the API
api.forEach(function(mod) {
  _.extend(Cheerio.prototype, mod);
});

var isNode = function(obj) {
  return obj.name || obj.type === 'text' || obj.type === 'comment';
};
