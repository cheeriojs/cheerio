fs = require 'fs'
assert = require 'assert'

initial = __dirname + "/initial"

cheerio = require "../src/cheerio"
vows = require "vows"

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
  
  'When parsing a basic file' : 
    
    topic : () ->
      cheerio "#{initial}/basic.html", this.callback
      
    'there is no error' : (err, $) ->
      assert.isNull err
      
    'a function is created' : ($) ->
      assert.isFunction $
      
    'first element is doctype' : ($) ->
      # assert.equal dom[0].raw, "!DOCTYPE html"
      
    'title says "Basic"' : ($) ->
      title = $('title').text()
      assert.equal title, 'Basic'
    
    'test remove' : ($) ->
      header = $('.header')
      console.log $('body').html()
      header.remove()
      console.log '------'
      console.log $('body').html()
    # 'can change an attribute' : ($) ->
    #   $('.header').attr('id', 'header1')
    #   headerHTML = $('.header').html()
      
      
    'When rendering a basic file' : 

      topic : ($) ->
        return $.html()
  
      'something is output' : (html) ->
        assert.isString html
        
    


# Export it.
testSuite.export module