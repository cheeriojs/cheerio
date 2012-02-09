/*
  Module Dependencies
*/
var htmlparser = require('htmlparser2'),
    utils = require('./utils'),
    isArray = Array.isArray,
    isTag = utils.isTag;

/*
  Parser
*/
var parser = exports = module.exports = function(content, opts) {
  var dom = eval(content, opts),
      root = {
        type : 'root',
        name : 'root',
        parent : null,
        prev : null,
        next : null,
        children : []
      };
  
  update(dom, root);
  
  return root;
};

var eval = exports.eval = function(content, opts) {
  opts = opts || { ignoreWhitespace: true };

  var handler = new htmlparser.DefaultHandler(opts),
      parser = new htmlparser.Parser(handler);
  
  parser.parseComplete(content);
  
  var dom = connect(handler.dom);
  
  return dom;
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

/*
  Update the dom structure, for one changed layer
  
  * Much faster than reconnecting
*/
var update = exports.update = function(arr, parent) {
  // normalize
  arr = isArray(arr) ? arr : [arr]
  
  // Update neighbors
  for(var i = 0; i < arr.length; i++) {
    arr[i].prev = arr[i-1] || null;
    arr[i].next = arr[i+1] || null;
    arr[i].parent = parent || null;
  }
  
  // Update parent
  parent.children = arr;
  
  return parent;
};

module.exports = exports;



