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
    
    if _.isString select    
      @context =  soupselect.select dom, select
      
    
    else if select.context
      @context = select.context
    # May do more ifs but for now assume it's an object otherwise and
    # we want to wrap it.
    else
      @context = select

    if @context.length is 1
      @context = @context[0]
      
    return this
  
  ###
    PUBLIC METHODS
  ###  
  
  selector::dom = () ->
    return @context
  
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
  
  selector::remove = () ->
    # Kind of a hacky way to remove an element
    @context.raw = null
    return this
        
  selector::each = (fn) ->
    context = if !_.isArray @context then [@context] else @context
    for elem, i in context
      selected = selector elem
      fn.call selected, selected, i
    
    return this

  ###
    STATIC METHODS
  ###
  
  selector.html = () ->
    return renderer.render dom

  selector.dom = () ->
    return dom

  return selector



module.exports = (file, options, callback) ->
  # Allow for two args
  if not callback and _.isFunction options
    callback = options
  
  
  
  done = (err, dom) ->
    throw err if err
    selector = cheerio dom
    callback.call null, err, selector
  
  path.exists file, (exists) ->
    # It's a file
    if exists
      parser.parseFile file, done
    # It's probably content
    else
      parser.parse file, done
      
