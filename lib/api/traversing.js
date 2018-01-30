'use strict'

const select = require('css-select')
const {
  domEach,
  isTag
} = require('../utils')
const { uniqueSort } = require('htmlparser2').DomUtils

exports.find = function (selectorOrHaystack) {
  const elems = Object.keys(this).reduce((memo, k) => {
    const elem = this[k]

    if (elem.children && elem.children.filter) {
      return memo.concat(elem.children.filter(isTag))
    }

    return memo
  }, [])

  const { contains } = this.constructor
  let haystack
  if (selectorOrHaystack && typeof selectorOrHaystack !== 'string') {
    if (selectorOrHaystack.cheerio) {
      haystack = selectorOrHaystack.get()
    } else {
      haystack = [selectorOrHaystack]
    }

    return this._make(haystack.filter(elem => {
      let idx, len
      for (idx = 0, len = this.length; idx < len; ++idx) {
        if (contains(this[idx], elem)) {
          return true
        }
      }
    }))
  }

  const options = {
    __proto__: this.options,
    context: this.toArray()
  }

  return this._make(select(selectorOrHaystack, elems, options))
}

/**
 * Get the parent of each element in the current set of matched elements,
 * optionally filtered by a selector.
 */
exports.parent = function (selector) {
  let set = []
  domEach(this, (idx, elem) => {
    const parentElem = elem.parent
    if (parentElem && set.indexOf(parentElem) < 0) {
      set.push(parentElem)
    }
  })

  if (arguments.length) {
    set = exports.filter.call(set, selector, this)
  }

  return this._make(set)
}

exports.parents = function (selector) {
  const parentNodes = []

  // When multiple DOM elements are in the original set, the resulting set will
  // be in *reverse* order of the original elements as well, with duplicates
  // removed.
  this.get().reverse().forEach(elem => {
    traverseParents(this, elem.parent, selector, Infinity).forEach(node => {
      if (parentNodes.indexOf(node) === -1) {
        parentNodes.push(node)
      }
    })
  })

  return this._make(parentNodes)
}

exports.parentsUntil = function (selector, filter) {
  let untilNode, untilNodes
  if (typeof selector === 'string') {
    untilNode = select(selector, this.parents().toArray(), this.options)[0]
  } else if (selector && selector.cheerio) {
    untilNodes = selector.toArray()
  } else if (selector) {
    untilNode = selector
  }

  // When multiple DOM elements are in the original set, the resulting set will
  // be in *reverse* order of the original elements as well, with duplicates
  // removed.
  const parentNodes = []
  this.toArray().reverse().forEach(elem => {
    while ((elem = elem.parent)) {
      if ((untilNode && elem !== untilNode) ||
        (untilNodes && untilNodes.indexOf(elem) === -1) ||
        (!untilNode && !untilNodes)) {
        if (isTag(elem) && parentNodes.indexOf(elem) === -1) {
          parentNodes.push(elem)
        }
      } else {
        break
      }
    }
  })

  return this._make(
    filter
      ? select(filter, parentNodes, this.options)
      : parentNodes
  )
}

/**
 * For each element in the set, get the first element that matches the selector
 * by testing the element itself and traversing up through its ancestors in the
 * DOM tree.
 */
exports.closest = function (selector) {
  const set = []
  if (!selector) {
    return this._make(set)
  }

  domEach(this, (idx, elem) => {
    const closestElem = traverseParents(this, elem, selector, 1)[0]

    // Do not add duplicate elements to the set
    if (closestElem && set.indexOf(closestElem) < 0) {
      set.push(closestElem)
    }
  })

  return this._make(set)
}

exports.next = function (selector) {
  if (!this[0]) {
    return this
  }

  const elems = []
  Object.keys(this).forEach(k => {
    let elem = this[k]
    while ((elem = elem.next)) {
      if (isTag(elem)) {
        elems.push(elem)
        return
      }
    }
  })

  return selector
    ? exports.filter.call(elems, selector, this)
    : this._make(elems)
}

