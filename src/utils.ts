'use strict';
const htmlparser2 = require('htmlparser2');
const domhandler = require('domhandler');

/**
 * Check if the DOM element is a tag.
 *
 * `isTag(type)` includes `<script>` and `<style>` tags.
 *
 * @private
 * @param {Node} type - DOM node to check.
 * @returns {boolean}
 */
exports.isTag = htmlparser2.DomUtils.isTag;

/**
 * Convert a string to camel case notation.
 *
 * @private
 * @param {string} str - String to be converted.
 * @returns {string} String in camel case notation.
 */
exports.camelCase = function (str) {
  return str.replace(/[_.-](\w|$)/g, (_, x) => x.toUpperCase());
};

/**
 * Convert a string from camel case to "CSS case", where word boundaries are
 * described by hyphens ("-") and all characters are lower-case.
 *
 * @private
 * @param {string} str - String to be converted.
 * @returns {string} String in "CSS case".
 */
exports.cssCase = function (str) {
  return str.replace(/[A-Z]/g, '-$&').toLowerCase();
};

/**
 * Iterate over each DOM element without creating intermediary Cheerio instances.
 *
 * This is indented for use internally to avoid otherwise unnecessary memory
 * pressure introduced by _make.
 *
 * @param {Cheerio} cheerio - Cheerio object.
 * @param {Function} fn - Function to call.
 * @returns {Cheerio} The original instance.
 */
exports.domEach = function (cheerio, fn) {
  let i = 0;
  const len = cheerio.length;
  while (i < len && fn.call(cheerio, i, cheerio[i]) !== false) ++i;
  return cheerio;
};

/**
 * Create a deep copy of the given DOM structure. Sets the parents of the copies
 * of the passed nodes to `null`.
 *
 * @private
 * @param {Node | Node[]} dom - The htmlparser2-compliant DOM structure.
 * @returns {Node[]} - The cloned DOM.
 */
exports.cloneDom = function (dom) {
  const clone =
    'length' in dom
      ? Array.prototype.map.call(dom, (el) => domhandler.cloneNode(el, true))
      : [domhandler.cloneNode(dom, true)];

  // Add a root node around the cloned nodes
  const root = new domhandler.Document(clone);
  clone.forEach((node) => {
    node.parent = root;
  });

  return clone;
};

/**
 * A simple way to check for HTML strings. Tests for a `<` within a string,
 * immediate followed by a letter and eventually followed by a `>`.
 *
 * @private
 */
const quickExpr = /<[a-zA-Z][^]*>/;

/**
 * Check if string is HTML.
 *
 * @private
 * @param {string} str - String to check.
 * @returns {boolean} Indicates if `str` is HTML.
 */
exports.isHtml = function (str) {
  // Run the regex
  return quickExpr.test(str);
};
