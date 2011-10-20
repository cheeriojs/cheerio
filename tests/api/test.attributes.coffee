should = require 'should'
cheerio = require "../../src/cheerio"

loadCheerio = (html) ->
  return cheerio.load html

exports = 
  
  'attr' : 
    topic : loadCheerio
    
    'get single' : ($) ->
      
      header = $('h2.header')
      footer = $('h2#footer')
    
      # Test getting attributes
      id = footer.attr 'id'
      id.should.equal 'footer'
    
      required = footer.attr 'required'
      required.should.equal 'required'
    
      cls = header.attr('class')
      cls.should.equal 'header'
    
    'set single' : ($) ->
      lorem = $('#lorem')
      
      # Test setting an attribute
      lorem.attr 'class', 'paragraph'
      lorem[0].attribs['class'].should.equal 'paragraph'
    
    'set map' : ($) ->
      modal = $('div#modal')
      
      # Test setting a map of attributes
      modal.attr 
        height : '100px'
        width : '200px'
        class : 'blue'
    
      modal[0].attribs.should.have.keys 'height', 'width', 'class', 'id'
    
    'get map' : ($) ->
      modal = $('div#modal')
      
      # Test getting the attribute object
      attributes = modal.attr()  

      attributes.should.include.object
        height : '100px'
        width : '200px'
        class : 'blue'
        id : 'modal'
    
  'removeAttr' : 
    topic : (html) ->
      return cheerio.load html
    
    'remove single' : ($) ->
      header = $('h2.header')
      footer = $('h2#footer')
    
      # Remove single attributes
      header.removeAttr 'class'
      should.not.exist header[0].attribs['class']
    
      footer.removeAttr 'id'
      should.not.exist footer[0].attribs['id']

  'hasClass' :
    topic : loadCheerio

    'single' : ($) ->
      header = $('h2.header')
      modal = $('#modal')

      header.hasClass('header').should.be.ok
      header.hasClass('headerz').should.not.be.ok

      modal.hasClass('show').should.be.ok
      modal.hasClass('blue').should.be.ok
      modal.hasClass('green').should.not.be.ok

    'no classes' : ($) ->
      $('#lorem').find('strong').hasClass('whatever').should.not.be.ok
module.exports = exports
  
  