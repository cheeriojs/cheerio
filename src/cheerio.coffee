soupselect = require "soupselect"
_ = require "underscore"

parser = require "./parser"
renderer = require "./renderer"

cheerio = (dom) ->
  
  selector = (select) ->
    # Create new instance
    if !(this instanceof arguments.callee)
      return new selector select
        
    @context =  soupselect.select dom, select

    if @context.length is 1
      @context = @context[0]
      
    return this
  
  ###
    PUBLIC METHODS
  ###  
  
  selector::html = () ->
    return renderer.render @context
    
  
  selector::text = (text, value) ->
    exists = (@context.children.length is 1 and @context.children[0].type is "text")
    if not value
      if exists
        return @context.children[0].data
      else
        return ""
    else
      if exists
        @context.children[0].data = value
      else
        return this
      
  
  selector::attr = (attribute, value) ->
    if not value
      if @context.attribs and @context.attribs[attribute]
        return @context.attribs[attribute]
      else
        return ""
    
    else
      if @context.attribs
        @context.attribs[attribute] = value
        
      return this
        
  selector::each = (fn) ->
    context = [@context] if !_.isArray context
    for elem, i in context
      fn.call this, elem, i
    
    return this

  ###
    STATIC METHODS
  ###
  
  selector.html = () ->
    return renderer.render dom

  selector.dom = () ->
    return dom

  return selector

module.exports = (file, callback) ->
  parser.parse file, (err, dom) ->
    throw err if err
    selector = cheerio dom
    callback.call null, err, selector
