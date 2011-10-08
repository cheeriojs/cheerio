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