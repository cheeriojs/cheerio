_ = require "underscore"

utils = require "./utils"

render = exports.render = (dom, output = []) ->
  if !_.isArray(dom)
    dom = [dom]
    
  types = ["directive", "tag", "script", "link"]

  for elem in dom
    str = elem.name
    
    switch elem.type
    
      when "directive", "tag", "script", "link"
        output.push renderTag elem
      
      when "text"
        output.push renderText elem
    #     
    # 
    # 
    # if elem.type in types
    #   output.push "<" + str + " " + utils.formatAttributes(elem.attribs) + ">"
    # else
    #   output.push str

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

