_ = require "underscore"

utils = require "./utils"

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
    
    switch elem.type
    
      when "directive", "tag", "script", "link", "template"
        output.push renderTag elem
      
      when "text"
        output.push renderText elem

    if elem.children
      output.push render elem.children

      if elem.type in types
        output.push "</" + elem.name + ">"

  return output.join ""
  
renderTag = (elem) ->
  tag = "<" + elem.name
  
  if(elem.attribs)
    tag += " " + utils.formatAttributes elem.attribs
  
  tag += ">"
  
  return tag
    

renderText = (elem) ->
  return elem.raw


module.exports = exports

