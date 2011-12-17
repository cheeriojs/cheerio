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
    
    it '() : should get all the attributes'
    
    it '(invalid key) : invalid attr should get undefined', ->
      should.strictEqual undefined, $('.apple', fruits).attr('lol')
      
    it '(valid key) : valid attr should get value', ->
      $('.apple', fruits).attr('class').should.equal 'apple'
        
    it '(key, value) : should set attr', ->
      $fruits = $(fruits)

      $pear = $('.pear', $fruits).attr('id', 'pear')
      $('#pear', $fruits).should.have.length 1
      
    it '(map) : object map should set multiple attributes'
    
  describe '.removeAttr', ->
    
    it '(key) : should remove a single attr'
    
  describe '.hasClass', ->
    
    it '(valid class) : should return true'
      
    it '(invalid class) : should return false'
  
  describe '.addClass', ->
    
    it '(first class) : should add the class to the element'
    
    it '(single class) : should add the class to the element'
      
    it '(class class class) : should add multiple classes to the element'
      
    it '(fn) : should add classes returned from the function'
  
  describe '.removeClass', ->
    
    it '() : should remove all the classes'
    
    it '(no class) : should not remove anything'
      
    it '(single class) : should remove a single class from the element'
      
    it '(class class class) : should remove multiple classes from the element'
      
    it '(fn) : should remove classes returned from the function'
      
  
  