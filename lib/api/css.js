'use strict'

const { domEach } = require('../utils')
const { toString } = Object.prototype

/**
 * Set / Get css.
 * @param {String|Object} prop
 * @param {String} val
 * @return {self}
 * @api public
 */
exports.css = function (prop, val) {
  if (
    arguments.length === 2 ||
    // When `prop` is a "plain" object
    (toString.call(prop) === '[object Object]')
  ) {
    return domEach(this, (idx, el) => setCss(el, prop, val, idx))
  }

  return getCss(this[0], prop)
}

/**
 * Set styles of all elements.
 * @param {String|Object} prop
 * @param {String} val
 * @param {Number} idx - optional index within the selection
 * @return {self}
 * @api private
 */
function setCss(el, prop, val, idx) {
  if (typeof prop === 'string') {
    const styles = getCss(el)
    if (typeof val === 'function') {
      val = val.call(el, idx, styles[prop])
    }

    if (val === '') {
      delete styles[prop]
    } else if (val != null) {
      styles[prop] = val
    }

    el.attribs.style = stringify(styles)
  } else if (typeof prop === 'object') {
    Object.keys(prop).forEach(k => setCss(el, k, prop[k]))
  }
}

/**
 * Get parsed styles of the first element.
 * @param {String} prop
 * @return {Object}
 * @api private
 */
function getCss(el, prop) {
  const styles = parse(el.attribs.style)

  if (typeof prop === 'string') {
    return styles[prop]
  } else if (Array.isArray(prop)) {
    return prop.reduce((a, b) => {
      a[b] = styles[b]
      return a
    }, {})
  }

  return styles
}

/**
 * Stringify `obj` to styles.
 * @param {Object} obj
 * @return {Object}
 * @api private
 */
function stringify(obj) {
  return Object.keys(obj || {}).reduce((str, prop) => {
    str += `${String(str ? ' ' : '') + prop}: ${obj[prop]};`
    return str
  }, '')
}

/**
 * Parse `styles`.
 * @param {String} styles
 * @return {Object}
 * @api private
 */
function parse(styles) {
  const s = (styles || '').trim()

  if (!s) {
    return {}
  }

  return s.split(';').reduce((obj, str) => {
    const n = str.indexOf(':')
    // skip if there is no :, or if it is the first/last character
    if (n < 1 || n === str.length - 1) return obj
    obj[str.slice(0, n).trim()] = str.slice(n + 1).trim()
    return obj
  }, {})
}
