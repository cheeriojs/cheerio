_ = require "underscore"
$ = require "../cheerio"

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
# addClass = exports.addClass = (value) ->
#   
#   if value and _.isString value
#     classNames = value.split " "
#     
#     for elem in this
#       if elem.type is "tag"
#         console.log 'hi'


module.exports = $.fn.extend exports
