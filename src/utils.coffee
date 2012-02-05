booleanAttributes = 
  checked  : true
  selected : true
  disabled : true
  readonly : true
  multiple : true
  ismap    : true
  defer    : true
  declare  : true
  noresize : true
  nowrap   : true
  noshade  : true
  compact  : true

tags = { tag : 1, script : 1, style : 1 };

isTag = exports.isTag = (type) ->
  if(type.type) 
    type = type.type;
    
  return if (tags[type]) then true else false;

formatAttributes = exports.formatAttributes = (attributes) ->
  if !attributes
    return ""

  output = []
  for key, value of attributes
    if key is value and (booleanAttributes[key] or key is '/') # TODO: '/' should not be an attribute, but the current implementation let's it slip in
      output.push key
    else
      output.push key + ' = "' + value + '"';

  output.join " "

module.exports = exports

String::repeat = (times) ->
  return new Array( times + 1).join( this );

print = exports.print = (dom, attr = null, depth = 0, out = []) ->
  for elem in dom
    type = elem.type
    if type is "tag" or type is "script" or type is "style" then continue

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
