should = require 'should'
cheerio = require "../../src/cheerio"

exports = 
  
  'each' : 
    topic : (html) ->
      return cheerio.load html
    
    'correct args' : ($) ->
      $('h2').each (i, elem) ->
        this.should.include.object 
          type : 'tag'
          name : 'h2'

        elem.should.include.object 
          type : 'tag'
          name : 'h2'      
      
        i.should.be.a "number"
    
    'wrap this' : ($) ->
      $('h2.header').each ->
        cls = $(this).attr('class')
        cls.should.equal 'header'
        
    
module.exports = exports
  
