path = require "path"

soupselect = require "soupselect"
_ = require "underscore"

parser = require "./parser"
renderer = require "./renderer"

cheerio = do ->
  cheerio = (selector, context, root) ->
    return new cheerio.fn.init selector, context, root
    
  # A simple way to check for HTML strings or ID strings
  # Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
  quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/
  
  # Used for trimming whitespace
  trimLeft = /^\s+/ 
  trimRight = /\s+$/

  cheerio.fn = cheerio.prototype =
    constructor: cheerio
    init: (selector, context, root) ->
      # Handle $(""), $(null), or $(undefined)
      if not selector
        return this

      if root
        this.root = root
        if _.isString context
          selector = "#{context} #{selector}"
        context = root

      # Handle strings
      if typeof selector == "string"
        # Handle HTML strings
        if selector.charAt(0) == "<" && selector.charAt( selector.length - 1 ) == ">" && selector.length >= 3
          match = [ null, selector, null ]
        else
          match = quickExpr.exec selector
        
        if match && (match[1] || !context)
          if match[1]
            # It's an HTML string
            return cheerio.merge this, parser.parse selector
          else 
            # Classes, IDs just defer to soupselect
            elems = soupselect.select context, selector
            this.selector = selector
            return cheerio.merge this, elems
        
        # HANDLE: $(expr, $(...))
        if !context or context.cheerio
          return (context or root).find selector
          
        # HANDLE: $(expr, context)
        else
          if _.isString context
            context = parser.parse context
          return this.constructor(context).find selector

      return cheerio.makeArray( selector, this );    
      # if context
        # return cheerio selector, parser.parse con
    
    cheerio : "0.0.1"     
    selector : ""
    sort : [].sort
    splice : [].splice
    length : 0
    root : undefined
    
  # Give the init function the jQuery prototype for later instantiation
  cheerio.fn.init.prototype = cheerio.fn
  
  # Use underscores extend
  cheerio.extend = cheerio.fn.extend = (obj) ->
    return _.extend this, obj
  
  # Custom API
  cheerio.extend
    
    load : (html) ->
      root = parser.parse html
      cheerio.extend 
        'root' : root
      
      fn = (selector, context) ->
        cheerio selector, context, root
        
      return _(fn).extend cheerio
  
    html : (dom) ->
      if dom isnt undefined and dom.type
        return renderer.render dom
      else if this.root
        return renderer.render this.root
      else
        return ""
    
    dom : (dom) ->
      if dom isnt undefined and dom.type
        return dom
      else if this.root
        return this.root
      else
        return ""
    
  # Actual API
  cheerio.fn.extend

    find : (selector) ->
      elem = soupselect.select this.toArray(), selector
      return cheerio elem

  return cheerio

module.exports = cheerio

###
  Plug in the API
###
api = [
  'core'
  'utils'
  'attributes'
  'traversing'
  'manipulation'
]

for plugin in api
  require "./api/#{plugin}"


# basic = require('fs').readFileSync '../tests/testdata/basic.html', 'utf8'


# $ = cheerio.load basic
# dom = parser.parse basic
# # console.log $('#footer', 'body') # works
# $('h2', dom).addClass("hi")


# console.log cheerio dom
# console.log cheerio "<h2>hihihi</h2"
# console.log cheerio('.header', 'body', basic)

# console.log cheerio("body #footer", basic).get 0

# cheerio.fn.addClass = () ->
#   console.log 'hi'
# 
# cheerio.fn.extend
#   blah : () ->
#     console.log 'balh'


  
