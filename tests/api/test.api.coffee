fs = require 'fs'
_ = require "underscore"
should = require "should"

###
  Tests
###

testfiles = [
  'attributes'
  'traversing'
  'manipulation'
]

###
  API Tests
###

tests = 
  'basic' : 
    topic : () ->
      self = this
      fs.readFile "#{__dirname}/basic/basic.html", "utf8", (err, html) ->
        should.not.exist err
        self.callback null, html

# Load the API
for name, test of tests
  for file in testfiles
    _.extend test, require "#{__dirname}/#{name}/test.#{file}"

# Export it.
module.exports = tests
