/*
  Module Dependencies
*/
var htmlparser = require('htmlparser2'),
    _ = require('underscore'),
    isTag = require('./utils').isTag,
    camelCase = require('./utils').camelCase;

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

  _.forEach(handler.dom, parseData);

  return handler.dom;
};

/*
  Update the dom structure, for one changed layer
*/
var update = exports.update = function(arr, parent) {
  // normalize
  if (!Array.isArray(arr)) arr = [arr];

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

/**
 * Extract element data according to `data-*` element attributes and store in
 * a key-value hash on the element's `data` attribute. Repeat for any and all
 * descendant elements.
 *
 * @param  {Object} elem Element
 */
var parseData = exports.parseData = function(elem) {
  if (elem.data === undefined) elem.data = {};
  var value;
  for (var key in elem.attribs) {
    if (key.substr(0, 5) === 'data-') {
      value = elem.attribs[key];
      key = key.slice(5);
      key = camelCase(key);
      elem.data[key] = value;
    }
  }

  _.forEach(elem.children, parseData);
};

// module.exports = $.extend(exports);
