path = require "path"

soupselect = require "soupselect"
_ = require "underscore"

parser = require "./parser"
renderer = require "./renderer"

cheerio = (dom) ->
  
  selector = (select) ->
    # Create new instance
    if !(this instanceof arguments.callee)
      return new selector select
    
    if select is null
      @context = []
      
    else if _.isString select    
      @context =  soupselect.select dom, select
          
    else if select.context
      @context = select.context

    # May do more ifs but for now assume it's an object otherwise and
    # we want to wrap it.
    else
      @context = select
      
    return this
  
  ###
    PUBLIC METHODS
  ###  
  
  selector::dom = () ->
    return @context
  
  selector::html = () ->
    return renderer.render @context
  
  selector::text = (text, value) ->
    if @context.length is 1
      elem = @context[0]
    else
      return ""

    exists = (elem.children.length is 1 and elem.children[0].type is "text")
    if not value
      if exists
        return elem.children[0].data
      else
        return ""
    else
      if exists
        elem.children[0].data = value
      else
        return this
      
  
  selector::attr = (attribute, value) ->
    this.each (elem) ->
      if not value
        if elem.attribs and elem.attribs[attribute]
          return elem.attribs[attribute]
        else
          return ""
    
      else
        if elem.attribs
          elem.attribs[attribute] = value
        
      return this
  
  selector::remove = () ->
    this.each (elem) ->
      elem.raw = null

    return this
        
  selector::each = (fn) ->
    for elem, i in @context
      selected = selector elem
      fn.call selected, elem, i
    
    return this

  selector::parent = () ->
    
    if @context[0].parent
      return selector @context[0].parent
    else
      return selector null

  selector::prev = () ->
    
    if @context[0].prev
      return selector @context[0].parent
    else
      return selector null
  
  selector::next = () ->
    if @context[0].next
      return selector @context[0].next
    else
      return selector null
  
  selector::size = () ->
    return @context.length
    
  selector::singular = () ->
    if @.size() is 1
      return true
    else return false
  ###
    STATIC METHODS
  ###
  
  selector.html = () ->
    return renderer.render dom

  selector.dom = () ->
    return dom

  return selector



module.exports = (content) ->
  return cheerio parser.parse content
  
