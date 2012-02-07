parse = require('../').parse
render = require('../').render
should = require 'should'

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

html = (str) ->
  dom = parse(str)
  return render(dom)

describe 'render', ->
  
  describe '(html)', ->
    
    it 'should render <br /> tags correctly', (done) ->
      str = "<br />"
      html(str).should.equal '<br />'
      done()
  
    it 'should shorten the \'checked\' attribute when it contains the value \'checked\'', (done) ->
      str = '<input checked = "checked"/>'
      html(str).should.equal '<input checked/>'
      done()
      
    it 'should not shorten the \'name\' attribute when it contains the value \'name\'', (done) ->
      str = '<input name = "name"/>'
      html(str).should.equal '<input name = "name"/>'
      done()

    it 'should render comments correctly', (done) ->
      str = '<!-- comment -->'
      html(str).should.equal '<!-- comment -->'
      done()