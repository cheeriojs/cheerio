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
  
  # Save a reference to some core methods
  toString = Object.prototype.toString
  hasOwn = Object.prototype.hasOwnProperty
  push = Array.prototype.push
  slice = Array.prototype.slice
  trim = String.prototype.trim
  indexOf = Array.prototype.indexOf
  
  # [[Class]] -> type pairs
  class2type = {}
  
  cheerio.fn = cheerio.prototype =
    constructor: cheerio
    init: (selector, context, root) ->
      # Handle $(""), $(null), or $(undefined)
      if not selector
        return this

      if root
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
            console.log 'selector', selector
            console.log 'root', root
            # Classes, IDs just defer to soupselect
            elems = soupselect.select context, selector
            this.selector = selector
            return cheerio.merge this, elems
        

        # console.log 'selector', selector
        # console.log 'context', context
        # console.log 'root', root
        
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
    length : 0
    selector : ""
    root : null
    size : () ->
      this.length
      
    toArray : () ->
      return slice.call this, 0
    
    # Get the Nth element in the matched element set OR
    # Get the whole matched element set as a clean array
    get : (num) ->
      (if num == null then this.toArray() else (if num < 0 then this[this.length + num] else this[num]))
    
    pushStack : (elems, name, selector) ->
      ret = this.constructor()
      if cheerio.isArray(elems)
        push.apply ret, elems
      else
        cheerio.merge ret, elems
        
      ret.prevObject = this
      ret.context = this.context
      
      if name == "find"
        ret.selector = this.selector + (if this.selector then " " else "") + selector
      else 
        ret.selector = this.selector + "." + name + "(" + selector + ")"  if name
      
      return ret
      
    sort : [].sort
    splice : [].splice
    
  # Give the init function the jQuery prototype for later instantiation
  cheerio.fn.init.prototype = cheerio.fn
  
  # Use underscores extend
  cheerio.extend = cheerio.fn.extend = (obj) ->
    return _.extend this, obj
  
  cheerio.extend
    
    type : ( obj ) ->
    		if obj == null then String obj else class2type[ toString.call(obj) ] or "object"

    isArray : (array) ->
      return _(this).isArray()
      
    merge : (first, second) ->
      i = first.length
      j = 0
      
      if typeof second.length == "number"
        l = second.length

        while j < l
          first[i++] = second[j]
          j++
          
      else
        while second[j] != undefined
          first[i++] = second[j++]
      
      first.length = i
      
      return first
  
    makeArray : (array, results) ->
      ret = results or []
      if array?
        type = cheerio.type(array)
        if not array.length? or type == "string" or type == "function" or type == "regexp"
          push.call ret, array
        else
          cheerio.merge ret, array
          
      return ret

    load : (html) ->
      root = parser.parse html
      
      return (selector, context) ->
        cheerio selector, context, root
      

  # Populate class2type map
  _.each "Boolean Number String Function Array Date Regex Object".split(" "), (name, i) ->
    class2type[ "[object #{name}]" ] = name.toLowerCase()
  
  # Actual API
  cheerio.fn.extend

    find : (selector) ->
      elem = soupselect.select this.toArray(), selector
      return cheerio elem

  return cheerio


fs = require "fs"
basic = fs.readFileSync '../tests/initial/basic.html', 'utf8'
$ = cheerio.load basic
dom = parser.parse basic
# console.log $('#footer', 'body') # works

# console.log $('#footer', dom)

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


module.exports = cheerio
  
