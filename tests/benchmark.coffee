jsdom = require("jsdom").jsdom
htmlparser = require("../htmlparser")

fs = require "fs"
basic = fs.readFileSync "./initial/basic.html", 'utf8'

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
  time = new timer "htmlparser parse"
  time.start()
  htmlparser.parse basic, (err, dom) ->
    throw err if err 
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
  time = new timer "htmlparser render"
  htmlparser.parse basic, (err, dom) ->
    throw err if err 
    time.start()
    htmlparser.render(dom)
    time.stop()
    console.log time.results()

createDOMinJSDOM()      
createDOMinHTMLPARSER()
createHTMLfromJSDOM()
createHTMLfromHTMLPARSER()