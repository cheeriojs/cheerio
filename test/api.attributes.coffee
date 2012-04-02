$ = require('../')
expect = require 'expect.js'

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
      expect(attrs.id).to.equal('fruits');
      
    it '(invalid key) : invalid attr should get undefined', ->
      attr = $('.apple', fruits).attr('lol')
      expect(attr).to.be(undefined);
      
    it '(valid key) : valid attr should get value', ->
      cls = $('.apple', fruits).attr('class')
      expect(cls).to.equal('apple');
         
    it '(key, value) : should set attr', ->
      $fruits = $(fruits)
      $pear = $('.pear', $fruits).attr('id', 'pear')
      expect($('#pear', $fruits)).to.have.length(1)
      expect($pear.cheerio).to.not.be(undefined)
      
    it '(map) : object map should set multiple attributes', ->
      $fruits = $(fruits)
      $('.apple', $fruits).attr
        id : 'apple'
        style : 'color:red;'
        'data-url' : 'http://apple.com'
    
      attrs = $('.apple', $fruits).attr()
      expect(attrs.id).to.equal('apple')
      expect(attrs.style).to.equal('color:red;')
      expect(attrs['data-url']).to.equal('http://apple.com')
        
  describe '.removeAttr', ->
    
    it '(key) : should remove a single attr', ->
      $fruits = $(fruits)

      expect($('ul', $fruits).attr('id')).to.not.be(undefined);
      $('ul', $fruits).removeAttr('id')
      expect($('ul', $fruits).attr('id')).to.be(undefined);
      
    it 'should return cheerio object', ->
      obj = $('ul', fruits).removeAttr('id').cheerio
      expect(obj).to.be.ok
    
  describe '.hasClass', ->
    
    it '(valid class) : should return true', ->
      $fruits = $(fruits)
      cls = $('.apple', $fruits).hasClass('apple')
      expect(cls).to.be.ok
      
    it '(invalid class) : should return false', ->
      cls = $('#fruits', fruits).hasClass('fruits')
      expect(cls).to.not.be.ok
  
  describe '.addClass', ->
    
    it '(first class) : should add the class to the element', ->
      $fruits = $(fruits)
      $('#fruits', $fruits).addClass('fruits')
      cls = $('#fruits', $fruits).hasClass('fruits')
      expect(cls).to.be.ok
      
    it '(single class) : should add the class to the element', ->
      $fruits = $(fruits)
      $('.apple', $fruits).addClass('fruit')
      cls = $('.apple', $fruits).hasClass('fruit')
      expect(cls).to.be.ok
    
    it '(class): adds classes to many selected items', ->
      $fruits= $(fruits)
      $('li', $fruits).addClass('fruit')
      
      expect($('.apple', $fruits).hasClass('fruit')).to.be.ok
      expect($('.orange', $fruits).hasClass('fruit')).to.be.ok
      expect($('.pear', $fruits).hasClass('fruit')).to.be.ok
    
    it '(class class class) : should add multiple classes to the element', ->
      $fruits = $(fruits)
      $('.apple', $fruits).addClass('fruit red tasty')
      expect($('.apple', $fruits).hasClass('apple')).to.be.ok
      expect($('.apple', $fruits).hasClass('fruit')).to.be.ok
      expect($('.apple', $fruits).hasClass('red')).to.be.ok
      expect($('.apple', $fruits).hasClass('tasty')).to.be.ok
      
    it '(fn) : should add classes returned from the function'
  
  describe '.removeClass', ->
    
    it '() : should remove all the classes', ->
      $fruits = $(fruits)
      $('.pear', $fruits).addClass 'fruit'
      $('.pear', $fruits).removeClass()
      expect($('.pear', $fruits).attr('class')).to.be(undefined)
    
    it '(invalid class) : should not remove anything', ->
      $fruits = $(fruits)
      $('.pear', $fruits).removeClass('fruit')
      expect($('.pear', $fruits).hasClass('pear')).to.be.ok
      
    it '(single class) : should remove a single class from the element', ->
      $fruits = $(fruits)
      $('.pear', $fruits).addClass 'fruit'
      expect($('.pear', $fruits).hasClass('fruit')).to.be.ok
      $('.pear', $fruits).removeClass('fruit')
      expect($('.pear', $fruits).hasClass('fruit')).to.not.be.ok
      expect($('.pear', $fruits).hasClass('pear')).to.be.ok
      
    it '(class class class) : should remove multiple classes from the element', ->
      $fruits = $(fruits)
      
      $('.apple', $fruits).addClass('fruit red tasty')
      expect($('.apple', $fruits).hasClass('apple')).to.be.ok
      expect($('.apple', $fruits).hasClass('fruit')).to.be.ok
      expect($('.apple', $fruits).hasClass('red')).to.be.ok
      expect($('.apple', $fruits).hasClass('tasty')).to.be.ok
      
      $('.apple', $fruits).removeClass('apple red tasty')
      expect($('.fruit', $fruits).hasClass('apple')).to.not.be.ok
      expect($('.fruit', $fruits).hasClass('red')).to.not.be.ok
      expect($('.fruit', $fruits).hasClass('tasty')).to.not.be.ok
      expect($('.fruit', $fruits).hasClass('fruit')).to.be.ok
      
    it '(fn) : should remove classes returned from the function'
  
  