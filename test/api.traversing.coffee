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
    
    it '(index) : should get child at index', ->
      $('ul', fruits).children(1).hasClass('orange').should.be.ok
    
    it '(selector) : should return children matching selector', ->
      $('ul', fruits).children('.orange').hasClass('orange').should.be.ok
      
    it '(invalid selector) : should return empty', ->
      $('ul', fruits).children('.lulz').should.have.length 0
      
    it 'should only match immediate children, not ancestors'
    
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
    
    
    