_ = require "underscore"
$ = require "../cheerio"

  
# [[Class]] -> type pairs
class2type = {}
  
# Populate class2type map
_.each "Boolean Number String Function Array Date Regex Object".split(" "), (name, i) ->
  class2type[ "[object #{name}]" ] = name.toLowerCase()
    
###
Node Types
  directive : 10
  comment : 8
  script : 1
  style : 1
  text : 3
  tag : 1
###
  

# Some regexs
rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i
  
  
  
# Save a reference to some core methods
toString = Object.prototype.toString
hasOwn = Object.prototype.hasOwnProperty
push = Array.prototype.push
slice = Array.prototype.slice
trim = String.prototype.trim
indexOf = Array.prototype.indexOf

updateDOM = exports.updateDOM = (arr, parent) ->
  for elem, i in arr
    arr[i].prev = arr[i-1] or null
    arr[i].next = arr[i+1] or null
    arr[i].parent = parent or null

  return arr

type = exports.type = ( obj ) ->
		if obj == null then String obj else class2type[ toString.call(obj) ] or "object"

isArray = exports.isArray = (array) ->
  return _(this).isArray()
  
merge = exports.merge = (first, second) ->
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

makeArray = exports.makeArray = (array, results) ->
  ret = results or []
  if array?
    type = $.type(array)
    if not array.length? or type == "string" or type == "function" or type == "regexp"
      push.call ret, array
    else
      $.merge ret, array
      
  return ret
	
inArray = exports.inArray = (elem, array) ->
  if !array
    return -1
  
  return indexOf.call(array, elem)

# Args is for internal usage only
each = exports.each = (object, callback, args) ->
  length = object.length
  i = 0
  isObj = length is undefined or _.isFunction object
  
  if args
    if isObj
      for name of object
        break  if callback.apply(object[name], args) is false
    else
      while i < length
        break  if callback.apply(object[i++], args) is false
  
  # A special fast, case for the most common use of each
  else
    if isObj
      for name of object
        break  if callback.call(object[name], name, object[name]) is false
    else
      while i < length
        break  if callback.call(object[i], i, object[i++]) is false
        
  return object

# Multifunctional method to get and set values to a collection
# The value's can optionally be executed if it's a function
access = exports.access = (elems, key, value, exec, fn, pass) ->
  length = elems.length

  # Setting many attributes
  if typeof key is "object"
    for k of key
      access elems, k, key[k], exec, fn, value
    return elems
  
  # Setting one attribute
  if value isnt undefined
    exec = not pass and exec and _.isFunction(value)
    i = 0

    while i < length
      fn elems[i], key, (if exec then value.call(elems[i], i, fn(elems[i], key)) else value), pass
      i++
    return elems
  
  # Getting an attribute
  return (if length then fn(elems[0], key) else undefined)


attr = exports.attr = (elem, name, value, pass) ->
  type = elem.type
  
  if (!elem or elem.type isnt "tag")
    return undefined 
  
  if !elem.attribs
    elem.attribs = {}
  
  # Return the entire attribs object if no attribute specified
  if !name
    return elem.attribs
  
  if value isnt undefined
    
    if value is null
      $.removeAttr elem, name
    
    # Set the attribute
    else
      elem.attribs[name] = "" + value
  
  else
    # Get the attribute
    return elem.attribs[name]
      
removeAttr = exports.removeAttr = (elem, name) ->
  if elem.type is 'tag' and elem.attribs
    
    if elem.attribs[name]
      if rboolean.test elem.attribs[name]
        elem.attribs[name] = false
      else
        delete elem.attribs[name]
    
text = exports.text = (elems) ->
  ret = ""
  
  for elem in elems
    if elem.type is "text"
      ret += elem.data
    else if elem.children && elem.type isnt "comment"
      ret += text elem.children
  
  return ret

module.exports = $.extend exports