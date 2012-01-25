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

describe 'render', ->
  
  describe '(html)', ->
    
    it 'should render <br> tags correctly', (done) ->
      br = "<br />"
      dom = parse br
      render(dom).should.equal '<br />'
      done()
      