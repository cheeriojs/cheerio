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

script = '<script src = "script.js" type = "text/javascript"></script>'

multiclass = '<p><a class = "btn primary" href = "#">Save</a></p>'

###
  Tests
###

describe 'cheerio', ->
  
  it '$(null) should return be empty', ->
    $(null).should.be.empty

  it '$(undefined) should be empty', ->
    $(undefined).should.be.empty
    
  it '$(null) should be empty', ->
    $('').should.be.empty
    
  it '$(selector) with no context or root should be empty', ->
    $('.h2').should.be.empty
    $('#fruits').should.be.empty
    
  it 'should be able to create html without a root or context', ->
    $h2 = $('<h2>')
    $h2.should.not.be.empty
    $h2.should.have.length 1
    $h2[0].name.should.equal 'h2'
    
  it 'should be able to create complicated html', ->
    $script = $(script)
    $script.should.not.be.empty
    $script.should.have.length 1
    $script[0].attribs.src.should.equal 'script.js'
    $script[0].attribs.type.should.equal 'text/javascript'
    $script[0].children.should.be.empty
  
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
    $ul = $('ul', fruits)
    $ul.should.have.length 1
    $ul[0].name.should.equal 'ul'
  
  it 'should be able to select multiple tags', ->
    $fruits = $('li', null, fruits)
    $fruits.should.have.length 3
    
    classes = ['apple', 'orange', 'pear']
    $fruits.each (i, $fruit) ->
      $fruit.attribs.class.should.equal classes[i]
  
  it 'should be able to do: $("#fruits .apple")', ->
    $apple = $('#fruits .apple', fruits)
    testAppleSelect $apple
    
  it 'should be able to do: $("li.apple")', ->
    $apple = $('li.apple', fruits)
    testAppleSelect $apple
    
  it 'should be able to select by attributes', ->
    $apple = $('li[class=apple]', fruits)
    testAppleSelect $apple
    
  it 'should be able to select multiple classes: $(".btn.primary")', ->
    $a = $('.btn.primary', multiclass)
    $a.should.have.length 1
    $a[0].children[0].data.should.equal 'Save' 
    
  