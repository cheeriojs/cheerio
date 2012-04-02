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
  describe '.find', ->
  
    it '() : should return this', ->
      expect($('ul', fruits).find()[0].name).to.equal 'ul'
  
    it '(single) : should find one descendant', ->
      expect($('#fruits', fruits).find('.apple')[0].attribs.class).to.equal 'apple'
    
    it '(many) : should find all matching descendant', ->
      expect($('#fruits', fruits).find('li')).to.have.length 3
    
    it '(many) : should merge all selected elems with matching descendants'
      
    it '(invalid single) : should return empty if cant find', ->
      expect($('ul', fruits).find('blah')).to.have.length 0
    
    it 'should return empty if search already empty result', ->
      expect($('#fruits').find('li')).to.have.length 0
    
  describe '.children', ->
    
    it '() : should get all children', ->
      expect($('ul', fruits).children()).to.have.length 3
    
    it '(selector) : should return children matching selector', ->
      expect($('ul', fruits).children('.orange').hasClass('orange')).to.be.ok
      
    it '(invalid selector) : should return empty', ->
      expect($('ul', fruits).children('.lulz')).to.have.length 0
      
    it 'should only match immediate children, not ancestors'
  
  describe '.next', ->
    
    it '() : should return next element', ->
      expect($('.orange', fruits).next().hasClass('pear')).to.be.ok
    
    it '(no next) : should return null (?)'
  
  describe '.prev', ->
    
    it '() : should return previous element', ->
      expect($('.orange', fruits).prev().hasClass('apple')).to.be.ok
    
    it '(no prev) : should return null (?)'
    
  describe '.siblings', ->
    
    it '() : should get all the siblings', ->
      expect($('.orange', fruits).siblings()).to.have.length 2
    
    it '(selector) : should get all siblings that match the selector', ->
      expect($('.orange', fruits).siblings('li')).to.have.length 2
    
  describe '.each', ->
    it '( (i, elem) -> ) : should loop selected returning fn with (i, elem)', ->
      items = []
      $('li', fruits).each (i, elem) ->
        items[i] = elem
        
      expect(items[0].attribs.class).to.equal 'apple'
      expect(items[1].attribs.class).to.equal 'orange'
      expect(items[2].attribs.class).to.equal 'pear'
    
  describe '.first', ->
    it '() : should return the first item', ->
      src = $("<span>foo</span><span>bar</span><span>baz</span>")
      elem = src.first()

      expect(elem.length).to.equal 1
      expect(elem.html()).to.equal 'foo'
      
    it '() : should return an empty object for an empty object', ->
      src = $();
      first = src.first();
      
      expect(first.length).to.equal 0
      expect(first.html()).to.be(null)
      
  describe '.last', ->
    it '() : should return the last element', ->
      src = $("<span>foo</span><span>bar</span><span>baz</span>");
      elem = src.last();

      expect(elem.length).to.equal 1
      expect(elem.html()).to.equal 'baz'
      
    it '() : should return an empty object for an empty object', ->
      src = $();
      last = src.last();
      
      expect(last.length).to.equal 0
      expect(last.html()).to.be(null)
    
  describe '.first & .last', ->
    it '() : should return same object if only one object', ->
      src = $("<span>bar</span>");
      first = src.first();
      last = src.last();

      expect(first.html()).to.equal last.html()
      expect(first.length).to.equal 1
      expect(first.html()).to.equal 'bar'
      
      expect(last.length).to.equal 1
      expect(last.html()).to.equal 'bar'
      
      
    