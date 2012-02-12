/*
  Module dependencies
*/
var _ = require('underscore'),
    utils = require('./utils'),
    isArray = Array.isArray;
    
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

var render = exports = module.exports = function(dom, output) {
  output = output || [];
  dom = (isArray(dom) || dom.cheerio) ? dom : [dom];
  
  var len = dom.length,
      elem;
  
  for(var i = 0; i < len; i++) {
    elem = dom[i];
    
    if(tagType[elem.type])
      output.push(renderTag(elem));
    else if(elem.type === 'directive')
      output.push(renderDirective(elem));
    else if(elem.type === 'comment')
      output.push(renderComment(elem));
    else
      output.push(renderText(elem));
    
    if(elem.children)
      output.push(render(elem.children));
    
    if(!singleTag[elem.name] && tagType[elem.type])
      output.push("</" + elem.name + ">");
  }
  
  return output.join('');
};

var renderTag = exports.renderTag = function(elem) {
  var tag = '<' + elem.name;
  
  if(elem.attribs && _.size(elem.attribs)) {
    tag += ' ' + utils.formatAttrs(elem.attribs);
  }
  
  if(!singleTag[elem.name]) {
    tag += '>';
  } else {
    tag = tag.trim().replace(/\/$/, '');
    tag += '/>';
  }

  return tag;
};

var renderDirective = exports.renderDirective = function(elem) {
  return "<" + elem.data + ">";
};

var renderText = exports.renderText = function(elem) {
  return elem.data;
};

var renderComment = exports.renderComment = function(elem) {
  return '<!--' + elem.data + '-->';
};

module.exports = exports;