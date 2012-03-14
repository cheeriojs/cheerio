/*
  Module dependencies
*/
var _ = require('underscore'),
    $ = require('../cheerio'),
    isArray = Array.isArray;

// Options affecting rendering
var xmlMode = $.fn.options.xmlMode,
    ignoreWhitespace = $.fn.options.ignoreWhitespace;

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

var formatAttrs = function(attributes) {
  if(!attributes) return '';
  
  var output = [],
      value;
  
  // Loop through the attributes
  for (var key in attributes) {
    value = attributes[key];
    if (key === value && (booleanAttributes[key] || key === '/')) {
      output.push(key);
    } else {
      output.push(key + '="' + value + '"');
    }
  }
  
  return output.join(' ');
};

/*
  Self-enclosing tags (stolen from node-htmlparser)
*/
var singleTag = {
  area: 1,
  base: 1,
  basefont: 1,
  br: 1,
  col: 1,
  frame: 1,
  hr: 1,
  img: 1,
  input: 1,
  isindex: 1,
  link: 1,
  meta: 1,
  param: 1,
  embed: 1,
  include: 1,
  yield: 1
};

/*
  Tag types from htmlparser
*/
var tagType = {
  tag : 1,
  script : 1,
  link : 1,
  style : 1,
  template : 1
};

// keeps depth for pretty parsing
var depth = 0;

var render = exports.render = function(dom, opts) {
  dom = (isArray(dom) || dom.cheerio) ? dom : [dom];
  opts = opts || {};
 
  var len = dom.length,
      output = [],
      tidy = (opts.tidy ? true : false),
      ending = (tidy ? "\n" : ""),
      elem;
 
  xmlMode = $.fn.options.xmlMode;
  ignoreWhitespace = $.fn.options.ignoreWhitespace;

  for(var i = 0; i < len; i++) {
    elem = dom[i];
    
    var pushVal = "";

    if(tagType[elem.type])
      pushVal = renderTag(elem);
    else if(elem.type === 'directive')
      pushVal = renderDirective(elem);
    else if(elem.type === 'comment')
      pushVal = renderComment(elem);
    else
      pushVal = renderText(elem);
  
    var spacing = '';
    if (tidy) {
      for(var k = 0; k < depth; k++){ spacing += '    ' };
      output.push(spacing + pushVal + "\n");
    } else {
      output.push(pushVal);
    }

    depth++;
    if(elem.children)
      output.push(render(elem.children, { tidy: tidy }));
    depth--;

    if((!singleTag[elem.name] || xmlMode) && tagType[elem.type])
      output.push(spacing + "</" + elem.name + ">" + ending);
  }

  return output.join('');
};

var renderTag = exports.render.renderTag = function(elem) {
  var tag = '<' + elem.name;
  
  if(elem.attribs && _.size(elem.attribs)) {
    tag += ' ' + formatAttrs(elem.attribs);
  }
  
  if(xmlMode || !singleTag[elem.name]) {
    tag += '>';
  } else {
    tag = tag.trim().replace(/\/$/, '');
    tag += '/>';
  }

  return tag;
};

var renderDirective = exports.render.renderDirective = function(elem) {
  return "<" + elem.data + ">";
};

var renderText = exports.render.renderText = function(elem) {
  return elem.data;
};

var renderComment = exports.render.renderComment = function(elem) {
  return '<!--' + elem.data + '-->';
};

module.exports = $.extend(exports);
