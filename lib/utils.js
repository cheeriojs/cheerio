/**
 * Module Dependencies
 */
var utils = module.exports = {},
    entities = require('entities');

/**
 * HTML Tags
 */

var tags = { tag: true, script: true, style: true };

/**
 * Check if the DOM element is a tag
 *
 * isTag(type) includes <script> and <style> tags
 */

utils.isTag = function isTag(type) {
  return !!tags[type.type || type];
};

/**
 * Expose encode and decode methods from FB55's node-entities library
 *
 * 0 = XML, 1 = HTML4 and 2 = HTML5
 */

utils.encode = function encode(str) { return entities.encode(String(str), 0); };
utils.decode = function decode(str) { return entities.decode(str, 2); };
