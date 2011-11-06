should = require 'should'
cheerio = require "../../../lib/cheerio"

loadCheerio = (html) ->
  return cheerio.load html

exports = 
  
  'find' :
    topic : loadCheerio
    
    'single' : ($) ->
      $('body').find('#modal').hasClass('blue').should.be.ok
      
    'many' : ($) ->
      $('body').find('h2').text().should.equal "Hi there!Feet!"
      
    'many finds many (merged)' : ($) ->
      $('p').find('strong').text().should.equal "consecteturjust"
  
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
    
    'with index' : ($) ->
      child = $('#lorem').children(0)
      child.should.have.length 1
      child[0].name.should.equal "strong"

    'with selector' : ($) ->
      child = $('#lorem').children('span')
      child.should.have.length 1
      child[0].name.should.equal "span"
      
    'with selector (no results)' : ($) ->
      child = $('#lorem').children('em')
      child.should.have.length 0
      should.not.exist child[0]
      
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
  
    'get (top-level)' : ($) ->
      should.not.exist $('html').prev()
  
  'siblings' : 
    topic : loadCheerio
    
    'get' : ($) ->
      $('#lorem').siblings().should.have.length 4
      $('#lorem strong').siblings().should.have.length 1
      $('head meta').siblings().should.have.length 1
  
  # 'add' : 
  #   topic : loadCheerio
  #   
  #   'string' : ($) ->
  #     group = $('#lorem').add('.header')
  #     console.log group

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
  
