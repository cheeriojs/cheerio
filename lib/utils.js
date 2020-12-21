var htmlparser2 = require('htmlparser2');
var domhandler = require('domhandler');

/**
 * Check if the DOM element is a tag.
 *
 * `isTag(type)` includes `<script>` and `<style>` tags.
 *
 * @param {node} type - DOM node to check.
 * @returns {boolean}
 *
 * @private
 */
exports.isTag = htmlparser2.DomUtils.isTag;

/**
 * Convert a string to camel case notation.
 *
 * @param  {string} str - String to be converted.
 * @returns {string}      String in camel case notation.
 *
 * @private
 */
exports.camelCase = function (str) {
  return str.replace(/[_.-](\w|$)/g, function (_, x) {
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
exports.cssCase = function (str) {
  return str.replace(/[A-Z]/g, '-$&').toLowerCase();
};

/**
 * Iterate over each DOM element without creating intermediary Cheerio
 * instances.
 *
 * This is indented for use internally to avoid otherwise unnecessary memory
 * pressure introduced by _make.
 *
 * @param {cheerio} cheerio - Cheerio object.
 * @param {Function} fn - Function to call.
 */
exports.domEach = function (cheerio, fn) {
  var i = 0;
  var len = cheerio.length;
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
exports.cloneDom = function (dom) {
  var clone =
    'length' in dom
      ? Array.prototype.map.call(dom, function (el) {
          return domhandler.cloneNode(el, true);
        })
      : [domhandler.cloneNode(dom, true)];

  // Add a root node around the cloned nodes
  var root = new domhandler.Document(clone);
  clone.forEach(function (node) {
    node.parent = root;
  });

  return clone;
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
exports.isHtml = function (str) {
  // Faster than running regex, if str starts with `<` and ends with `>`, assume it's HTML
  if (
    str.charAt(0) === '<' &&
    str.charAt(str.length - 1) === '>' &&
    str.length >= 3
  ) {
    return true;
  }

  // Run the regex
  var match = quickExpr.exec(str);
  return !!(match && match[1]);
};
