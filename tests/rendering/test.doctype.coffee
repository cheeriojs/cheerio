should = require "should"

exports = 
  '1 doctype' : (err, html, $html, diff) ->
    $html.should.not.include.string "</!DOCTYPE>"
    
module.exports = exports