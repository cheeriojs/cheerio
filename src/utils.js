/*
  Boolean Attributes
*/
var booleanAttributes = {
  checked: true,
  selected: true,
  disabled: true,
  readonly: true,
  multiple: true,
  ismap: true,
  defer: true,
  declare: true,
  noresize: true,
  nowrap: true,
  noshade: true,
  compact: true
};

/*
  Tags
*/
var tags = { tag : true, script : true, style : true };

/*
  isTag(type) includes <script> and <style> tags
*/
var isTag = exports.isTag = function(type) {
  if(type.type) type = type.type;
  return tags[type] || false;
};

var formatAttrs = exports.formatAttrs = function(attributes) {
  if(!attributes) return '';
  
  var output = [],
      value;
  
  // Loop through the attributes
  for (var key in attributes) {
    value = attributes[key];
    if (key === value && (booleanAttributes[key] || key === '/')) {
      output.push(key);
    } else {
      output.push(key + ' = "' + value + '"');
    }
  }
  
  return output.join(' ');
};

module.exports = exports;