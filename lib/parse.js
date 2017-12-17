'use strict'

const htmlparser = require('htmlparser2')

/**
 * Parser
 */
exports = module.exports = function (content, options) {
  const dom = exports.evaluate(content, options)
  // Generic root element
  const root = exports.evaluate('<root></root>', options)[0]

  root.type = 'root'

  // Update the dom using the root
  exports.update(dom, root)

  return root
}

exports.evaluate = function (content, options) {
  let dom = content

  if (typeof content === 'string' || Buffer.isBuffer(content)) {
    dom = htmlparser.parseDOM(content, options)
  }

  return dom
}

/**
 * Update the dom structure, for one changed layer
 */
exports.update = function (arr, parent = null) {
  // normalize
  if (!Array.isArray(arr)) {
    arr = [arr]
  }

  // Update parent
  if (parent) {
    parent.children = arr
  }

  // Update neighbors
  for (let i = 0; i < arr.length; i++) {
    const node = arr[i]

    // Cleanly remove existing nodes from their previous structures.
    const oldParent = node.parent || node.root
    const oldSiblings = oldParent && oldParent.children
    if (oldSiblings && oldSiblings !== arr) {
      oldSiblings.splice(oldSiblings.indexOf(node), 1)
      if (node.prev) {
        node.prev.next = node.next
      }
      if (node.next) {
        node.next.prev = node.prev
      }
    }

    if (parent) {
      node.prev = arr[i - 1] || null
      node.next = arr[i + 1] || null
    } else {
      node.prev = node.next = null
    }

    if (parent && parent.type === 'root') {
      node.root = parent
      node.parent = null
    } else {
      node.root = null
      node.parent = parent
    }
  }

  return parent
}
