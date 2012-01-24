$ = require('../')
should = require 'should'

###
  Examples
###

fruits = '''
<ul id = "fruits">
  <li class = "apple">Apple</li>
  <li class = "orange">Orange</li>
  <li class = "pear">Pear</li>
</ul>  
'''.replace /(\n|\s{2})/g, ''

###
  Tests
###

describe '$(...)', ->
  describe '.attr', ->
    
    it '() : should get all the attributes', ->
      attrs = $('ul', fruits).attr()
      attrs.id.should.equal 'fruits'
      
    it '(invalid key) : invalid attr should get undefined', ->
      should.strictEqual undefined, $('.apple', fruits).attr('lol')
      
    it '(valid key) : valid attr should get value', ->
      $('.apple', fruits).attr('class').should.equal 'apple'
        
    it '(key, value) : should set attr', ->
      $fruits = $(fruits)

      $pear = $('.pear', $fruits).attr('id', 'pear')
      $('#pear', $fruits).should.have.length 1
      
    it '(map) : object map should set multiple attributes', ->
      $fruits = $(fruits)
      $('.apple', $fruits).attr
        id : 'apple'
        style : 'color:red;'
        'data-url' : 'http://apple.com'
    
      attrs = $('.apple', $fruits).attr()
      attrs.id.should.equal 'apple'  
      attrs.style.should.equal 'color:red;'
      attrs['data-url'].should.equal 'http://apple.com'
    
  describe '.removeAttr', ->
    
    it '(key) : should remove a single attr', ->
      $fruits = $(fruits)

      should.exist $('ul', $fruits).attr('id')
      $('ul', $fruits).removeAttr('id')
      should.not.exist $('ul', $fruits).attr('id')
      
      
  describe '.hasClass', ->
    
    it '(valid class) : should return true', ->
      $fruits = $(fruits)
      $('.apple', $fruits).hasClass('apple').should.be.ok
      
    it '(invalid class) : should return false', ->
      $('#fruits', fruits).hasClass('fruits').should.not.be.ok
  
  describe '.addClass', ->
    
    it '(first class) : should add the class to the element', ->
      $fruits = $(fruits)
      $('#fruits', $fruits).addClass('fruits')
      $('#fruits', $fruits).hasClass('fruits').should.be.ok
      
    it '(single class) : should add the class to the element', ->
      $fruits = $(fruits)
      $('.apple', $fruits).addClass('fruit')
      $('.apple', $fruits).hasClass('fruit').should.be.ok
    
    it '(class): adds classes to many selected items', ->
      $fruits= $(fruits)
      $('li', $fruits).addClass('fruit')
      
      $('.apple', $fruits).hasClass('fruit').should.be.ok
      $('.orange', $fruits).hasClass('fruit').should.be.ok
      $('.pear', $fruits).hasClass('fruit').should.be.ok
    
    it '(class class class) : should add multiple classes to the element', ->
      $fruits = $(fruits)
      $('.apple', $fruits).addClass('fruit red tasty')
      $('.apple', $fruits).hasClass('apple').should.be.ok
      $('.apple', $fruits).hasClass('fruit').should.be.ok
      $('.apple', $fruits).hasClass('red').should.be.ok
      $('.apple', $fruits).hasClass('tasty').should.be.ok
      
    it '(fn) : should add classes returned from the function'
  
  describe '.removeClass', ->
    
    it '() : should remove all the classes', ->
      $fruits = $(fruits)
      $('.pear', $fruits).addClass 'fruit'
      $('.pear', $fruits).removeClass()
      should.not.exist $('.pear', $fruits).attr('class')
    
    it '(invalid class) : should not remove anything', ->
      $fruits = $(fruits)
      $('.pear', $fruits).removeClass('fruit')
      $('.pear', $fruits).hasClass('pear').should.be.ok
      
    it '(single class) : should remove a single class from the element', ->
      $fruits = $(fruits)
      $('.pear', $fruits).addClass 'fruit'
      $('.pear', $fruits).hasClass('fruit').should.be.ok
      $('.pear', $fruits).removeClass('fruit')
      $('.pear', $fruits).hasClass('fruit').should.not.be.ok
      $('.pear', $fruits).hasClass('pear').should.be.ok
      
    it '(class class class) : should remove multiple classes from the element', ->
      $fruits = $(fruits)
      
      $('.apple', $fruits).addClass('fruit red tasty')
      $('.apple', $fruits).hasClass('apple').should.be.ok
      $('.apple', $fruits).hasClass('fruit').should.be.ok
      $('.apple', $fruits).hasClass('red').should.be.ok
      $('.apple', $fruits).hasClass('tasty').should.be.ok
      
      $('.apple', $fruits).removeClass('apple red tasty')
      $('.fruit', $fruits).hasClass('apple').should.not.be.ok
      $('.fruit', $fruits).hasClass('red').should.not.be.ok
      $('.fruit', $fruits).hasClass('tasty').should.not.be.ok
      $('.fruit', $fruits).hasClass('fruit').should.be.ok
      
    it '(fn) : should remove classes returned from the function'
  
  