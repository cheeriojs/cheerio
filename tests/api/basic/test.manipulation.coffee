should = require 'should'
cheerio = require "../../../src/cheerio"
utils = require "../../../src/utils"

exports =
  
  'append' : 
    topic : (html) ->
      return cheerio.load html
    
    'single element' : ($) ->
      $header = $('.header')
      _$ = $header.append('<strong>...one more time</strong>')
      $header.children().should.have.length 1
      $header.find('strong').parent().hasClass('header').should.be.ok
      should.exist _$.cheerio
    
    'multiple elements' : ($) ->
      # Works but not tested
      
    'function' : ($) ->
      # Not implemented
    
  'prepend' :
    topic : (html) ->
      return cheerio.load html
    
    'single element' : ($) ->
      $lorem = $('#lorem')
      _$ = $lorem.prepend('<em class = "emphy">...one more time</em>')
      $lorem.children().should.have.length 3
      $lorem.children(0).parent().attr('id').should.equal "lorem"
      $lorem.children(0).hasClass('emphy').should.be.ok
      should.exist _$.cheerio

      'multiple elements' : ($) ->
        # Works but not tested
      'function' : ($) ->
        # Not implemented
        
  'after' : 
    topic : (html) ->
      return cheerio.load html
    
    'single element' : ($) ->
      $lorem = $('#lorem')
      $parent = $lorem.parent()
      $next = $lorem.next()
      _$ = $lorem.after('<em class = "emphy">...one more time</em>')
      $lorem.next().hasClass('emphy').should.be.ok
      
      # DOM was updated
      $emphy = $lorem.parent().find('.emphy')
      $emphy.parent().should.eql $parent
      $emphy.prev().should.eql $lorem
      $emphy.next().should.eql $next
      
      should.exist _$.cheerio
      
    'multiple elements' : ($) ->
      # Works but not tested
      
    'function' : ($) ->
      # Not implemented
  
  'before' : 
    topic : (html) ->
      return cheerio.load html

    'single element' : ($) ->
      $lorem = $('#lorem')
      $parent = $lorem.parent()
      $before = $lorem.prev()
      _$ = $lorem.before('<em class = "emphy">...one more time</em>')
      $lorem.prev().hasClass('emphy').should.be.ok

      # DOM was updated
      $emphy = $lorem.parent().find('.emphy')
      $emphy.parent().should.eql $parent
      $emphy.next().should.eql $lorem
      $emphy.prev().should.eql $before

      should.exist _$.cheerio

    'multiple elements' : ($) ->
      # Works but not tested

    'function' : ($) ->
      # Not implemented
      
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
