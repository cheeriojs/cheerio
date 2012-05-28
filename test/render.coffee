parse = require('../').parse
render = require('../').render
expect = require 'expect.js'

###
  
  TODO: Write tests for render
  
###

###
  Examples
###

# Tags

# Text

# Directives

# Style

# Script

# Comments

###
  Tests
###

html = (str, options = {}) ->
  dom = parse(str, options)
  return render(dom)

describe 'render', ->
  
  describe '(html)', ->
    
    it 'should render <br /> tags correctly', (done) ->
      str = "<br />"
      expect(html(str)).to.equal '<br/>'
      done()
  
    it 'should shorten the \'checked\' attribute when it contains the value \'checked\'', (done) ->
      str = '<input checked/>'
      expect(html(str)).to.equal '<input checked/>'
      done()
      
    it 'should not shorten the \'name\' attribute when it contains the value \'name\'', (done) ->
      str = '<input name = "name"/>'
      expect(html(str)).to.equal '<input name="name"/>'
      done()

    it 'should render comments correctly', (done) ->
      str = '<!-- comment -->'
      expect(html(str)).to.equal '<!-- comment -->'
      done()

    it 'should render whitespace by default', (done) ->
      str = '<a href="./haha.html">hi</a> <a href="./blah.html">blah</a>'
      expect(html(str)).to.equal str
      done()

    it 'should ignore whitespace if specified', (done) ->
      str = '<a href="./haha.html">hi</a> <a href="./blah.html">blah  </a>'
      expect(html(str, ignoreWhitespace : true)).to.equal '<a href="./haha.html">hi</a><a href="./blah.html">blah  </a>'
      done()