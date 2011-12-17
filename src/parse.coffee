htmlparser = require "htmlparser2"

exports = module.exports = (content) ->
  dom = eval content
    
  root = {
    type : 'root'
    name : 'root'
    parent : null
    prev : null
    next : null
    children : []
  }
  
  root.children = connect dom, root

  return root

eval = exports.eval = (content) ->
  handler = new htmlparser.DefaultHandler()
  parser = new htmlparser.Parser handler
  
  parser.includeLocation = false
  parser.parseComplete content
  
  return handler.dom

isTag = (type) ->
  if type is 'tag' or type is 'script' or type is 'style'
    return true
  else
    return false
  
connect = exports.connect = (dom, parent = null) ->
  prevIndex = -1
  lastElem = null

  for elem, i in dom
    # If tag and no attributes, add empty object
    if isTag(dom[i].type) and dom[i].attribs is undefined
      dom[i].attribs = {}
      
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
      connect dom[i].children, dom[i]
    # Otherwise instantiate it if its a tag
    else if isTag(dom[i].type)
      dom[i].children = []
    
    # Get ready for next elem
    prevIndex = i
    lastElem = dom[i]
    
      
  return dom

module.exports = exports
