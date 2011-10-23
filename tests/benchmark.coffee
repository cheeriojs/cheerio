jsdom = require("jsdom").jsdom
cheerio = require("../src/cheerio")

fs = require "fs"
basic = fs.readFileSync "./files/basic/basic.html", 'utf8'

# Quick and dirty timer - shows htmlparser is about 8x faster than jsdom

timer = (name) ->
  @name = name

timer::start = ->
  @start = Date.now()
  
timer::stop = ->
  @stop = Date.now()
  
timer::results = ->
  "Results #{@name} : " + (@stop - @start) + "ms"

createDOMinJSDOM = () ->
  time = new timer "jsdom parse"
  time.start()
  dom = jsdom basic
  time.stop()
  console.log time.results()
  
createDOMinHTMLPARSER = () ->
  time = new timer "cheerio parse"
  time.start()
  cheerio basic
  time.stop()
  console.log time.results()
  
createHTMLfromJSDOM = () ->
  time = new timer "jsdom render"
  dom = jsdom basic
  time.start()
  dom.innerHTML
  time.stop()
  console.log time.results()

createHTMLfromHTMLPARSER = () ->
  time = new timer "cheerio render"
  $ = cheerio basic
  time.start()
  $.html()
  time.stop()
  console.log time.results()

createDOMinJSDOM()
createDOMinHTMLPARSER()
createHTMLfromJSDOM()
createHTMLfromHTMLPARSER()