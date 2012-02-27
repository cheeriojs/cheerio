/*
  Module Dependencies
*/
var htmlparser = require('htmlparser2'),
    $ = require('../cheerio'),
    isArray = Array.isArray;

/*
  Parser
*/
var parse = exports.parse = function(content) {
  var dom = eval(content),
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

var eval = exports.parse.eval = function(content) {

  var opts = $.fn.options,
      handler = new htmlparser.DefaultHandler(opts),
      parser = new htmlparser.Parser(handler, opts);
  
  parser.parseComplete(content);
  
  var dom = connect(handler.dom);
  
  return dom;
};

var connect = exports.parse.connect = function(dom, parent) {
  parent = parent || null;
  
  var prevIndex = -1,
      lastElem = null,
      len = dom.length;
    
  for(var i = 0; i < len; i++) {
    // If tag and no attributes, add empty object
    if($.isTag(dom[i].type) && dom[i].attribs === undefined)
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
    else if($.isTag(dom[i].type))
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
var update = exports.parse.update = function(arr, parent) {
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

module.exports = $.extend(exports);
