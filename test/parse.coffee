parse = require('../').parse
expect = require 'expect.js'

###
  Examples
###

# Tags
basic = '<html></html>'
siblings = '<h2></h2><p></p>'

# Single Tags
single = '<br/>'
singleWrong = '<br>'

# Children
children = '<html><br/></html>'
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
      
      expect(tag.type).to.equal 'tag'
      expect(tag.name).to.equal 'html'
      
      expect(tag.children).to.be.empty
    
    it "should handle sibling tags: #{siblings}", ->
      dom = parse.eval siblings
      expect(dom).to.have.length 2
      
      h2 = dom[0]
      p  = dom[1]
      expect(h2.name).to.equal 'h2'
      expect(p.name).to.equal 'p'
    
    it "should handle single tags: #{single}", ->
      tag = parse.eval(single)[0]
      
      expect(tag.type).to.equal 'tag'
      expect(tag.name).to.equal 'br'
      
      expect(tag.children).to.be.empty
      
    it "should handle malformatted single tags: #{singleWrong}", ->
      tag = parse.eval(singleWrong)[0]
      
      expect(tag.type).to.equal 'tag'
      expect(tag.name).to.equal 'br'
      
      expect(tag.children).to.be.empty
      
    it "should handle tags with children: #{children}", ->
      tag = parse.eval(children)[0]
      expect(tag.type).to.equal 'tag'
      expect(tag.name).to.equal 'html'
      expect(tag.children).to.be.ok
      expect(tag.children).to.have.length 1
    
    it "should handle tags with children: #{li}", ->
      tag = parse.eval(li)[0]
      expect(tag.children).to.have.length 1
      expect(tag.children[0].data).to.equal 'Durian'
    
    it "should handle tags with attributes: #{attributes}", ->
      attrs = parse.eval(attributes)[0].attribs
      expect(attrs).to.be.ok
      expect(attrs.src).to.equal 'hello.png'
      expect(attrs.alt).to.equal 'man waving'
    
    it "should handle value-less attributes: #{noValueAttribute}", ->
      attrs = parse.eval(noValueAttribute)[0].attribs
      expect(attrs).to.be.ok
      expect(attrs.disabled).to.equal 'disabled'
     
    it "should handle comments: #{comment}", ->
      elem = parse.eval(comment)[0]
      expect(elem.type).to.equal 'comment'
      expect(elem.data).to.equal ' sexy '
    
    it "should handle conditional comments: #{conditional}", ->
      elem = parse.eval(conditional)[0]
      expect(elem.type).to.equal 'comment'
      expect(elem.data).to.equal conditional.replace('<!--', '').replace('-->', '')
    
    it "should handle text: #{text}", ->
      text = parse.eval(text)[0]
      expect(text.type).to.equal 'text'
      expect(text.data).to.equal 'lorem ipsum'
    
    it "should handle script tags: #{script}", ->
      script = parse.eval(script)[0]
      expect(script.type).to.equal 'script'
      expect(script.name).to.equal 'script'
      expect(script.attribs.type).to.equal 'text/javascript'
      
      expect(script.children).to.have.length 1
      expect(script.children[0].type).to.equal 'text'
      expect(script.children[0].data).to.equal 'alert("hi world!");'

    it "should handle style tags: #{style}", ->
      style = parse.eval(style)[0]
      expect(style.type).to.equal 'style'
      expect(style.name).to.equal 'style'
      expect(style.attribs.type).to.equal 'text/css'

      expect(style.children).to.have.length 1
      expect(style.children[0].type).to.equal 'text'
      expect(style.children[0].data).to.equal ' h2 { color:blue; } '

    it "should handle directives: #{directive}", ->
      elem = parse.eval(directive)[0]
      expect(elem.type).to.equal 'directive'
      expect(elem.data).to.equal '!doctype html'
      expect(elem.name).to.equal '!doctype'
      
  describe '.connect', ->
    create = (html) ->
      dom = parse.eval html
      return parse.connect dom
      
    it "should fill in empty attributes: #{basic}", ->
      tag = create(basic)[0]

      # Should exist but be null
      expect(tag.parent).to.be(null)
      expect(tag.next).to.be(null)
      expect(tag.prev).to.be(null)

      # Should exist but not empty
      expect(tag.children).to.be.empty
      expect(tag.attribs).to.be.ok
    
    it "should should fill in empty attributes for scripts: #{scriptEmpty}", ->
      script = create(scriptEmpty)[0]
      
      # Should exist but be null
      expect(script.parent).to.be(null)
      expect(script.next).to.be(null)
      expect(script.prev).to.be(null)
      
      # Should exist but not empty
      expect(script.children).to.be.empty
      expect(script.attribs).to.be.ok
    
    it "should should fill in empty attributes for styles: #{styleEmpty}", ->
      style = create(styleEmpty)[0]

      # Should exist but be null
      expect(style.parent).to.be(null)
      expect(style.next).to.be(null)
      expect(style.prev).to.be(null)

      # Should exist but not empty
      expect(style.children).to.be.empty
      expect(style.attribs).to.be.ok
    
    it "should have next and prev siblings: #{siblings}", ->
      dom = create(siblings)
      h2  = dom[0]
      p   = dom[1]
      
      # No parents
      expect(h2.parent).to.be(null)
      expect(p.parent).to.be(null)   
      
      # Neighbors
      expect(h2.next.name).to.equal 'p'
      expect(p.prev.name).to.equal 'h2'
      
      # Should exist but not empty
      expect(h2.children).to.be.empty
      expect(h2.attribs).to.be.ok
      expect(p.children).to.be.empty
      expect(p.attribs).to.be.ok
    
    it "should connect child with parent: #{children}", ->
      html = create(children)[0]
      
      # html has 1 child and its <br>
      expect(html.children).to.have.length 1
      expect(html.children[0].name).to.equal 'br'
      
      # br's parent is html
      br = html.children[0]
      expect(br.parent.name).to.equal 'html'

    
    it "should fill in some empty attributes for comments: #{comment}", ->
      elem = create(comment)[0]
      
      # Should exist but be null
      expect(elem.parent).to.be(null)
      expect(elem.next).to.be(null)
      expect(elem.prev).to.be(null)
      
      # Should not exist at all
      expect(elem.children).to.not.be.ok
      expect(elem.attribs).to.not.be.ok
    
    it "should fill in some empty attributes for text: #{text}", ->
      text = create(text)[0]

      # Should exist but be null
      expect(text.parent).to.be(null)
      expect(text.next).to.be(null)
      expect(text.prev).to.be(null)

      # Should not exist at all
      expect(text.children).to.not.be.ok
      expect(text.attribs).to.not.be.ok
      
    it "should fill in some empty attributes for directives: #{directive}", ->
      elem = create(directive)[0]

      # Should exist but be null
      expect(elem.parent).to.be(null)
      expect(elem.next).to.be(null)
      expect(elem.prev).to.be(null)

      # Should not exist at all
      expect(elem.children).to.not.be.ok
      expect(elem.attribs).to.not.be.ok
      
  describe '.parse', ->
    rootTest = (root) ->
      expect(root.name).to.equal 'root'
      
      # Should exist but be null
      expect(root.next).to.be(null)
      expect(root.prev).to.be(null)
      expect(root.parent).to.be(null)
            
      child = root.children[0]
      expect(child.parent).to.equal root
      
    it "should add root to: #{basic}", ->
      root = parse(basic)
      rootTest root
      
      expect(root.children).to.have.length 1
      expect(root.children[0].name).to.equal 'html'
      
    it "should add root to: #{siblings}", ->
      root = parse(siblings)
      rootTest root
      
      expect(root.children).to.have.length 2
      expect(root.children[0].name).to.equal 'h2'
      expect(root.children[1].name).to.equal 'p'
      
      expect(root.children[1].parent.name).to.equal 'root'
      
    it "should add root to: #{comment}", ->
      root = parse(comment)
      rootTest root

      expect(root.children).to.have.length 1
      expect(root.children[0].type).to.equal 'comment'
    
    it "should add root to: #{text}", ->
      root = parse(text)
      rootTest root
      
      expect(root.children).to.have.length 1
      expect(root.children[0].type).to.equal 'text'
      
    it "should add root to: #{scriptEmpty}", ->
      root = parse(scriptEmpty)
      rootTest root
      
      expect(root.children).to.have.length 1
      expect(root.children[0].type).to.equal 'script'

    it "should add root to: #{styleEmpty}", ->
      root = parse(styleEmpty)
      rootTest root
      
      expect(root.children).to.have.length 1
      expect(root.children[0].type).to.equal 'style'
      
    it "should add root to: #{directive}", ->
      root = parse(directive)
      rootTest root
      
      expect(root.children).to.have.length 1
      expect(root.children[0].type).to.equal 'directive'
      
