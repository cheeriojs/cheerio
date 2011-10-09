htmlparser = require "htmlparser"
fs = require "fs"
  
parse = exports.parse = (content, callback) ->
  handler = new htmlparser.DefaultHandler (err, dom) ->
    throw err if err
    callback null, dom
    
  parser = new htmlparser.Parser handler
  parser.parseComplete content

parseFile = exports.parseFile = (file, callback) ->
  fs.readFile file, "utf8", (err, content) ->
    parse content, callback
  
module.exports = exports