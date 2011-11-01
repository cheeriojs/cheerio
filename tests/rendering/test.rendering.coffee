fs = require 'fs'
path = require 'path'

_ = require "underscore"
should = require "should"

cheerio = require '../../src/cheerio'
diff = require './diff'

###
  Tests
###
testfiles = fs.readdirSync "#{__dirname}/files"

###
  API Tests
###

tests = {}
for file in testfiles
  do (file) ->
    name = path.basename(file, '.html')
    tests[file] = 
      topic : () ->
        self = this
        fs.readFile "#{__dirname}/files/#{file}", "utf8", (err, html) ->
          should.not.exist err
          $ = cheerio.load html
          $html = $.html()
          fs.writeFileSync "#{__dirname}/finals/#{name}.basic.html", $html
          d = diff.diff html, $html, "#{__dirname}/diffs/#{name}.basic.html"
          self.callback null, html, $, d

      "no difference" : (err, html, $, d) ->
        d.should.have.length 1
        

# Load the rendering tests
for name, test of tests
  name = path.basename(name, '.html')
  # Basically, if we want to go into more depth, do it in another file.
  try
    _.extend test, require "#{__dirname}/test.#{name}.coffee"
  catch error
    # no big.

# Export it.
module.exports = tests
