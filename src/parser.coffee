htmlparser = require "htmlparser2"
fs = require "fs"
splice = [].splice

parse = exports.parse = (content) ->
  handler = new htmlparser.DefaultHandler()
  parser = new htmlparser.Parser handler
  
  parser.includeLocation = false
  parser.parseComplete content
  dom = handler.dom
    
  root = {
    type : 'root'
    name : 'root'
    parent : null
    prev : null
    next : null
    children : []
  }
  
  root.children = createTree dom, root
  # 
  # for elem in root.children
  #   elem.parent = root


  return root

createTree = (dom, parent = null) ->
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
      createTree dom[i].children, dom[i]
    
    # Get ready for next elem
    prevIndex = i
    lastElem = dom[i]
    
      
  return dom

module.exports = exports
