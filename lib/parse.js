/*
  Module Dependencies
*/
var htmlparser = require('htmlparser2'),
    utils = require('./utils'),
    isTag = utils.isTag;

/*
  Parser
*/
var parser = exports = module.exports = function(content) {
  var dom = eval(content),
      root = {
        type : 'root',
        name : 'root',
        parent : null,
        prev : null,
        next : null,
        children : []
      };
  
  root.children = connect(dom, root);
  
  return root;
};

var eval = exports.eval = function(content) {
  var handler = new htmlparser.DefaultHandler({
        ignoreWhitespace: true
      }),
      parser = new htmlparser.Parser(handler);
  
  parser.includeLocation = false;
  parser.parseComplete(content);
  
  return handler.dom;
};

var connect = exports.connect = function(dom, parent) {
  parent = parent || null;
  
  var prevIndex = -1,
      lastElem = null,
      len = dom.length;
    
  for(var i = 0; i < len; i++) {
    // If tag and no attributes, add empty object
    if(isTag(dom[i].type) && dom[i].attribs === undefined)
      dom[i].attribs = {};
    
    // Set parent
    dom[i].parent = parent;
    
    // Previous Sibling
    dom[i].prev = dom[prevIndex] || null;
    
    // Next sibling
    dom[i].next = null;
    if(lastElem) lastElem.next = dom[i];
    
    // Run through the children
    if(dom[i].children)
      connect(dom[i].children, dom[i]);
    else if(isTag(dom[i].type))
      dom[i].children = [];
    
    // Get ready for next element
    prevIndex = i;
    lastElem = dom[i];
  }
  
  return dom;
};

module.exports = exports;



