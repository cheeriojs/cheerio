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
  describe '.find', ->
  
    it '() : should return this', ->
      $('ul', fruits).find()[0].name.should.equal 'ul'
  
    it '(single) : should find one descendant', ->
      $('#fruits', fruits).find('.apple')[0].attribs.class.should.equal 'apple'
    
    it '(many) : should find all matching descendant', ->
      $('#fruits', fruits).find('li').should.have.length 3
    
    it '(many) : should merge all selected elems with matching descendants'
      
    it '(invalid single) : should return empty if cant find', ->
      $('ul', fruits).find('blah').should.have.length 0
    
    it 'should return empty if search already empty result', ->
      $('#fruits').find('li').should.have.length 0
    
  describe '.children', ->
    
    it '() : should get all children', ->
      $('ul', fruits).children().should.have.length 3
    
    it '(selector) : should return children matching selector', ->
      $('ul', fruits).children('.orange').hasClass('orange').should.be.ok
      
    it '(invalid selector) : should return empty', ->
      $('ul', fruits).children('.lulz').should.have.length 0
      
    it 'should only match immediate children, not ancestors'#, ->
      # $fruits = $.load(fruits)
      # $fruits('.pear').append('<h2 class = "green">Green</h2>');
      # 
      # $test = $('ul', $fruits.html())
      # 
      # console.log $test.children()
      # $test.children('.green').length.should.equal 0
      # console.log $test.children()
  
  describe '.next', ->
    
    it '() : should return next element', ->
      $('.orange', fruits).next().hasClass('pear').should.be.ok
    
    it '(no next) : should return null (?)'
  
  describe '.prev', ->
    
    it '() : should return previous element', ->
      $('.orange', fruits).prev().hasClass('apple').should.be.ok
    
    it '(no prev) : should return null (?)'
    
  describe '.siblings', ->
    
    it '() : should get all the siblings', ->
      $('.orange', fruits).siblings().should.have.length 2
    
    it '(selector) : should get all siblings that match the selector', ->
      $('.orange', fruits).siblings('li').should.have.length 2
    
  describe '.each', ->
    it '( (i, elem) -> ) : should loop selected returning fn with (i, elem)', ->
      items = []
      $('li', fruits).each (i, elem) ->
        items[i] = elem
        
      items[0].attribs.class.should.equal 'apple'
      items[1].attribs.class.should.equal 'orange'
      items[2].attribs.class.should.equal 'pear'
    
  describe '.first', ->
    it '() : should return the first item', ->
      src = $("<span>foo</span><span>bar</span><span>baz</span>")
      elem = src.first()

      elem.length.should.equal 1
      elem.html().should.equal 'foo'
      
    it '() : should return an empty object for an empty object', ->
      src = $();
      first = src.first();
      
      first.length.should.equal 0
      should.not.exist first.html()
      
  describe '.last', ->
    it '() : should return the last element', ->
      src = $("<span>foo</span><span>bar</span><span>baz</span>");
      elem = src.last();

      elem.length.should.equal 1
      elem.html().should.equal 'baz'
      
    it '() : should return an empty object for an empty object', ->
      src = $();
      last = src.last();
      
      last.length.should.equal 0
      should.not.exist last.html()
    
  describe '.first & .last', ->
    it '() : should return same object if only one object', ->
      src = $("<span>bar</span>");
      first = src.first();
      last = src.last();

      first.html().should.equal last.html()
      first.length.should.equal 1
      first.html().should.equal 'bar'
      
      last.length.should.equal 1
      last.html().should.equal 'bar'
      
      
    