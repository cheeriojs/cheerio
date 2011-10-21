should = require 'should'
cheerio = require "../../../src/cheerio"

loadCheerio = (html) ->
  return cheerio.load html

exports = 
  
  'attr' : 
    topic : loadCheerio
    
    'get (none)' : ($) ->
      should.not.exist $('#lorem strong').attr('class')
    
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
    topic : loadCheerio
    
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

  'addClass' :
    topic : loadCheerio
        
    'single' : ($) ->
      header = $('h2.header')
      
      header.addClass 'blah'
      header.hasClass('blah').should.be.ok
      header.hasClass('header').should.be.ok
    
    'multiple' : ($) ->
      footer = $('h2#footer')
      footer.addClass 'woohoo okokok hihihi'
      footer.hasClass('woohoo').should.be.ok
      footer.hasClass('okokok').should.be.ok
      footer.hasClass('hihihi').should.be.ok
    
    'function' : ($) ->
      modal = $('#modal')
      mood = 'happy'
      
      modal.addClass ->
        return if mood is 'happy' then 'happy' else 'sad'
            
      modal.hasClass('happy').should.be.ok
      modal.hasClass('sad').should.not.be.ok
      
    'add (when none exist)' : ($) ->
      lorem = $('#lorem')
      
      should.not.exist lorem.attr('class')
        
      lorem.addClass('paragraph wahoo')
      lorem.attr('class').split(' ').should.have.length 2

      lorem.hasClass('paragraph').should.be.ok
      lorem.hasClass('wahoo').should.be.ok
      lorem.hasClass('undefined').should.not.be.ok
          
  'removeClass' :
    topic : loadCheerio

    'single (class not there)' : ($) ->
      header = $('h2.header')
      header.removeClass('whatever')

      header.hasClass('whatever').should.not.be.ok
      header.hasClass('header').should.be.ok
    
    'single' : ($) ->
      header = $('h2.header')
      header.removeClass('header')
      header.hasClass('header').should.not.be.ok
    
    'multiple' : ($) ->
      footer = $('#footer')

      footer.addClass('woohoo okokok hihihi')
      footer.hasClass('woohoo').should.be.ok
      footer.hasClass('okokok').should.be.ok
      footer.hasClass('hihihi').should.be.ok
      
      footer.removeClass('woohoo okokok hihihi')
            
      footer.hasClass('woohoo').should.not.be.ok
      footer.hasClass('okokok').should.not.be.ok
      footer.hasClass('hihihi').should.not.be.ok

    'function' : ($) ->
      lorem = $('#lorem')
      header = $('h2.header')
      
      lorem.addClass('happy sad')

      mood = 'sad'
      lorem.removeClass () ->
        return if mood is 'happy' then 'happy' else 'sad'
      
      lorem.hasClass('happy').should.be.ok
      lorem.hasClass('sad').should.not.be.ok
      
    'all' : ($) ->
      modal = $('#modal')
      
      modal.removeClass()
            
      modal.hasClass('blue').should.not.be.ok
      modal.hasClass('show').should.not.be.ok
    
      
module.exports = exports
  
  