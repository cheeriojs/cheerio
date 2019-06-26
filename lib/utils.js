var cloneDeepWith = require('lodash/cloneDeepWith');

// HTML Tags
var tags = { tag: true, script: true, style: true };

/**
 * Check if the DOM element is a tag.
 *
 * `isTag(type)` includes `<script>` and `<style>` tags.
 *
 * @param {node} type - DOM node to check.
 *
 * @private
 */
exports.isTag = function(type) {
  if (type.type) type = type.type;
  return tags[type] || false;
};

/**
 * Convert a string to camel case notation.
 *
 * @param  {string} str - String to be converted.
 * @returns {string}      String in camel case notation.
 *
 * @private
 */
exports.camelCase = function(str) {
  return str.replace(/[_.-](\w|$)/g, function(_, x) {
    return x.toUpperCase();
  });
};

/**
 * Convert a string from camel case to "CSS case", where word boundaries are
 * described by hyphens ("-") and all characters are lower-case.
 *
 * @param  {string} str - String to be converted.
 * @returns {string}      String in "CSS case".
 *
 * @private
 */
exports.cssCase = function(str) {
  return str.replace(/[A-Z]/g, '-$&').toLowerCase();
};

// Iterate over each DOM element without creating intermediary Cheerio
// instances.
//
// This is indented for use internally to avoid otherwise unnecessary memory
// pressure introduced by _make.
exports.domEach = function(cheerio, fn) {
  var i = 0,
      len = cheerio.length;
  while (i < len && fn.call(cheerio, i, cheerio[i]) !== false) ++i;
  return cheerio;
};

/**
 * Create a deep copy of the given DOM structure.
 * Sets the parents of the copies of the passed nodes to `null`.
 *
 * @param {object} dom - The htmlparser2-compliant DOM structure.
 * @private
 */
exports.cloneDom = function(dom) {
  var parents =
    'length' in dom
      ? Array.prototype.map.call(dom, function(el) {
        return el.parent;
      })
      : [dom.parent];

  function filterOutParent(node) {
    if (parents.indexOf(node) > -1) {
      return null;
    }
  }

  return cloneDeepWith(dom, filterOutParent);
};

/*
 * A simple way to check for HTML strings or ID strings
 */
var quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w-]*)$)/;

/**
 * Check if string is HTML.
 *
 * @param {string} str - String to check.
 *
 * @private
 */
exports.isHtml = function(str) {
  // Faster than running regex, if str starts with `<` and ends with `>`, assume it's HTML
  if (
    str.charAt(0) === '<' &&
    str.charAt(str.length - 1) === '>' &&
    str.length >= 3
  )
    return true;

  // Run the regex
  var match = quickExpr.exec(str);
  return !!(match && match[1]);
};
