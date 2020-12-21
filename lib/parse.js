/*
  Module Dependencies
*/
var htmlparser = require('htmlparser2');
var parse5 = require('parse5');
var htmlparser2Adapter = require('parse5-htmlparser2-tree-adapter');
var domhandler = require('domhandler');
var DomUtils = htmlparser.DomUtils;

/*
  Parser
*/
exports = module.exports = function parse(content, options, isDocument) {
  // options = options || $.fn.options;

  var dom;

  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(content)) {
    content = content.toString();
  }

  if (typeof content === 'string') {
    var useHtmlParser2 = options.xmlMode || options._useHtmlParser2;

    dom = useHtmlParser2
      ? htmlparser.parseDocument(content, options)
      : parseWithParse5(content, options, isDocument);
  } else {
    if (
      typeof content === 'object' &&
      content != null &&
      content.type === 'root'
    ) {
      dom = content;
    } else {
      // Generic root element
      var root = new domhandler.Document(content);
      content.forEach(function (node) {
        node.parent = root;
      });

      dom = root;
    }
  }

  return dom;
};

function parseWithParse5(content, options, isDocument) {
  var parse = isDocument ? parse5.parse : parse5.parseFragment;

  return parse(content, {
    treeAdapter: htmlparser2Adapter,
    sourceCodeLocationInfo: options.sourceCodeLocationInfo,
  });
}

/*
  Update the dom structure, for one changed layer
*/
exports.update = function (arr, parent) {
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
    if (node.parent && node.parent.children !== arr) {
      DomUtils.removeElement(node);
    }

    if (parent) {
      node.prev = arr[i - 1] || null;
      node.next = arr[i + 1] || null;
    } else {
      node.prev = node.next = null;
    }

    node.parent = parent;
  }

  return parent;
};
