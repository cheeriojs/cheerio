/*
  Module Dependencies
*/
var htmlparser = require('htmlparser2'),
    _ = require('lodash'),
    utils = require('./utils'),
    decode = utils.decode,
    isTag = utils.isTag,
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

  var dom;

  if (_.isString(content)) {
    dom = htmlparser.parseDOM(content, options);
  } else {
    dom = content;
  }

  _.forEach(dom, parseData);

  return dom;
};

/*
  Update the dom structure, for one changed layer
*/
var update = exports.update = function(arr, parent) {
  // normalize
  if (!Array.isArray(arr)) arr = [arr];

  // Update parent
  if (parent) {
    parent.children = arr;
  } else {
    parent = null;
  }

  // Update neighbors
  for (var i = 0; i < arr.length; i++) {
    var node = arr[i];

    // Cleanly remove existing nodes from their previous structures.
    var oldSiblings = node.parent && node.parent.children;
    if (oldSiblings && oldSiblings !== arr) {
      oldSiblings.splice(oldSiblings.indexOf(node), 1);
      if (node.prev) {
        node.prev.next = node.next;
      }
      if (node.next) {
        node.next.prev = node.prev;
      }
    }

    if (parent) {
      node.prev = arr[i - 1] || null;
      node.next = arr[i + 1] || null;
    } else {
      node.prev = node.next = null;
    }

    if (parent && parent.type === 'root') {
      node.root = parent;
      node.parent = null;
    } else {
      node.root = null;
      node.parent = parent;
    }
  }

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
    value = decode(elem.attribs[key]);

    if (key.substr(0, 5) === 'data-') {
      key = key.slice(5);
      key = camelCase(key);
      elem.data[key] = value;
    } else {
      elem.attribs[key] = value;
    }
  }

  _.forEach(elem.children, parseData);
};

// module.exports = $.extend(exports);
