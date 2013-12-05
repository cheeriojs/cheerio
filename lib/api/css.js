var _ = require('underscore');
var toString = Object.prototype.toString;

/**
 * Set / Get css.
 *
 * @param {String|Object} prop
 * @param {String} val
 * @return {self}
 * @api public
 */

exports.css = function(prop, val) {
  if (arguments.length === 2 ||
    // When `prop` is a "plain" object
    (toString.call(prop) === '[object Object]')) {
    return this.each(function(idx) {
      this._setCss(prop, val, idx);
    });
  } else {
    return this._getCss(prop);
  }
};

/**
 * Set styles of all elements.
 *
 * @param {String|Object} prop
 * @param {String} val
 * @param {Number} idx - optional index within the selection
 * @return {self}
 * @api private
 */

exports._setCss = function(prop, val, idx) {
  if ('string' == typeof prop) {
    var styles = this._getCss();
    if (_.isFunction(val)) {
      val = val.call(this[0], idx, this[0]);
    }

    if (val === '') {
      delete styles[prop];
    } else if (val != null) {
      styles[prop] = val;
    }

    return this.attr('style', stringify(styles));
  } else if ('object' == typeof prop) {
    Object.keys(prop).forEach(function(k){
      this._setCss(k, prop[k]);
    }, this);
    return this;
  }
};

/**
 * Get parsed styles of the first element.
 *
 * @param {String} prop
 * @return {Object}
 * @api private
 */

exports._getCss = function(prop) {
  var styles = parse(this.attr('style'));
  if (typeof prop === 'string') {
    return styles[prop];
  } else if (_.isArray(prop)) {
    return _.pick(styles, prop);
  } else {
    return styles;
  }
};

/**
 * Stringify `obj` to styles.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function stringify(obj) {
  return Object.keys(obj || {})
    .reduce(function(str, prop){
      return str += ''
        + (str ? ' ' : '')
        + prop
        + ': '
        + obj[prop]
        + ';';
    }, '');
}

/**
 * Parse `styles`.
 *
 * @param {String} styles
 * @return {Object}
 * @api private
 */

function parse(styles) {
  styles = (styles || '').trim();

  if (!styles) return {};

  return styles
    .split(';')
    .reduce(function(obj, str){
      var n = str.indexOf(':');
      // skip if there is no :, or if it is the first/last character
      if (n < 1 || n === str.length-1) return obj;
      obj[str.slice(0,n).trim()] = str.slice(n+1).trim();
      return obj;
    }, {});
}
