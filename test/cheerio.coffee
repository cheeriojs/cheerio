$ = require('../')
should = require 'should'

###
  Tests
###

fruits = '''
<ul id = "fruits">
  <li class = "apple">Apple</li>
  <li class = "orange">Orange</li>
  <li class = "pear">Pear</li>
</ul>  
'''.replace /(\n|\s{2})/g, ''
# Replace \n and exactly 2 spaces with ''

describe 'cheerio', ->
  
  it '$(null) should return be empty', ->
    $(null).should.be.empty

  it '$(undefined) should be empty', ->
    $(undefined).should.be.empty
    
  it '$(null) should be empty', ->
    $('').should.be.empty
    
  it '$(selector) with no context or root should be empty', ->
    $('.h2').should.be.empty
  
  testAppleSelect = ($apple) ->
    $apple.should.have.length 1
    
    $apple = $apple[0]
    $apple.parent.name.should.equal 'ul'
    should.not.exist $apple.prev
    $apple.next.attribs.class.should.equal 'orange'
    
    $apple.children.should.have.length 1
    $apple.children[0].data.should.equal 'Apple'
    
  it 'should be able to select .apple with only a context', ->
    $apple = $('.apple', fruits)
    testAppleSelect $apple
    
  it 'should be able to select .apple with only a root', ->
    $apple = $('.apple', null, fruits)
    testAppleSelect $apple
  
  it 'should be able to select an id', ->
    $fruits = $('#fruits', null, fruits)
    $fruits.should.have.length 1
    $fruits[0].attribs.id.should.equal 'fruits'
    
  it 'should be able to select a tag', ->
    $fruits = $('li', null, fruits)
    $fruits.should.have.length 3
    
    classes = ['apple', 'orange', 'pear']
    $fruits.each (i, $fruit) ->
      $fruit.attribs.class.should.equal classes[i]
  
  
    
  