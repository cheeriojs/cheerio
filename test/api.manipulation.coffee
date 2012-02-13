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
    
    it '() : should do nothing', ->
      $('#fruits', fruits).append()[0].name.should.equal 'ul'
    
    it '(html) : should add element as last child', ->
      $fruits = $(fruits)
      $('#fruits', $fruits).append('<li class = "plum">Plum</li>')
      $('#fruits', $fruits).children(3).hasClass('plum').should.be.ok
    
    it '($(...)) : should add element as last child', ->
      $fruits = $(fruits)
      $plum = $('<li class = "plum">Plum</li>')
        
      $('#fruits', $fruits).append($plum)
      $('#fruits', $fruits).children(3).hasClass('plum').should.be.ok
    
    it '($(...), html) : should add multiple elements as last children', ->
      $fruits = $(fruits)
      $plum = $('<li class = "plum">Plum</li>')
      grape = '<li class = "grape">Grape</li>'
          
      $('#fruits', $fruits).append($plum, grape)
      $('#fruits', $fruits).children(3).hasClass('plum').should.be.ok
      $('#fruits', $fruits).children(4).hasClass('grape').should.be.ok
      
    it '(fn) : should add returned element as last child'
    
    it 'should maintain correct object state (Issue: #10)', ->
      should.exist $("<div></div>")
        .append("<div><div></div></div>")
        .children()
        .children()
        .parent()
    
  describe '.prepend', ->
    
    it '() : should do nothing', ->
      $('#fruits', fruits).prepend()[0].name.should.equal 'ul'
    
    it '(html) : should add element as first child', ->
      $fruits = $(fruits)
      $('#fruits', $fruits).prepend('<li class = "plum">Plum</li>')
      $('#fruits', $fruits).children(0).hasClass('plum').should.be.ok
      
    it '($(...)) : should add element as first child', ->
      $fruits = $(fruits)
      $plum = $('<li class = "plum">Plum</li>')
        
      $('#fruits', $fruits).prepend($plum)
      $('#fruits', $fruits).children(0).hasClass('plum').should.be.ok
    
    it '(html, $(...), html) : should add multiple elements as first children', ->
      $fruits = $(fruits)
      $plum = $('<li class = "plum">Plum</li>')
      grape = '<li class = "grape">Grape</li>'
          
      $('#fruits', $fruits).prepend($plum, grape)
      $('#fruits', $fruits).children(0).hasClass('plum').should.be.ok
      $('#fruits', $fruits).children(1).hasClass('grape').should.be.ok
    
    it '(fn) : should add returned element as first child'
    
  describe '.after', ->
    
    it '() : should do nothing', ->
      $('#fruits', fruits).after()[0].name.should.equal 'ul'
      
    it '(html) : should add element as next sibling', ->
      $fruits = $(fruits)
      grape = '<li class = "grape">Grape</li>'
        
      $('.apple', $fruits).after(grape)
      $('.apple', $fruits).next().hasClass('grape').should.be.ok
    
    it '($(...)) : should add element as next sibling', ->
      $fruits = $(fruits)
      $plum = $('<li class = "plum">Plum</li>')
      
      $('.apple', $fruits).after($plum)
      $('.apple', $fruits).next().hasClass('plum').should.be.ok
    
    it '($(...), html) : should add multiple elements as next siblings', ->
      $fruits = $(fruits)
      $plum = $('<li class = "plum">Plum</li>')
      grape = '<li class = "grape">Grape</li>'
        
      $('.apple', $fruits).after($plum, grape)
      $('.apple', $fruits).next().hasClass('plum').should.be.ok
      $('.plum', $fruits).next().hasClass('grape').should.be.ok
      
    it '(fn) : should add returned element as next sibling'
    
  describe '.before', ->
    
    it '() : should do nothing', ->
      $('#fruits', fruits).before()[0].name.should.equal 'ul'
    
    it '(html) : should add element as previous sibling', ->
      $fruits = $(fruits)
      grape = '<li class = "grape">Grape</li>'
        
      $('.apple', $fruits).before(grape)
      $('.apple', $fruits).prev().hasClass('grape').should.be.ok
    
    it '($(...)) : should add element as previous sibling', ->
      $fruits = $(fruits)
      $plum = $('<li class = "plum">Plum</li>')
      
      $('.apple', $fruits).before($plum)
      $('.apple', $fruits).prev().hasClass('plum').should.be.ok
      
    it '($(...), html) : should add multiple elements as previous siblings', ->
      $fruits = $(fruits)
      $plum = $('<li class = "plum">Plum</li>')
      grape = '<li class = "grape">Grape</li>'
    
      $('.apple', $fruits).before($plum, grape)
      $('.apple', $fruits).prev().hasClass('grape').should.be.ok
      $('.grape', $fruits).prev().hasClass('plum').should.be.ok
      
    it '(fn) : should add returned element as previous sibling'
    
  describe '.remove', ->
    
    it '() : should remove selected elements', ->
      $fruits = $(fruits)
      $('.apple', $fruits).remove()
      $fruits.find('.apple').should.have.length 0
    
    it '(selector) : should remove matching selected elements', ->
      $fruits = $(fruits)
      $('li', $fruits).remove('.apple')
      $fruits.find('.apple').should.have.length 0
  
  
  describe '.replaceWith', ->
    it '(elem) : should replace one <li> tag with another', ->
      $fruits = $(fruits)
      plum = $('<li class = "plum">Plum</li>')
      $('.pear', $fruits).replaceWith(plum)
      $('.orange', $fruits).next().hasClass('plum').should.be.ok
      $('.orange', $fruits).next().html().should.equal 'Plum'
      
    it '(elem) : should replace the selected element with given element', ->
      src = $('<ul></ul>')
      elem = $('<h2>hi <span>there</span></h2>')
      
      replaced = src.replaceWith(elem)
      replaced[0].parent.type.should.equal 'root'
      
      $.html(replaced[0].parent).should.equal '<h2>hi <span>there</span></h2>'
      $.html(replaced).should.equal '<ul></ul>'
      
    it '(elem) : should replace the single selected element with given element', ->
      src = $('<br />')
      elem = $('<h2>hi <span>there</span></h2>')

      replaced = src.replaceWith(elem)
      replaced[0].parent.type.should.equal 'root'
      $.html(replaced[0].parent).should.equal '<h2>hi <span>there</span></h2>'
      
      $.html(replaced).should.equal '<br />'
          
    it '(str) : should accept strings', ->
      src = $('<br />')

      replaced = src.replaceWith('<h2>hi <span>there</span></h2>')
      replaced[0].parent.type.should.equal 'root'

      $.html(replaced[0].parent).should.equal '<h2>hi <span>there</span></h2>'
      $.html(replaced).should.equal '<br />'

  describe '.empty', ->
    
    it '() : should remove all children from selected elements', ->
      $fruits = $(fruits)
      $('#fruits', $fruits).empty()
      $('#fruits', $fruits).children().should.have.length 0
    
  describe '.html', ->
    it '() : should get the innerHTML for an element', ->
      $fruits = $(fruits)
      items = ['<li class = "apple">Apple</li>',
               '<li class = "orange">Orange</li>',
               '<li class = "pear">Pear</li>']
                 
      items = items.join('')
      
      $('#fruits', $fruits).html().should.equal items
    
    it '() : should get innerHTML even if its just text', ->
      item = '<li class = "pear">Pear</li>'
      $('.pear', item).html().should.equal 'Pear'
    
    it '() : should return empty string if nothing inside', ->
      item = '<li></li>'
      $('li', item).html().should.equal ''
    
    it '(html) : should set the html for its children', ->
      $fruits = $(fruits)
      $('#fruits', $fruits).html('<li class = "durian">Durian</li>')
      html = $('#fruits', $fruits).html()
      html.should.equal '<li class = "durian">Durian</li>'
    
  describe '.text', ->
    it '() : gets the text for a single element', ->
      $('.apple', fruits).text().should.equal 'Apple'
      
    it '() : combines all text from children text nodes', ->
      $('#fruits', fruits).text().should.equal 'AppleOrangePear'
      
    it '(text) : sets the text for the child node', ->
      $fruits = $(fruits)
      $('.apple', $fruits).text('Granny Smith Apple')
      $('.apple', $fruits)[0].children[0].data.should.equal 'Granny Smith Apple'
    
    it 'should allow functions as arguments', ->
      $fruits = $(fruits)
      $('.apple', $fruits).text (i, content) ->
        i.should.equal 0
        content.should.equal 'Apple'
        return 'whatever mate'
      
      $('.apple', $fruits)[0].children[0].data.should.equal 'whatever mate'
      
      
    