exports.nextAll = function (selector) {
  if (!this[0]) {
    return this
  }

  const elems = []
  Object.keys(this).forEach(k => {
    let elem = this[k]
    while ((elem = elem.next)) {
      if (isTag(elem) && elems.indexOf(elem) === -1) {
        elems.push(elem)
      }
    }
  })

  return selector
    ? exports.filter.call(elems, selector, this)
    : this._make(elems)
}

exports.nextUntil = function (selector, filterSelector) {
  if (!this[0]) {
    return this
  }

  let untilNode, untilNodes
  if (typeof selector === 'string') {
    untilNode = select(selector, this.nextAll().get(), this.options)[0]
  } else if (selector && selector.cheerio) {
    untilNodes = selector.get()
  } else if (selector) {
    untilNode = selector
  }

  const elems = []
  Object.keys(this).forEach(k => {
    let elem = this[k]
    while ((elem = elem.next)) {
      if (
        (untilNode && elem !== untilNode) ||
        (untilNodes && untilNodes.indexOf(elem) === -1) ||
        (!untilNode && !untilNodes)
      ) {
        if (isTag(elem) && elems.indexOf(elem) === -1) {
          elems.push(elem)
        }
      } else {
        break
      }
    }
  })

  return filterSelector
    ? exports.filter.call(elems, filterSelector, this)
    : this._make(elems)
}

exports.prev = function (selector) {
  if (!this[0]) {
    return this
  }

  const elems = []
  Object.keys(this).forEach(k => {
    let elem = this[k]
    while ((elem = elem.prev)) {
      if (isTag(elem)) {
        elems.push(elem)
        return
      }
    }
  })

  return selector
    ? exports.filter.call(elems, selector, this)
    : this._make(elems)
}

exports.prevAll = function (selector) {
  if (!this[0]) {
    return this
  }

  const elems = []
  Object.keys(this).forEach(k => {
    let elem = this[k]
    while ((elem = elem.prev)) {
      if (isTag(elem) && elems.indexOf(elem) === -1) {
        elems.push(elem)
      }
    }
  })

  return selector
    ? exports.filter.call(elems, selector, this)
    : this._make(elems)
}

exports.prevUntil = function (selector, filterSelector) {
  if (!this[0]) {
    return this
  }

  let untilNode, untilNodes
  if (typeof selector === 'string') {
    untilNode = select(selector, this.prevAll().get(), this.options)[0]
  } else if (selector && selector.cheerio) {
    untilNodes = selector.get()
  } else if (selector) {
    untilNode = selector
  }

  const elems = []
  Object.keys(this).forEach(k => {
    let elem = this[k]

    while ((elem = elem.prev)) {
      if (
        (untilNode && elem !== untilNode) ||
        (untilNodes && untilNodes.indexOf(elem) === -1) ||
        (!untilNode && !untilNodes)
      ) {
        if (isTag(elem) && elems.indexOf(elem) === -1) {
          elems.push(elem)
        }
      } else {
        break
      }
    }
  })

  return filterSelector
    ? exports.filter.call(elems, filterSelector, this)
    : this._make(elems)
}

exports.siblings = function (selector) {
  const parent = this.parent()
  const root = parent ? parent.children() : this.siblingsAndMe()
  const elems = Object.keys(root)
    .filter(k => isTag(root[k]) && !this.is(root[k]))
    .map(k => root[k])

  if (selector !== undefined) {
    return exports.filter.call(elems, selector, this)
  }

  return this._make(elems)
}

exports.children = function (selector) {
  const elems = Object.keys(this).reduce((memo, k, i, arr) => {
    const elem = this[k]
    if (elem.children && elem.children.filter) {
      return memo.concat(elem.children.filter(isTag))
    }

    return memo
  }, [])

  if (selector === undefined) {
    return this._make(elems)
  }

  return exports.filter.call(elems, selector, this)
}

exports.contents = function () {
  const elems = Object.keys(this)
    .filter(e => !isNaN(e) && isFinite(e))
    .reduce((all, k) => {
      const elem = this[k]
      all.push(...elem.children)

      return all
    }, [])

  return this._make(elems)
}

