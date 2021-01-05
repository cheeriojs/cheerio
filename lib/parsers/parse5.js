'use strict';
var parse5 = require('parse5');
var treeAdapter = require('parse5-htmlparser2-tree-adapter');

// Attempts to match single html elements
// like <..></..>, <../>, <..>
var rsingleTag = /^<([a-z][^/\0>:\t\r\n\f ]*)[\t\r\n\f ]*\/?>(?:<\/\1>)?$/i;
// HTML namespace
var nsHtml = 'http://www.w3.org/1999/xhtml';

exports.parse = function (content, options, isDocument) {
  var opts = {
    treeAdapter: treeAdapter,
    sourceCodeLocationInfo: options.sourceCodeLocationInfo,
  };

  var dom;

  if (isDocument) {
    dom = parse5.parse(content, opts);
  } else {
    var parsed = rsingleTag.exec(content);
    var context = options.context;

    dom = parsed
      ? createSingleElementDOM(parsed[1])
      : parse5.parseFragment(context, content, opts);
  }
  return dom;
};

exports.render = function (dom) {
  // `dom-serializer` passes over the special "root" node and renders the
  // node's children in its place. To mimic this behavior with `parse5`, an
  // equivalent operation must be applied to the input array.
  var nodes = 'length' in dom ? dom : [dom];
  for (var index = 0; index < nodes.length; index += 1) {
    if (nodes[index].type === 'root') {
      nodes.splice.apply(nodes, [index, 1].concat(nodes[index].children));
    }
  }

  return parse5.serialize({ children: nodes }, { treeAdapter: treeAdapter });
};

/*
 * Creates new DOM document with single element.
 */
function createSingleElementDOM(element) {
  var elem = treeAdapter.createElement(element, nsHtml, []);
  var dom = treeAdapter.createDocument();
  treeAdapter.appendChild(dom, elem);
  return dom;
}
