'use strict'

const $ = require('../static')
const parse = require('../parse')
const updateDOM = parse.update
const { evaluate } = parse
const {
  cloneDom,
  domEach,
  isHtml
} = require('../utils')

const { slice } = Array.prototype

/**
 * Create an array of nodes, recursing into arrays and parsing strings if
 *necessary
 */
exports._makeDomArray = function makeDomArray(elem, clone) {
  if (elem == null) {
    return []
  } else if (elem.cheerio) {
    return clone ? cloneDom(elem.get(), elem.options) : elem.get()
  } else if (Array.isArray(elem)) {
    return elem.map(el => this._makeDomArray(el, clone))
      .reduce((a, b) => a.concat(b), [])
  } else if (typeof elem === 'string') {
    return evaluate(elem, this.options)
  }

  return clone ? cloneDom([elem]) : [elem]
}

const _insert = function (concatenator) {
  return function (...args) {
    const elems = slice.call(args)
    const lastIdx = this.length - 1

    return domEach(this, function (i, el) {
      let domSrc = elems

      if (typeof elems[0] === 'function') {
        domSrc = elems[0].call(el, i, $.html(el.children))
      }

      const dom = this._makeDomArray(domSrc, i < lastIdx)
      concatenator(dom, el.children, el)
    })
  }
}

/**
 * Modify an array in-place, removing some number of elements and adding new
 * elements directly following them.
 * @param {Array} array Target array to splice.
 * @param {Number} spliceIdx Index at which to begin changing the array.
 * @param {Number} spliceCount Number of elements to remove from the array.
 * @param {Array} newElems Elements to insert into the array.
 * @api private
 */
function uniqueSplice(array, spliceIdx, spliceCount, newElems, parent) {
  const spliceArgs = [spliceIdx, spliceCount].concat(newElems)
  const prev = array[spliceIdx - 1] || null
  const next = array[spliceIdx] || null
  let idx, len, prevIdx, node, oldParent

  // Before splicing in new elements, ensure they do not already appear in the
  // current array.
  for (idx = 0, len = newElems.length; idx < len; ++idx) {
    node = newElems[idx]
    oldParent = node.parent || node.root
    prevIdx = oldParent && oldParent.children.indexOf(newElems[idx])

    if (oldParent && prevIdx > -1) {
      oldParent.children.splice(prevIdx, 1)
      if (parent === oldParent && spliceIdx > prevIdx) {
        spliceArgs[0]--
      }
    }

    node.root = null
    node.parent = parent

    if (node.prev) {
      node.prev.next = node.next || null
    }

    if (node.next) {
      node.next.prev = node.prev || null
    }

    node.prev = newElems[idx - 1] || prev
    node.next = newElems[idx + 1] || next
  }

  if (prev) {
    prev.next = newElems[0]
  }

  if (next) {
    next.prev = newElems[newElems.length - 1]
  }

  return array.splice(...spliceArgs)
}

exports.appendTo = function (target) {
  if (!target.cheerio) {
    target = this.constructor.call(
      this.constructor,
      target,
      null,
      this._originalRoot
    )
  }
  target.append(this)

  return this
}

exports.prependTo = function (target) {
  if (!target.cheerio) {
    target = this.constructor.call(
      this.constructor,
      target,
      null,
      this._originalRoot
    )
  }
  target.prepend(this)

  return this
}

exports.append = _insert((dom, children, parent) => {
  uniqueSplice(children, children.length, 0, dom, parent)
})

exports.prepend = _insert((dom, children, parent) => {
  uniqueSplice(children, 0, 0, dom, parent)
})

exports.wrap = function (wrapper) {
  const wrapperFn = typeof wrapper === 'function' && wrapper
  const lastIdx = this.length - 1

  Object.keys(this).filter(k => {
    const el = this[k]
    const parent = el.parent || el.root

    if (parent) {
      return parent.children !== undefined
    }
  }).forEach((k, i) => {
    const el = this[k]
    const parent = el.parent || el.root
    const siblings = parent.children

    if (!parent) {
      return
    }

    if (wrapperFn) {
      wrapper = wrapperFn.call(el, i)
    }

    if (typeof wrapper === 'string' && !isHtml(wrapper)) {
      wrapper = this.parents().last().find(wrapper).clone()
    }

    const wrapperDom = this._makeDomArray(wrapper, i < lastIdx).slice(0, 1)
    let elInsertLocation = wrapperDom[0]
    // Find the deepest child. Only consider the first tag child of each node
    // (ignore text); stop if no children are found.
    let j = 0
    while (elInsertLocation && elInsertLocation.children) {
      if (j >= elInsertLocation.children.length) {
        break
      }

      if (elInsertLocation.children[j].type === 'tag') {
        elInsertLocation = elInsertLocation.children[j]
        j = 0
      } else {
        j++
      }
    }
    const index = siblings.indexOf(el)

    updateDOM([el], elInsertLocation)
    // The previous operation removed the current element from the `siblings`
    // array, so the `dom` array can be inserted without removing any
    // additional elements.
    uniqueSplice(siblings, index, 0, wrapperDom, parent)
  })

  return this
}

