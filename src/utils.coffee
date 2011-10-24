formatAttributes = exports.formatAttributes = (attributes) ->
  if !attributes 
    return ""
    
  output = []
  for key, value of attributes
    if key is value
      output.push key
    else
      output.push key + ' = "' + value + '"';

  output.join " "
  
module.exports = exports

String::repeat = (times) ->
  return new Array( times + 1).join( this );
  
print = exports.print = (dom, attr = null, depth = 0, out = []) ->
  for elem in dom
    if elem.type isnt "tag" then continue

    str = '–'.repeat depth
    if depth > 0
      str += str + " " + elem.name
    else
      str += elem.name
      
    if attr
      attrs = attr.split "."
      val = elem
      passback = true
      for prop in attrs
        val = val[prop]
        if not val
          passback = false
          break
          
      if passback
        str += "   ( "+ attr + " : " + val + " )"
        
    out.push str 
    
    if elem.children
      print elem.children, attr, depth+1, out
      
  return out.join "\n" 
  
print_r = exports.print_r = (arr, attr = "name") ->
  out = "[ "
  
  attributes = arr.map (elem) ->
    return elem[attr]
  out += attributes.join ", "
  out += " ]"
  return out