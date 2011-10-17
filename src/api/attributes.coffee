_ = require "underscore"
$ = require "../cheerio"

attr = exports.attr = (name, value) ->
  $.access this, name, value, true, $.attr

removeAttr = exports.removeAttr = (name) ->
  return this.each ->
    $.removeAttr this, name

# addClass = exports.addClass = (value) ->
#   
#   if value and _.isString value
#     classNames = value.split " "
#     
#     for elem in this
#       if elem.type is "tag"
#         console.log 'hi'


module.exports = $.fn.extend exports
