should = require 'should'
cheerio = require "../../../src/cheerio"

loadCheerio = (html) ->
  return cheerio.load html

exports = 
  
  'parent' : 
    topic : loadCheerio
  
    'get' : ($) ->
      $('#lorem').parent()[0].name.should.equal "body"
      $('title').parent()[0].name.should.equal "head"
      $('.header').parent().parent()[0].name.should.equal "html"
  
  'children' :
    topic : loadCheerio
    
    'get' : ($) ->
      children = $('#lorem').children()
      
      children.should.be.length 2
      children[0].name.should.equal "strong"
      children[1].name.should.equal "span"
  
  'next' :
    topic : loadCheerio
    
    'get' : ($) ->
      $('.header').next().attr('id').should.equal "lorem"
      $('.header').next().next().attr('id').should.equal "footer"
      
    'get (no next)' : ($) ->
      should.not.exist $('#modal').next()

  'prev' : loadCheerio
    
    'get' : ($) ->
      $("#lorem").prev().attr('class').should.equal "header"
      $('#modal')
        .prev().prev().prev()
        .attr('class')
        .should.equal "header"
        
      $('#lorem span').prev().get(0).name.should.equal "strong"
  
  'siblings' : 
    topic : loadCheerio
    
    'get' : ($) ->
      $('#lorem').siblings().should.have.length 3
      $('#lorem strong').siblings().should.have.length 1
      $('head meta').siblings().should.have.length 1
  
  'each' : 
    topic : loadCheerio
    
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
  
