/*
  Module Dependencies
*/
var htmlparser = require('htmlparser2');
var parse5 = require('parse5');
var htmlparser2Adapter = require('parse5-htmlparser2-tree-adapter');

/*
  Parser
*/
exports = module.exports = function(content, options, isDocument) {
  var dom = exports.evaluate(content, options, isDocument);
  // Generic root element
  var root = exports.evaluate('<root></root>', options, false)[0];

  root.type = 'root';
  root.parent = null;

  // Update the dom using the root
  exports.update(dom, root);

  return root;
};

function parseWithParse5(content, options, isDocument) {
  var parse = isDocument ? parse5.parse : parse5.parseFragment;
  var root = parse(content, {
    treeAdapter: htmlparser2Adapter,
    sourceCodeLocationInfo: options.sourceCodeLocationInfo
  });

  return root.children;
}

exports.evaluate = function(content, options, isDocument) {
  // options = options || $.fn.options;

  var dom;

  if (Buffer.isBuffer(content)) content = content.toString();

  if (typeof content === 'string') {
    var useHtmlParser2 = options.xmlMode || options._useHtmlParser2;

    dom = useHtmlParser2
      ? htmlparser.parseDOM(content, options)
      : parseWithParse5(content, options, isDocument);
  } else {
    dom = content;
  }

  return dom;
};

/*
  Update the dom structure, for one changed layer
*/
exports.update = function(arr, parent) {
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
    var oldParent = node.parent || node.root;
    var oldSiblings = oldParent && oldParent.children;
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
