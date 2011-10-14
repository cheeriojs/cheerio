fs = require 'fs'

should = require 'should'
vows = require "vows"

cheerio = require "../src/cheerio"
initial = __dirname + "/initial"

assert = require "assert"
# topicFunction = (file, action) ->
#   self = this
#   fs.readFile initial + "/#{file}.html", "utf8", (err, file) ->
#     assert.isNull err
#     htmlparser[action] file, self.callback

###
  Tests
###
suite = vows.describe "HTML parsing and rendering"
testSuite = suite.addBatch
  
  'When manipulating a basic file' : 
    
    topic : () ->
      self = this
      fs.readFile "#{initial}/basic.html", "utf8", (err, html) ->
        should.not.exist err
        self.callback(null, cheerio(html))
        
      
    'there is no error' : (err, $) ->
      should.not.exist err
      
    'a selector function is created' : ($) ->
      $.should.be.a 'function'
            
    'title says "Basic"' : ($) ->
      title = $('title').text()
      title.should.eql 'Basic'
    
    'test remove' : ($) ->
      html = $('body').html()
      html.should.include.string '<h2 class = "header">Hi there!</h2>'
      
      # Remove that header
      $('body .header').remove()
      
      html = $('body').html()
      html.should.not.include.string '<h2 class = "header">Hi there!</h2>'
      
    'has a parent' : ($) ->
      console.log $('body .header').parent().attr('class')

      topic : ($) ->
        return $.html()
  
      'something is output' : (html) ->
        assert.isString html
        
    


# Export it.
testSuite.export module