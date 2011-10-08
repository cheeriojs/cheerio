htmlparser = require "htmlparser"
fs = require "fs"

parse = exports.parse = (file, callback) ->
  
  handler = new htmlparser.DefaultHandler (err, dom) ->
    throw err if err
    callback null, dom
    
  fs.readFile file, "utf8", (err, html) ->
    parser = new htmlparser.Parser handler
    parser.parseComplete html
  
module.exports = exports