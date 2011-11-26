path = require "path"

soupselect = require "cheerio-soupselect"
_ = require "underscore"

parser = require "./parser"

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
    cheerio : "0.3.1"
    constructor: cheerio
    init: (selector, context, root) ->
      # Handle $(""), $(null), or $(undefined)
      if not selector
        return this

      if root
        cheerio.extend
          'root' : root
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
            root = parser.parse selector
            return cheerio.merge this, root.children
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
    
    selector : ""
    sort : [].sort
    splice : [].splice
    length : 0
    
  # Give the init function the jQuery prototype for later instantiation
  cheerio.fn.init.prototype = cheerio.fn
  
  # Use underscores extend
  cheerio.extend = cheerio.fn.extend = (obj) ->
    return _.extend this, obj
  
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

