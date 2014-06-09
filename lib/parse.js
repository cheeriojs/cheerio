/*
  Module Dependencies
*/
var htmlparser = require('htmlparser2'),
    utils = require('./utils');

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

  if (typeof content === 'string' || Buffer.isBuffer(content)) {
    dom = htmlparser.parseDOM(content, options);
  } else {
    dom = content;
  }

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
    var oldParent = node.parent || node.root,
        oldSiblings = oldParent && oldParent.children;
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

// module.exports = $.extend(exports);
