parse = require('../').parse
should = require 'should'

###
  Examples
###

# Tags
basic = '<html></html>'
siblings = '<h2></h2><p></p>'

# Single Tags
single = '<br />'
singleWrong = '<br>'

# Children
children = '<html><br /></html>'
li = '<li class = "durian">Durian</li>'

# Attributes
attributes = '<img src = "hello.png" alt = "man waving">'
noValueAttribute = '<textarea disabled></textarea>'

# Comments
comment = '<!-- sexy -->'
conditional = '<!--[if IE 8]><html class="no-js ie8" lang="en"><![endif]-->'

# Text
text = 'lorem ipsum'

# Script
script = '<script type = "text/javascript">alert(\"hi world!\");</script>'
scriptEmpty = '<script></script>'

# Style
style = '<style type = "text/css"> h2 { color:blue; } </style>'
styleEmpty = '<style></style>'

# Directives
directive = '<!doctype html>'

###
  Tests
###
describe 'parse', ->
  describe '.eval', ->

    it "should parse basic empty tags: #{basic}", ->
      tag = parse.eval(basic)[0]
      tag.type.should.equal 'tag'
      tag.name.should.equal 'html'
      should.not.exist tag.children
    
    it "should handle sibling tags: #{siblings}", ->
      dom = parse.eval siblings
      dom.should.have.length 2
      
      h2 = dom[0]
      p  = dom[1]
      h2.name.should.equal 'h2'
      p.name.should.equal 'p'
    
    it "should handle single tags: #{single}", ->
      tag = parse.eval(single)[0]
      tag.type.should.equal 'tag'
      tag.name.should.equal 'br'
      should.not.exist tag.children
      
    it "should handle malformatted single tags: #{singleWrong}", ->
      tag = parse.eval(singleWrong)[0]
      tag.type.should.equal 'tag'
      tag.name.should.equal 'br'
      should.not.exist tag.children
      
    it "should handle tags with children: #{children}", ->
      tag = parse.eval(children)[0]
      tag.type.should.equal 'tag'
      tag.name.should.equal 'html'
      should.exist tag.children
      tag.children.should.have.length 1
    
    it "should handle tags with children: #{li}", ->
      tag = parse.eval(li)[0]
      tag.children.should.have.length 1
      tag.children[0].data.should.equal 'Durian'
    
    it "should handle tags with attributes: #{attributes}", ->
      attrs = parse.eval(attributes)[0].attribs
      should.exist attrs
      attrs.src.should.equal 'hello.png'
      attrs.alt.should.equal 'man waving'
    
    it "should handle value-less attributes: #{noValueAttribute}", ->
      attrs = parse.eval(noValueAttribute)[0].attribs
      should.exist attrs
      attrs.disabled.should.equal 'disabled'
     
    it "should handle comments: #{comment}", ->
      elem = parse.eval(comment)[0]
      elem.type.should.equal 'comment'
      elem.data.should.equal ' sexy '
    
    it "should handle conditional comments: #{conditional}", ->
      elem = parse.eval(conditional)[0]
      elem.type.should.equal 'comment'
      elem.data.should.equal conditional.replace('<!--', '').replace('-->', '')
    
    it "should handle text: #{text}", ->
      text = parse.eval(text)[0]
      text.type.should.equal 'text'
      text.data.should.equal 'lorem ipsum'
    
    it "should handle script tags: #{script}", ->
      script = parse.eval(script)[0]
      script.type.should.equal 'script'
      script.name.should.equal 'script'
      script.attribs.type.should.equal 'text/javascript'
      
      script.children.should.have.length 1
      script.children[0].type.should.equal 'text'
      script.children[0].data.should.equal 'alert("hi world!");'

    it "should handle style tags: #{style}", ->
      style = parse.eval(style)[0]
      style.type.should.equal 'style'
      style.name.should.equal 'style'
      style.attribs.type.should.equal 'text/css'

      style.children.should.have.length 1
      style.children[0].type.should.equal 'text'
      style.children[0].data.should.equal ' h2 { color:blue; } '

    it "should handle directives: #{directive}", ->
      elem = parse.eval(directive)[0]
      elem.type.should.equal 'directive'
      elem.data.should.equal '!doctype html'
      elem.name.should.equal '!doctype'
      
  describe '.connect', ->
    create = (html) ->
      dom = parse.eval html
      return parse.connect dom
      
    it "should fill in empty attributes: #{basic}", ->
      tag = create(basic)[0]

      # Should exist but be null
      should.strictEqual null, tag.parent
      should.strictEqual null, tag.next
      should.strictEqual null, tag.prev

      # Should exist but not empty
      tag.children.should.be.empty
      should.exist tag.attribs
    
    it "should should fill in empty attributes for scripts: #{scriptEmpty}", ->
      script = create(scriptEmpty)[0]
      
      # Should exist but be null
      should.strictEqual null, script.parent
      should.strictEqual null, script.next
      should.strictEqual null, script.prev
      
      # Should exist but not empty
      script.children.should.be.empty
      should.exist script.attribs
    
    it "should should fill in empty attributes for styles: #{styleEmpty}", ->
      style = create(styleEmpty)[0]

      # Should exist but be null
      should.strictEqual null, style.parent
      should.strictEqual null, style.next
      should.strictEqual null, style.prev

      # Should exist but not empty
      style.children.should.be.empty
      should.exist style.attribs
    
    it "should have next and prev siblings: #{siblings}", ->
      dom = create(siblings)
      h2  = dom[0]
      p   = dom[1]
      
      # No parents
      should.strictEqual null, h2.parent
      should.strictEqual null, p.parent      
      
      # Neighbors
      h2.next.name.should.equal 'p'
      p.prev.name.should.equal 'h2'
      
      # Should exist but not empty
      h2.children.should.be.empty
      should.exist h2.attribs
      p.children.should.be.empty
      should.exist p.attribs
    
    it "should connect child with parent: #{children}", ->
      html = create(children)[0]
      
      # html has 1 child and its <br>
      html.children.should.have.length 1
      html.children[0].name.should.equal 'br'
      
      # br's parent is html
      br = html.children[0]
      br.parent.name.should.equal 'html'

    
    it "should fill in some empty attributes for comments: #{comment}", ->
      elem = create(comment)[0]
      
      # Should exist but be null
      should.strictEqual null, elem.parent
      should.strictEqual null, elem.next
      should.strictEqual null, elem.prev
      
      # Should not exist at all
      should.not.exist elem.children
      should.not.exist elem.attribs
    
    it "should fill in some empty attributes for text: #{text}", ->
      text = create(text)[0]

      # Should exist but be null
      should.strictEqual null, text.parent
      should.strictEqual null, text.next
      should.strictEqual null, text.prev

      # Should not exist at all
      should.not.exist text.children
      should.not.exist text.attribs  
      
    it "should fill in some empty attributes for directives: #{directive}", ->
      elem = create(directive)[0]

      # Should exist but be null
      should.strictEqual null, elem.parent
      should.strictEqual null, elem.next
      should.strictEqual null, elem.prev

      # Should not exist at all
      should.not.exist elem.children
      should.not.exist elem.attribs
      
  describe '.parse', ->
    rootTest = (root) ->
      root.name.should.equal 'root'
      
      # Should exist but be null
      should.strictEqual null, root.next
      should.strictEqual null, root.prev
      should.strictEqual null, root.parent
            
      child = root.children[0]
      child.parent.should.equal root
      
    it "should add root to: #{basic}", ->
      root = parse(basic)
      rootTest root
      
      root.children.should.have.length 1
      root.children[0].name.should.equal 'html'
      
    it "should add root to: #{siblings}", ->
      root = parse(siblings)
      rootTest root
      
      root.children.should.have.length 2
      root.children[0].name.should.equal 'h2'
      root.children[1].name.should.equal 'p'
      
      root.children[1].parent.name.should.equal 'root'
      
    it "should add root to: #{comment}", ->
      root = parse(comment)
      rootTest root

      root.children.should.have.length 1
      root.children[0].type.should.equal 'comment'
    
    it "should add root to: #{text}", ->
      root = parse(text)
      rootTest root
      
      root.children.should.have.length 1
      root.children[0].type.should.equal 'text'
      
    it "should add root to: #{scriptEmpty}", ->
      root = parse(scriptEmpty)
      rootTest root
      
      root.children.should.have.length 1
      root.children[0].type.should.equal 'script'

    it "should add root to: #{styleEmpty}", ->
      root = parse(styleEmpty)
      rootTest root
      
      root.children.should.have.length 1
      root.children[0].type.should.equal 'style'
      
    it "should add root to: #{directive}", ->
      root = parse(directive)
      rootTest root
      
      root.children.should.have.length 1
      root.children[0].type.should.equal 'directive'
      
