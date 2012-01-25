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
    
    it 'should render <br> tags correctly', (done) ->
      str = "<br />"
      html(str).should.equal '<br />'
      done()
      
    it 'should display empty strings for undefined attribs', ->
      # str = '<link rel="stylesheet" media = "" href="" />'
      # html(str).should.equal str
      # 
      # done()
      