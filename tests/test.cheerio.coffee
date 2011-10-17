fs = require 'fs'

should = require "should"
vows = require "vows"
_ = require "underscore"

cheerio = require "../src/cheerio"
testdata = __dirname + "/testdata"

###
  Tests
###

testfiles = [
  'utils'
  'attributes'
  'traversing'
  'manipulation'
]

###
  Suite
###
suite = vows.describe "Cheerio tests"
testSuite = suite.addBatch

  'Basic: ' : 
    topic : () ->
      self = this
      fs.readFile "#{testdata}/basic.html", "utf8", (err, html) ->
        should.not.exist err
        self.callback null, html
        
  #       
  # 'Yahoo' : 
  #   topic : () ->
  #     self = this
  #     fs.readFile "#{testdata}/yahoo.html", "utf8", (err, html) ->
  #       should.not.exist err
  #       self.callback null, html, cheerio.load html

# Load the other tests
tests = testSuite.batches[0].tests
for name, test of tests
  for file in testfiles
    _.extend test, require "./api/test.#{file}"
  
# Export it.
testSuite.export module
