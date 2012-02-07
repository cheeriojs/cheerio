_ = require 'underscore'
$ = require '../cheerio'
parse = require '../parse'

removeChild = (parent, elem) ->
 $.each parent.children, (i, child) ->
   if elem is child
     parent.children.splice i, 1

append = exports.append = (elems...) ->
  dom = []
  for elem in elems
    if elem.cheerio
      dom = dom.concat elem.toArray()
    else
      dom = dom.concat parse.eval(elem)

  this.each ->
    if _.isFunction elems[0]
      # Not yet supported
    else
      if !this.children
        this.children = []
      this.children = this.children.concat dom
      $.updateDOM this.children, this

  return this

prepend = exports.prepend = (elems...) ->
  dom = []
  for elem in elems
    if elem.cheerio
      dom = dom.concat elem.toArray()
    else
      dom = dom.concat parse.eval(elem)

  this.each ->
    if _.isFunction elems[0]
      # Not yet supported
    else
      if !this.children
        this.children = []

      this.children = dom.concat this.children
      $.updateDOM this.children, this

  return this

after = exports.after = (elems...) ->
  dom = []
  for elem in elems
    if elem.cheerio
      dom = dom.concat elem.toArray()
    else
      dom = dom.concat parse.eval(elem)

  this.each ->
    siblings = this.parent.children
    index = siblings.indexOf(this)

    if index >= 0
      siblings.splice.apply(siblings, [index + 1, 0].concat(dom))

    # Update siblings
    $.updateDOM siblings, this.parent
    this.parent.children = siblings

  return this

before = exports.before = (elems...) ->
  dom = []
  for elem in elems
    if elem.cheerio
      dom = dom.concat elem.toArray()
    else
      dom = dom.concat parse.eval(elem)

  this.each ->
    siblings = this.parent.children
    index = siblings.indexOf(this)

    if index >= 0
      siblings.splice.apply(siblings, [index, 0].concat(dom))

    # Update siblings
    $.updateDOM siblings, this.parent
    this.parent.children = siblings

  return this

remove = exports.remove = (selector) ->
  elems = this
  if selector
    elems = this.find(selector)

  elems.each ->
    siblings = this.parent.children
    index = siblings.indexOf(this)
    siblings.splice index, 1

    $.updateDOM siblings, this.parent
    this.parent.children = siblings

  return this

replaceWith = exports.replaceWith = (content) ->
  elems = if typeof content isnt "object" then parse.eval(content) else content
  this.each ->
    siblings = this.parent.children
    index = siblings.indexOf(this)

    # siblings.slice(index, 1, elem1, elem2, elem3, ...)
    siblings.splice.apply(siblings, [index, 1].concat(elems.toArray()))

    $.updateDOM siblings, this.parent
    this.parent.children = siblings
  return elems

empty = exports.empty = () ->
  this.each ->
    this.children = []

html = exports.html = (htmlString) ->
  if typeof htmlString isnt "object" and htmlString isnt undefined
    htmlElement = parse.eval htmlString

    this.each (i) ->
      this.children = htmlElement

    return this
  else
    return $.html this[0]

text = exports.text = (textString) ->
  if _.isFunction textString
    this.each (i) ->
      self = $(this)
      self.text textString.call this, i, self.text()

  # Set the text
  if typeof textString isnt "object" and textString isnt undefined

    textElement =
      raw : textString
      data : textString
      type : "text"
      parent : null
      prev : null
      next : null
      children : []

    this.each (i) ->
      this.children = textElement
      $.updateDOM this.children, this
    return this
  else
    return $.text this

clone = exports.clone = () ->
  result = []
  result = result.concat(parse.eval($.html elem).toArray) for elem in this;
  return $(result)

module.exports = $.fn.extend exports
