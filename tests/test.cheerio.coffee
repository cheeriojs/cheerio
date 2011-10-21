fs = require 'fs'

should = require "should"
vows = require "vows"
_ = require "underscore"

suite = vows.describe "Cheerio tests"

suite.addBatch 
  'API: ' : require('./api/test.api.coffee')
  
suite.addBatch
  'RENDERING: ' : require('./rendering/test.rendering.coffee')

suite.export module