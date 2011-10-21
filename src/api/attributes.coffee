_ = require "underscore"
$ = require "../cheerio"

rclass = /[\n\t\r]/g
rspace = /\s+/

attr = exports.attr = (name, value) ->
  $.access this, name, value, true, $.attr

removeAttr = exports.removeAttr = (name) ->
  return this.each ->
    $.removeAttr this, name

hasClass = exports.hasClass = (selector) ->
  className = " " + selector + " "
  for elem in this
    if elem.type is "tag" and elem.attribs and (" " + elem.attribs["class"] + " ").replace(rclass, " ").indexOf(className) > -1
      return true
  
  return false

addClass = exports.addClass = (value) ->
  if _.isFunction value
    return this.each (i) ->
      $this = $(this)
      className = $this.attr('class') or ""
      $this.addClass value.call(this, i, className)
  
  if value and _.isString value
    classNames = value.split rspace
    
    for elem in this
      $elem = $(elem)
      if elem.type is "tag"
        
        if !$elem.attr("class")
          $elem.attr('class', classNames.join(' ').trim())
        
        else
          setClass = " " + $elem.attr("class") + " "
          
          for className in classNames
            
            if !~setClass.indexOf(" " + className + " ")
              setClass += className + " "
    
          $elem.attr('class', setClass.trim())
    
    
  return this

removeClass = exports.removeClass = (value) ->
  
  if _.isFunction value
    return this.each (j) ->
      $this = $(this)
      className = $this.attr('class') or ""
      $this.removeClass value.call(this, j, className)
        
  if (value and _.isString value) or value is undefined
    classNames = (value || "").split rspace
    
    for elem in this
      $elem = $(elem)
      if elem.type is 'tag' and $elem.attr('class')
        if value
          ret = (" " + $elem.attr('class') + " ").replace( rclass, " " )
          for className in classNames
            ret = ret.replace( " " + className + " ", " ")
    
          $elem.attr('class', ret.trim())
        else 
          $elem.attr('class', '');
            
  return this

module.exports = $.fn.extend exports