exports.each = function (fn) {
  let i = 0
  const len = this.length

  while (i < len && fn.call(this[i], i, this[i]) !== false) {
    ++i
  }

  return this
}

exports.map = function (fn) {
  const elems = Object.keys(this)
    .filter(e => !isNaN(e) && isFinite(e))
    .reduce((memo, k, i) => {
      const el = this[k]
      const val = fn.call(el, i, el)
      return val ? memo.concat(val) : memo
    }, [])

  return this._make(elems)
}

function negate(fn) {
  return function (...args) {
    return !fn.apply(this, args)
  }
}

const makeFilterMethod = function (filterFn, neg) {
  return function (match, container) {
    let testFn
    container = container || this

    if (typeof match === 'string') {
      testFn = select.compile(match, container.options)
    } else if (typeof match === 'function') {
      testFn = function (el, i) {
        return match.call(el, i, el)
      }
    } else if (match.cheerio) {
      testFn = match.is.bind(match)
    } else {
      testFn = function (el) {
        return match === el
      }
    }

    if (neg) {
      return container._make(filterFn.call(this, negate(testFn)))
    }

    return container._make(filterFn.call(this, testFn))
  }
}

exports.filter = makeFilterMethod(Array.prototype.filter, false)
exports.not = makeFilterMethod(Array.prototype.filter, true)

exports.has = function (selectorOrHaystack) {
  const that = this

  return exports.filter.call(this, function () {
    return that._make(this).find(selectorOrHaystack).length > 0
  })
}

exports.first = function () {
  return this.length > 1 ? this._make(this[0]) : this
}

exports.last = function () {
  return this.length > 1 ? this._make(this[this.length - 1]) : this
}

/**
 * Reduce the set of matched elements to the one at the specified index.
 */
exports.eq = function (i) {
  i = Number(i)

  // Use the first identity optimization if possible
  if (i === 0 && this.length <= 1) {
    return this
  }

  if (i < 0) {
    i = this.length + i
  }

  return this[i] ? this._make(this[i]) : this._make([])
}

/**
 * Retrieve the DOM elements matched by the jQuery object.
 */
exports.get = function (i) {
  if (i == null) {
    return Array.prototype.slice.call(this)
  }

  return this[i < 0 ? (this.length + i) : i]
}

/**
 * Search for a given element from among the matched elements.
 */
exports.index = function (selectorOrNeedle) {
  let $haystack, needle

  if (arguments.length === 0) {
    $haystack = this.parent().children()
    needle = this[0]
  } else if (typeof selectorOrNeedle === 'string') {
    $haystack = this._make(selectorOrNeedle)
    needle = this[0]
  } else {
    $haystack = this
    needle = selectorOrNeedle.cheerio ? selectorOrNeedle[0] : selectorOrNeedle
  }

  return $haystack.get().indexOf(needle)
}

exports.slice = function (...args) {
  return this._make([].slice.apply(this, args))
}

function traverseParents(self, elem, selector, limit) {
  const elems = []
  while (elem && elems.length < limit) {
    if (!selector || exports.filter.call([elem], selector, self).length) {
      elems.push(elem)
    }
    elem = elem.parent
  }
  return elems
}

/**
 * End the most recent filtering operation in the current chain and return the
 * set of matched elements to its previous state.
 */
exports.end = function () {
  return this.prevObject || this._make([])
}

exports.add = function (other, context) {
  const selection = this._make(other, context)
  const contents = uniqueSort(selection.get().concat(this.get()))

  for (let i = 0; i < contents.length; ++i) {
    selection[i] = contents[i]
  }
  selection.length = contents.length

  return selection
}

/**
 * Add the previous set of elements on the stack to the current set, optionally
 * filtered by a selector.
 */
exports.addBack = function (selector) {
  return this.add(
    arguments.length ? this.prevObject.filter(selector) : this.prevObject
  )
}
