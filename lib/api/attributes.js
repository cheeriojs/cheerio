'use strict'

const $ = require('../static')
const {
  camelCase,
  cssCase,
  domEach,
  isTag
} = require('../utils')

const hasOwn = Object.prototype.hasOwnProperty
const rspace = /\s+/
const dataAttrPrefix = 'data-'

// Lookup table for coercing string data-* attributes to their corresponding
// JavaScript primitives
const primitives = {
  null: null,
  true: true,
  false: false
}

// Attributes that are booleans
const rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i
// Matches strings that look like JSON objects or arrays
const rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/

const getAttr = function (elem, name) {
  if (!elem || !isTag(elem)) {
    return
  }

  if (!elem.attribs) {
    elem.attribs = {}
  }

  // Return the entire attribs object if no attribute specified
  if (!name) {
    return elem.attribs
  }

  if (hasOwn.call(elem.attribs, name)) {
    // Get the (decoded) attribute
    return rboolean.test(name) ? name : elem.attribs[name]
  }

  // Mimic the DOM and return text content as value for `option's`
  if (elem.name === 'option' && name === 'value') {
    return $.text(elem.children)
  }

  // Mimic DOM with default value for radios/checkboxes
  if (
    elem.name === 'input' &&
    (elem.attribs.type === 'radio' || elem.attribs.type === 'checkbox') &&
    name === 'value'
  ) {
    return 'on'
  }
}

const setAttr = function (el, name, value) {
  if (value === null) {
    removeAttribute(el, name)
  } else {
    el.attribs[name] = `${value}`
  }
}

exports.attr = function (name, value) {
  // Set the value (with attr map support)
  if (typeof name === 'object' || value !== undefined) {
    if (typeof value === 'function') {
      return domEach(this, (i, el) => {
        setAttr(el, name, value.call(el, i, el.attribs[name]))
      })
    }

    return domEach(this, (i, el) => {
      if (!isTag(el)) {
        return
      }

      if (typeof name === 'object') {
        Object.keys(name).forEach(k => setAttr(el, k, name[k]))
      } else {
        setAttr(el, name, value)
      }
    })
  }

  return getAttr(this[0], name)
}

const getProp = function (el, name) {
  if (!el || !isTag(el)) {
    return
  }

  return el.hasOwnProperty(name)
    ? el[name]
    : rboolean.test(name)
      ? getAttr(el, name) !== undefined
      : getAttr(el, name)
}

const setProp = function (el, name, value) {
  el[name] = rboolean.test(name) ? Boolean(value) : value
}

exports.prop = function (name, value) {
  let i = 0
  let property

  if (typeof name === 'string' && value === undefined) {
    switch (name) {
      case 'style':
        property = this.css()
        Object.keys(property).forEach(v => {
          property[i++] = v
        })
        property.length = i

        break
      case 'tagName':
      case 'nodeName':
        property = this[0].name.toUpperCase()
        break
      default:
        property = getProp(this[0], name)
    }

    return property
  }

  if (typeof name === 'object' || value !== undefined) {
    if (typeof value === 'function') {
      return domEach(this, (j, el) => {
        setProp(el, name, value.call(el, j, getProp(el, name)))
      })
    }

    return domEach(this, (__, el) => {
      if (!isTag(el)) {
        return
      }

      if (typeof name === 'object') {
        Object.keys(name).forEach(k => setProp(el, k, name[k]))
      } else {
        setProp(el, name, value)
      }
    })
  }
}

const setData = function (el, name, value) {
  if (!el.data) {
    el.data = {}
  }

  if (typeof name === 'object') {
    return Object.assign(el.data, name)
  }

  if (typeof name === 'string' && value !== undefined) {
    el.data[name] = value
  }
}

/**
 * Read the specified attribute from the equivalent HTML5 `data-*` attribute,
 * and (if present) cache the value in the node's internal data store. If no
 * attribute name is specified, read *all* HTML5 `data-*` attributes in this
 * manner.
 */
const readData = function (el, name) {
  const readAll = arguments.length === 1
  let domNames, domName, jsNames, jsName, value, idx, len

  if (readAll) {
    domNames = Object.keys(el.attribs).filter(attrName => {
      return attrName.slice(0, dataAttrPrefix.length) === dataAttrPrefix
    })
    jsNames = domNames.map(_domName => {
      return camelCase(_domName.slice(dataAttrPrefix.length))
    })
  } else {
    domNames = [dataAttrPrefix + cssCase(name)]
    jsNames = [name]
  }

  for (idx = 0, len = domNames.length; idx < len; ++idx) {
    domName = domNames[idx]
    jsName = jsNames[idx]

    if (hasOwn.call(el.attribs, domName)) {
      value = el.attribs[domName]

      if (hasOwn.call(primitives, value)) {
        value = primitives[value] // eslint-disable-line prefer-destructuring
      } else if (value === String(Number(value))) {
        value = Number(value)
      } else if (rbrace.test(value)) {
        try {
          value = JSON.parse(value)
        } catch (e) {
          // throw e
        }
      }

      el.data[jsName] = value
    }
  }

  return readAll ? el.data : value
}

exports.data = function (name, value) {
  const elem = this[0]

  if (!elem || !isTag(elem)) {
    return
  }

  if (!elem.data) {
    elem.data = {}
  }

  // Return the entire data object if no data specified
  if (!name) {
    return readData(elem)
  }

  // Set the value (with attr map support)
  if (typeof name === 'object' || value !== undefined) {
    domEach(this, (i, el) => setData(el, name, value))
    return this
  } else if (hasOwn.call(elem.data, name)) {
    return elem.data[name]
  }

  return readData(elem, name)
}

/**
 * Get the value of an element
 */
