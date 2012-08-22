/*
 * HTML Tags
 */

var tags = { tag : true, script : true, style : true };

/*
 * Check if the DOM element is a tag
 *
 * isTag(type) includes <script> and <style> tags
 */

var tag = exports.isTag = function(type) {
  if (type.type) type = type.type;
  return tags[type] || false;
};
