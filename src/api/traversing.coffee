_ = require "underscore"
$ = require "../cheerio"

# parent = exports.parent = (selector) ->
  # if this.

# children = exports.children = (selector) ->
#   this.each ->
    

# Execute a callback for every element in the matched set.
# (You can seed the arguments with an array of args, but this is
# only used internally.)
each = exports.each = (callback, args) ->
  return $.each this, callback, args
  
# filter = exports.filter = (selector)
#   this.pushStack 


module.exports = $.fn.extend exports