exports.after = function () {
  const elems = slice.call(arguments)

  domEach(this, (i, el) => {
    const parent = el.parent || el.root
    if (!parent) {
      return
    }

    const siblings = parent.children
    const index = siblings.indexOf(el)

    // If not found, move on
    if (index < 0) {
      return
    }

    let domSrc = elems
    if (typeof elems[0] === 'function') {
      domSrc = elems[0].call(el, i, $.html(el.children))
    }
    const dom = this._makeDomArray(domSrc, i < this.length - 1)

    // Add element after `this` element
    uniqueSplice(siblings, index + 1, 0, dom, parent)
  })

  return this
}

exports.insertAfter = function (target) {
  if (typeof target === 'string') {
    target = this.constructor.call(
      this.constructor,
      target,
      null,
      this._originalRoot
    )
  }

  target = this._makeDomArray(target)
  this.remove()

  const clones = []
  domEach(target, (i, el) => {
    const clonedSelf = this._makeDomArray(this.clone())
    const parent = el.parent || el.root
    if (!parent) {
      return
    }

    const siblings = parent.children
    const index = siblings.indexOf(el)

    // If not found, move on
    if (index < 0) {
      return
    }

    // Add cloned `this` element(s) after target element
    uniqueSplice(siblings, index + 1, 0, clonedSelf, parent)
    clones.push(clonedSelf)
  })

  return this.constructor.call(this.constructor, this._makeDomArray(clones))
}

exports.before = function () {
  const elems = slice.call(arguments)

  domEach(this, (i, el) => {
    const parent = el.parent || el.root
    if (!parent) {
      return
    }

    const siblings = parent.children
    const index = siblings.indexOf(el)

    // If not found, move on
    if (index < 0) {
      return
    }

    let domSrc = elems
    if (typeof elems[0] === 'function') {
      domSrc = elems[0].call(el, i, $.html(el.children))
    }
    const dom = this._makeDomArray(domSrc, i < this.length - 1)
    // Add element before `el` element
    uniqueSplice(siblings, index, 0, dom, parent)
  })

  return this
}

exports.insertBefore = function (target) {
  const clones = []

  if (typeof target === 'string') {
    target = this.constructor.call(
      this.constructor,
      target,
      null,
      this._originalRoot
    )
  }

  target = this._makeDomArray(target)
  this.remove()

  domEach(target, (i, el) => {
    const clonedSelf = this._makeDomArray(this.clone())
    const parent = el.parent || el.root
    if (!parent) {
      return
    }

    const siblings = parent.children
    const index = siblings.indexOf(el)

    // If not found, move on
    if (index < 0) {
      return
    }

    // Add cloned `this` element(s) after target element
    uniqueSplice(siblings, index, 0, clonedSelf, parent)
    clones.push(clonedSelf)
  })

  return this.constructor.call(this.constructor, this._makeDomArray(clones))
}

/**
 * remove([selector])
 */
exports.remove = function (selector) {
  let elems = this

  // Filter if we have selector
  if (selector) {
    elems = elems.filter(selector)
  }

  domEach(elems, (i, el) => {
    const parent = el.parent || el.root
    if (!parent) {
      return
    }

    const siblings = parent.children
    const index = siblings.indexOf(el)

    if (index < 0) {
      return
    }

    siblings.splice(index, 1)
    if (el.prev) {
      el.prev.next = el.next
    }

    if (el.next) {
      el.next.prev = el.prev
    }

    el.prev = el.next = el.parent = el.root = null
  })

  return this
}

exports.replaceWith = function (content) {
  domEach(this, (i, el) => {
    const parent = el.parent || el.root
    if (!parent) {
      return
    }

    const siblings = parent.children
    const dom = this._makeDomArray(
      typeof content === 'function'
        ? content.call(el, i, el)
        : content
    )

    // In the case that `dom` contains nodes that already exist in other
    // structures, ensure those nodes are properly removed.
    updateDOM(dom, null)
    const index = siblings.indexOf(el)

    // Completely remove old element
    uniqueSplice(siblings, index, 1, dom, parent)
    el.parent = el.prev = el.next = el.root = null
  })

  return this
}

exports.empty = function () {
  domEach(this, (i, el) => {
    Object.keys(el.children).forEach(k => {
      const child = el.children[k]
      child.next = child.prev = child.parent = null
    })

    el.children.length = 0
  })

  return this
}

/**
 * Set/Get the HTML
 */
exports.html = function (str) {
  if (str === undefined) {
    if (!this[0] || !this[0].children) {
      return null
    }

    return $.html(this[0].children, this.options)
  }

  domEach(this, (i, el) => {
    Object.keys(el.children).forEach(k => {
      const child = el.children[k]
      child.next = child.prev = child.parent = null
    })

    const content = str.cheerio
      ? str.clone().get()
      : evaluate(String(str), this.options)

    updateDOM(content, el)
  })

  return this
}

exports.toString = function () {
  return $.html(this, this.options)
}

exports.text = function (str) {
  // If `str` is undefined, act as a "getter"
  if (str === undefined) {
    return $.text(this)
  } else if (typeof str === 'function') {
    // Function support
    return domEach(this, (i, el) => {
      const $el = [el]
      return exports.text.call($el, str.call(el, i, $.text($el)))
    })
  }

  // Append text node to each selected elements
  domEach(this, (i, el) => {
    Object.keys(el.children).forEach(k => {
      const child = el.children[k]
      child.next = child.prev = child.parent = null
    })

    updateDOM({
      data: `${str}`,
      type: 'text',
      parent: el,
      prev: null,
      next: null,
      children: []
    }, el)
  })

  return this
}

exports.clone = function () {
  return this._make(cloneDom(this.get(), this.options))
}
