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
  
    it '() : should return this'
  
    it '(single) : should find one descendant'
    
    it '(many) : should find all matching descendant'
    
    it '(many) : should merge all selected elems with matching descendants'
    
    it '(invalid single) : should return empty if cant find'
    
  describe '.children', ->
    
    it '() : should get all children'
    
    it '(index) : should get child at index'
    
    it '(selector) : should return children matching selector'
    
    it '(invalid selector) : should return empty'
    
  describe '.next', ->
    
    it '() : should return next element'
    
    it '(no next) : should return null (?)'
  
  describe '.prev', ->
    
    it '() : should return previous element'
    
    it '(no prev) : should return null (?)'
    
  describe '.siblings', ->
    
    it '() : should get all the siblings'
    
    it '(selector) : should get all siblings that match the selector'
    
  describe '.each', ->
    
    it '( (i, elem) -> ) : should loop selected returning fn with (i, elem)'
    
    
    