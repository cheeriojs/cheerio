/**
 * Module Dependencies
 */
var entities = require('entities');

/**
 * HTML Tags
 */

var tags = { tag: true, script: true, style: true };

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
exports.likeArray = function(obj) { return typeof obj.length == 'number'; };
exports.isWindow = function(obj) { return obj != null && obj == obj.window; };
exports.isDocument = function(obj){ return obj != null && obj.nodeType == obj.DOCUMENT_NODE;};
exports.isPlainObject = function(obj){ return isObject(obj) && !isWindow(obj) && obj.__proto__ == Object.prototype;};

exports.dasherize = function(str) {
	return str.replace(/::/g, '/')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
		.replace(/([a-z\d])([A-Z])/g, '$1_$2')
		.replace(/_/g, '-')
		.toLowerCase()
};
