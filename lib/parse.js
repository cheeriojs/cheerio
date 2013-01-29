/*
  Module Dependencies
*/
var htmlparser = require('htmlparser2'),
    _ = require('underscore'),
    isTag = require('./utils').isTag,
    isArray = Array.isArray;

/*
  Parser
*/
exports = module.exports = function(content, options) {
  var dom = evaluate(content, options);

  // Generic root element
  var root = {
    type: 'root',
    name: 'root',
    parent: null,
    prev: null,
    next: null,
    children: []
  };

  // Update the dom using the root
  update(dom, root);

  return root;
};

var evaluate = exports.evaluate = function(content, options) {
  // options = options || $.fn.options;

  var handler = new htmlparser.DomHandler(options),
      parser = new htmlparser.Parser(handler, options);

  parser.write(content);
  parser.done();

  return connect(handler.dom);
};

var connect = exports.connect = function(dom, parent) {
  parent = parent || null;

  var prevElem = null;

  _.each(dom, function(elem) {
    // If tag and no attributes, add empty object
    if (isTag(elem.type) && elem.attribs === undefined)
      elem.attribs = {};

    // Set parent
    elem.parent = parent;

    // Previous Sibling
    elem.prev = prevElem;

    // Next sibling
    elem.next = null;
    if (prevElem) prevElem.next = elem;

    // Run through the children
    if (elem.children)
      connect(elem.children, elem);
    else if (isTag(elem.type))
      elem.children = [];

    // Get ready for next element
    prevElem = elem;
  });

  return dom;
};

/*
  Update the dom structure, for one changed layer

  * Much faster than reconnecting
*/
var update = exports.update = function(arr, parent) {
  // normalize
  arr = isArray(arr) ? arr : [arr];

  // Update neighbors
  for (var i = 0; i < arr.length; i++) {
    arr[i].prev = arr[i - 1] || null;
    arr[i].next = arr[i + 1] || null;
    arr[i].parent = parent || null;
  }

  // Update parent
  parent.children = arr;

  return parent;
};

// module.exports = $.extend(exports);
