/**
 * Module Dependencies
 */
var entities = require('entities');
var _ = require('underscore');
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
var isDocument = exports.isDocument = function(obj){
	return obj && obj[0] && obj[0].type === 'root';
};
exports.isPlainObject = function(obj){ return _.isObject(obj) && !isWindow(obj) && obj.__proto__ == Object.prototype;};
exports.isObject = _.isObject;
exports.dasherize = function(str) {
	return str.replace(/::/g, '/')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
		.replace(/([a-z\d])([A-Z])/g, '$1_$2')
		.replace(/_/g, '-')
		.toLowerCase()
};

exports.funcArg = function(context, arg, idx, payload) {
	return _.isFunction(arg) ? arg.call(context, idx, payload) : arg
};

exports.uniq = function(array){ return Array.prototype.filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) };