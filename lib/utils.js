/**
 * Module Dependencies
 */
var entities = require('entities');

/**
 * HTML Tags
 */

var tags = { tag : true, script : true, style : true };

/**
 * Check if the DOM element is a tag
 *
 * isTag(type) includes <script> and <style> tags
 */

exports.isTag = function(type) {
  if (type.type) type = type.type;
  return tags[type] || false;
};

/**
 * Expose encode and decode methods from FB55's node-entities library
 *
 * 0 = XML, 1 = HTML4 and 2 = HTML5
 */

exports.encode = function(str) { return entities.encode(String(str), 0); };
exports.decode = function(str) { return entities.decode(str, 2); };
