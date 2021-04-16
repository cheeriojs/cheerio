'use strict';
/*
 *Module Dependencies
 */
const { DomUtils } = require('htmlparser2');
const parseWithHtmlparser2 = require('./parsers/htmlparser2').parse;
const parseWithParse5 = require('./parsers/parse5').parse;
const { Document } = require('domhandler');

/*
 *Parser
 */
exports = module.exports = function parse(content, options, isDocument) {
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(content)) {
    content = content.toString();
  }

  if (typeof content === 'string') {
    return options.xmlMode || options._useHtmlParser2
      ? parseWithHtmlparser2(content, options)
      : parseWithParse5(content, options, isDocument);
  }

  if (
    typeof content === 'object' &&
    content != null &&
    content.type === 'root'
  ) {
    // If `content` is already a root, just return it
    return content;
  }

  // Add conent to new root element
  const root = new Document(content);

  // Update the DOM using the root
  exports.update(content, root);

  return root;
};

/**
 * Update the dom structure, for one changed layer.
 *
 * @param {Node[] | Node} arr - The new children.
 * @param {NodeWithChildren} parent - The new parent.
 * @returns {Node} The parent node.
 */
exports.update = function (arr, parent) {
  // Normalize
  if (!Array.isArray(arr)) arr = [arr];

  // Update parent
  if (parent) {
    parent.children = arr;
  } else {
    parent = null;
  }

  // Update neighbors
  for (let i = 0; i < arr.length; i++) {
    const node = arr[i];

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