exports.val = function (value) {
  const querying = arguments.length === 0
  const element = this[0]
  const option = this.find('option:selected')
  let returnValue

  if (!element) {
    return
  }

  switch (element.name) {
    case 'textarea':
      return this.text(value)
    case 'input':
      switch (this.attr('type')) {
        case 'radio':
          if (querying) {
            return this.attr('value')
          }
          this.attr('value', value)

          return this
        default:
          return this.attr('value', value)
      }
    case 'select':
      if (option === undefined) {
        return undefined
      }

      if (!querying) {
        if (
          !this.attr().hasOwnProperty('multiple') &&
          typeof value === 'object'
        ) {
          return this
        }

        if (typeof value !== 'object') {
          value = [value]
        }
        this.find('option').removeAttr('selected')

        for (let i = 0; i < value.length; i++) {
          this.find(`option[value="${value[i]}"]`).attr('selected', '')
        }

        return this
      }

      returnValue = option.attr('value')
      if (this.attr().hasOwnProperty('multiple')) {
        returnValue = []
        domEach(option, (__, el) => returnValue.push(getAttr(el, 'value')))
      }

      return returnValue
    case 'option':
      if (!querying) {
        this.attr('value', value)
        return this
      }

      return this.attr('value')
  }
}

/**
 * Remove an attribute
 */
function removeAttribute(elem, name) {
  if (!elem.attribs || !hasOwn.call(elem.attribs, name)) {
    return
  }

  delete elem.attribs[name]
}

exports.removeAttr = function (name) {
  domEach(this, (i, elem) => removeAttribute(elem, name))
  return this
}

exports.hasClass = function (className) {
  return Object.keys(this).some(k => {
    const elem = this[k]
    const attrs = elem.attribs
    const clazz = attrs && attrs['class']
    let idx = -1

    if (clazz && className.length) {
      while ((idx = clazz.indexOf(className, idx + 1)) > -1) {
        const end = idx + className.length

        if (
          (idx === 0 || rspace.test(clazz[idx - 1])) &&
          (end === clazz.length || rspace.test(clazz[end]))
        ) {
          return true
        }
      }
    }
  })
}

exports.addClass = function (value) {
  // Support functions
  if (typeof value === 'function') {
    return domEach(this, (i, el) => {
      const className = el.attribs['class'] || ''
      exports.addClass.call([el], value.call(el, i, className))
    })
  }

  // Return if no value or not a string or function
  if (!value || typeof value !== 'string') {
    return this
  }

  const classNames = value.split(rspace)
  const numElements = this.length

  for (let i = 0; i < numElements; i++) {
    // If selected element isn't a tag, move on
    if (!isTag(this[i])) {
      continue
    }

    // If we don't already have classes
    const className = getAttr(this[i], 'class')
    if (!className) {
      setAttr(this[i], 'class', classNames.join(' ').trim())
    } else {
      let setClass = ` ${className} `
      const numClasses = classNames.length

      // Check if class already exists
      for (let j = 0; j < numClasses; j++) {
        const appendClass = `${classNames[j]} `
        if (setClass.indexOf(` ${appendClass}`) < 0) {
          setClass += appendClass
        }
      }

      setAttr(this[i], 'class', setClass.trim())
    }
  }

  return this
}

const splitClass = function (className) {
  return className ? className.trim().split(rspace) : []
}

exports.removeClass = function (value) {
  // Handle if value is a function
  if (typeof value === 'function') {
    return domEach(this, (i, el) => {
      exports.removeClass.call(
        [el], value.call(el, i, el.attribs['class'] || '')
      )
    })
  }

  const classes = splitClass(value)
  const numClasses = classes.length
  const removeAll = arguments.length === 0

  return domEach(this, (i, el) => {
    if (!isTag(el)) {
      return
    }

    if (removeAll) {
      // Short circuit the remove all case as this is the nice one
      el.attribs.class = ''
    } else {
      const elClasses = splitClass(el.attribs.class)
      let changed = false

      for (let j = 0; j < numClasses; j++) {
        const index = elClasses.indexOf(classes[j])

        if (index >= 0) {
          elClasses.splice(index, 1)
          changed = true

          // We have to do another pass to ensure that there are not duplicate
          // classes listed
          j--
        }
      }

      if (changed) {
        el.attribs.class = elClasses.join(' ')
      }
    }
  })
}

exports.toggleClass = function (value, stateVal) {
  // Support functions
  if (typeof value === 'function') {
    return domEach(this, (i, el) => {
      exports.toggleClass.call(
        [el],
        value.call(el, i, el.attribs['class'] || '', stateVal),
        stateVal
      )
    })
  }

  // Return if no value or not a string or function
  if (!value || typeof value !== 'string') {
    return this
  }

  const classNames = value.split(rspace)
  const numClasses = classNames.length
  const state = typeof stateVal === 'boolean' ? stateVal ? 1 : -1 : 0
  const numElements = this.length

  for (let i = 0; i < numElements; i++) {
    // If selected element isn't a tag, move on
    if (!isTag(this[i])) {
      continue
    }

    const elementClasses = splitClass(this[i].attribs.class)
    // Check if class already exists
    for (let j = 0; j < numClasses; j++) {
      // Check if the class name is currently defined
      const index = elementClasses.indexOf(classNames[j])

      // Add if stateValue === true or we are toggling and there is no value
      if (state >= 0 && index < 0) {
        elementClasses.push(classNames[j])
      } else if (state <= 0 && index >= 0) {
        // Otherwise remove but only if the item exists
        elementClasses.splice(index, 1)
      }
    }

    this[i].attribs.class = elementClasses.join(' ')
  }

  return this
}

exports.is = function (selector) {
  if (selector) {
    return this.filter(selector).length > 0
  }

  return false
}
