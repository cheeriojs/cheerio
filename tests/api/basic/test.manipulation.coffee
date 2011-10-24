should = require 'should'
cheerio = require "../../../src/cheerio"

exports =
  
  'remove' : 
    topic : (html) ->
      return cheerio.load html
    
    'single element' : ($) ->
      _$ = $('#footer').remove()
      $("#footer").should.have.length 0
      should.exist _$.cheerio
    
    'with selector' : ($) ->
      _$ = $("#lorem").remove('span')
      $("#lorem span").should.have.length 0
      should.exist _$.cheerio
  
  'empty' : 
    topic : (html) ->
      return cheerio.load html
    
    'single element' : ($) ->
      lorem = $('#lorem')
      lorem.empty()
      lorem.children().should.have.length 0
  
  'html' : 
    topic : (html) ->
      return cheerio.load html
    
    'get' : ($) ->
      expected = '<h2 id = "footer" required>Feet!</h2>'
      $('#footer').html().should.equal expected
      
    'set' : ($) ->
      ###
        TODO finish set
      ###
  
  'text' : 
    topic : (html) ->
      return cheerio.load html
    
    'get' : ($) ->
      expected = """
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, 
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
        nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
        culpa qui officia deserunt mollit anim id est laborum.
      """
      
      # Remove the new lines.
      expected = expected.split("\n").join("")
      
      text = $('#lorem').text()
      
      text.should.equal expected
      
    'set' : ($) ->
      ###
        TODO finish set
      ###
    
  

module.exports = exports
