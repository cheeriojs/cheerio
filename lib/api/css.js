
/**
 * Set / Get css.
 *
 * @param {String|Object} prop
 * @param {String} val
 * @return {self}
 * @api public
 */

exports.css = function(prop, val){
  if (undefined == prop) return get(this);

  switch (arguments.length) {
    case 2: return set(this, prop, val);
    case 0: return get(this);
    case 1: return 'object' == typeof prop
      ? set(this, prop)
      : get(this, prop);
  }
};

/**
 * Set styles of all elements.
 *
 * @param {Cheerio} self
 * @param {String|Object} prop
 * @param {String} val
 * @return {self}
 * @api private
 */

function set(self, prop, val){
  if ('string' == typeof prop) {
    var styles = get(self);
    styles[prop] = val;
    return self.attr('style', stringify(styles));
  } else if ('object' == typeof prop) {
    Object.keys(prop).forEach(function(k){
      set(self, k, prop[k]);
    });
    return self;
  }
}

/**
 * Get parsed styles of the first element.
 *
 * @param {Cheerio} self
 * @param {String} prop
 * @return {Object}
 * @api private
 */

function get(self, prop){
  var styles = parse(self.attr('style'));
  if (undefined == styles) throw new Error('undefined');
  return 2 == arguments.length
    ? styles[prop]
    : styles;
}

/**
 * Stringify `obj` to styles.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function stringify(obj){
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

function parse(styles){
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
