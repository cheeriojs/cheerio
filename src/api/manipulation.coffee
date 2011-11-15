_ = require 'underscore'
$ = require '../cheerio'
parser = require '../parser'

removeChild = (parent, elem) ->
 $.each parent.children, (i, child) ->
   if elem is child
     parent.children.splice i, 1

append = exports.append = (elems...) ->
  dom = []
  for elem in elems
    dom.push $(elem).dom()
  
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
    dom.push $(elem).dom()
  
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
  doms = []
  for elem in elems
    doms = doms.concat $(elem).dom()
    
  this.each ->
    siblings = $(this).siblingsAndMe()
    pos = $.inArray(this, siblings)

    if pos >= 0
      siblings.splice.apply(siblings, [pos + 1, 0].concat(doms))
      
    # Update siblings
    $.updateDOM siblings, this.parent

  return this

before = exports.before = (elems...) ->
  doms = []
  for elem in elems
    doms = doms.concat $(elem).dom()

  this.each ->
    siblings = $(this).siblingsAndMe()
    pos = $.inArray(this, siblings)

    if pos >= 0
      siblings.splice.apply(siblings, [pos, 0].concat(doms))

    # Update siblings
    this.parent = $.updateDOM siblings, this.parent

  return this    

remove = exports.remove = (selector) ->
  elems = this
  if selector
    elems = this.find(selector)
    
  elems.each ->
    if this.parent
      removeChild this.parent, this
      delete this['parent']
      
  return this

empty = exports.empty = () ->
  this.each ->
    this.children = []

dom = exports.dom = (domObject) ->
  if domObject is undefined
    if this[0] and $.isTag(this[0])
      return $.dom this[0]

html = exports.html = (htmlString) ->
  if typeof htmlString isnt "object" and htmlString isnt undefined
    htmlElement = parser.parse htmlString
    this.each (i) ->
      if this.children
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
    textElement = parser.parse textString
    this.each (i) ->
      this.children = textElement
    return this
  else  
    return $.text this
  
module.exports = $.fn.extend exports