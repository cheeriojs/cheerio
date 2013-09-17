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
  if (undefined == prop) return get.call(this);

  if (arguments.length === 2 ||
    // When `prop` is a "plain" object
    (toString.call(prop) === '[object Object]')) {
    return this.each(function(idx) {
      set.call(this, prop, val);
    });
  } else {
    return get.call(this, prop);
  }
};

/**
 * Set styles of all elements.
 *
 * @param {String|Object} prop
 * @param {String} val
 * @return {self}
 * @api private
 */

function set(prop, val) {
  if ('string' == typeof prop) {
    var styles = get.call(this);
    if (val === '') {
      delete styles[prop];
    } else {
      styles[prop] = val;
    }
    return this.attr('style', stringify(styles));
  } else if ('object' == typeof prop) {
    Object.keys(prop).forEach(function(k){
      set.call(this, k, prop[k]);
    }, this);
    return this;
  }
}

/**
 * Get parsed styles of the first element.
 *
 * @param {String} prop
 * @return {Object}
 * @api private
 */

function get(prop) {
  var styles = parse(this.attr('style'));
  if (undefined == styles) throw new Error('undefined');
  if (typeof prop === 'string') {
    return styles[prop];
  } else if (_.isArray(prop)) {
    return _.pick(styles, prop);
  } else {
    return styles;
  }
}

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

  if ('' == styles) return {};

  return styles
    .split(/\s*;\s*/)
    .reduce(function(obj, str){
      var parts = str.split(/\s*:\s*/);
      if ('' == parts[0]) return obj;
      obj[parts[0]] = parts[1];
      return obj;
    }, {});
}
