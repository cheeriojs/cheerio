/*
  Module dependencies
*/
var _ = require('underscore');
var utils = require('./utils');

var decode = utils.decode;
var encode = utils.encode;

/*
  Boolean Attributes
*/
var rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;

/*
  Format attributes
*/
var formatAttrs = function(attributes) {
  if (!attributes) return '';

  var output = [],
      value;

  // Loop through the attributes
  for (var key in attributes) {
    value = attributes[key];
    if (!value && (rboolean.test(key) || key === '/')) {
      output.push(key);
    } else {
      output.push(key + '="' + encode(decode(value)) + '"');
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
  'yield': 1
};

/*
  Tag types from htmlparser
*/
var tagType = {
  tag: 1,
  script: 1,
  link: 1,
  style: 1,
  template: 1
};

var render = module.exports = function(dom, opts) {
  if (!Array.isArray(dom) && !dom.cheerio) dom = [dom];
  opts = opts || {};

  var output = [],
      xmlMode = opts.xmlMode || false;

  _.each(dom, function(elem) {
    var pushVal;

    if (tagType[elem.type])
      pushVal = renderTag(elem, xmlMode);
    else if (elem.type === 'directive')
      pushVal = renderDirective(elem);
    else if (elem.type === 'comment')
      pushVal = renderComment(elem);
    else
      pushVal = renderText(elem);

    // Push rendered DOM node
    output.push(pushVal);

    if (elem.children)
      output.push(render(elem.children, opts));

    if ((!singleTag[elem.name] || xmlMode) && tagType[elem.type]) {
      if (!isClosedTag(elem, xmlMode)) {
        output.push('</' + elem.name + '>');
      }
    }
  });

  return output.join('');
};

var isClosedTag = function(elem, xmlMode){
  return (xmlMode && (!elem.children || elem.children.length === 0));
};

var renderTag = function(elem, xmlMode) {
  var tag = '<' + elem.name;

  if (elem.attribs && _.size(elem.attribs)) {
    tag += ' ' + formatAttrs(elem.attribs);
  }

  if (isClosedTag(elem, xmlMode)) {
    tag += '/';
  }

  return tag + '>';
};

var renderDirective = function(elem) {
  return '<' + elem.data + '>';
};

var renderText = function(elem) {
  return elem.data;
};

var renderComment = function(elem) {
  return '<!--' + elem.data + '-->';
};

// module.exports = $.extend(exports);
