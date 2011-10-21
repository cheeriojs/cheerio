htmlparser = require "htmlparser"
fs = require "fs"
  
parse = exports.parse = (content) ->
  handler = new htmlparser.DefaultHandler()
  parser = new htmlparser.Parser handler
  
  parser.includeLocation = false
  parser.parseComplete content
  
  dom = handler.dom
  dom = connectDOM dom
  
  return dom

connectDOM = (dom, parent = null) ->
  prevIndex = -1
  lastElem = null
  for elem, i in dom

    # Set parent
    dom[i].parent = parent
    
    # Previous sibling
    prev = dom[prevIndex]
    if prev
      dom[i].prev = prev
    else
      dom[i].prev = null

    # Next sibling
    dom[i].next = null
    if lastElem
      lastElem.next = dom[i]
    
    # Run through the children
    if dom[i].children
      connectDOM dom[i].children, dom[i]
    
    # Get ready for next elem
    prevIndex = i
    lastElem = dom[i]
    
      
  return dom

module.exports = exports

# Quick test
# basic = fs.readFileSync '../tests/initial/basic.html', 'utf8'
# 
# dom = parse basic
# utils = require "./utils"
# console.log utils.print dom, 'prev.attribs.class'
