_ = require "underscore"

utils = require "./utils"

# List from node-htmlparser (which I stole from jsdom ;-P)
singleTag = 
  area: 1
  base: 1
  basefont: 1
  br: 1
  col: 1
  frame: 1
  hr: 1
  img: 1
  input: 1
  isindex: 1
  link: 1
  meta: 1
  param: 1
  embed: 1

tagType = 
  directive : 1
  tag : 1
  script : 1
  link : 1
  template : 1

render = exports.render = (dom, output = []) ->
  if !_.isArray(dom)
    dom = [dom]
    
  types = ["directive", "tag", "script", "link"]

  for elem in dom
    str = elem.name
    # Used to remove elements
    if elem.raw is null 
      continue
    
    # A little hacky - allows ERB-like templates
    data = elem.data
    if data[0] is '%' and data[data.length-1] is '%'
      # Not in types so closing tag not rendered
      elem.type = "template"
    
    if tagType[elem.type]
      output.push renderTag elem
    else
      output.push renderText elem

    if elem.children
      output.push render elem.children
        
    if !singleTag[elem.name] and tagType[elem.type]
      output.push "</" + elem.name + ">"

  return output.join ""
  
renderTag = (elem) ->
  tag = "<" + elem.name

  if(elem.attribs)
    tag += " " + utils.formatAttributes elem.attribs

  if !singleTag[elem.name]
    tag += ">"
  else
    tag += "/>"
  
  return tag
    

renderText = (elem) ->
  return elem.raw


module.exports = exports

