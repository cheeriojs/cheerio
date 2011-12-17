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
  describe '.append', ->
    
    it '() : should do nothing'
    
    it '(html) : should add element as last child'
    
    it '($(...)) : should add element as last child'
    
    it '(html, $(...), html) : should add elements as last children'
    
    it '(fn) : should add returned element as last child'
    
  describe '.prepend', ->
    
    it '() : should do nothing'
    
    it '(html) : should add element as first child'
    
    it '($(...)) : should add element as first child'
    
    it '(html, $(...), html) : should add elements as first children'
    
    it '(fn) : should add returned element as first child'
    
  describe '.after', ->
    
    it '() : should do nothing'
    
    it '(html) : should add element as next sibling'
    
    it '($(...)) : should add element as next sibling'
    
    it '(html, $(...), html) : should add elements as next sibling'
    
    it '(fn) : should add returned element as next sibling'
    
  describe '.before', ->
    
    it '() : should do nothing'
    
    it '(html) : should add element as previous sibling'
    
    it '($(...)) : should add element as previous sibling'
    
    it '(html, $(...), html) : should add elements as previous sibling'
    
    it '(fn) : should add returned element as previous sibling'
    
  describe '.remove', ->
    
    it '() : should remove selected elements'
    
    it '(selector) : should remove matching selected elements'
    
  describe '.empty', ->
    
    it '() : should remove all children from selected elements'
    
  describe '.html', ->
    # I think this is off, get give you outer html, set sets inner
    it '() : should get the html for an element'
    
    it '(html) : should set the html for its children'
    
  describe '.text', ->
    
    it '() : combines all text from children text nodes'
    
    it '(text) : sets the text for the child node'
    
    