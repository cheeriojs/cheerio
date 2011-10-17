_ = require 'underscore'
$ = require '../cheerio'

removeChild = (parent, elem) ->
 $.each parent.children, (i, child) ->
   if elem is child
     parent.children.splice i, 1

remove = exports.remove = (selector) ->
  elems = this
  if selector
    elems = this.find(selector)
    
  elems.each ->
    if this.parent
      removeChild this.parent, this
      delete this['parent']

empty = exports.empty = () ->
  this.each ->
    if this.children
      this.children = []

html = exports.html = (htmlString) ->
  if htmlString is undefined
    if this[0] and this[0].type is "tag"
      return $.html this[0]

text = exports.text = (textString) ->
  if _.isFunction textString
    this.each (i) ->
      self = $(this)
      self.text textString.call this, i, self.text()
  
  # Set the text
  if typeof textString isnt "object" and textString isnt undefined
    console.log 'set text'
  
  return $.text this
  
module.exports = $.fn.extend exports