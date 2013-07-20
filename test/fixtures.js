exports.fruits = [
  '<ul id="fruits">',
    '<li class="apple">Apple</li>',
    '<li class="orange">Orange</li>',
    '<li class="pear">Pear</li>',
  '</ul>'
].join('');

exports.vegetables = [
  '<ul id="vegetables">',
    '<li>Carrot</li>',
    '<li>Sweetcorn</li>',
  '</ul>'
].join('');

exports.food = [
  '<ul id="food">',
    exports.fruits,
    exports.vegetables,
  '</ul>'
].join('');

exports.inputs = [
	'<select id="one"><option value="option_not_selected">Option not selected</option><option value="option_selected" selected>Option selected</option></select>',
	'<input type="text" value="input_text" />',
	'<input type="checkbox" name="checkbox_off" value="off" /><input type="checkbox" name="checkbox_on" value="on" checked />',
	'<input type="radio" value="off" name="radio" /><input type="radio" name="radio" value="on" checked />',
	'<select id="multi" multiple><option value="1">1</option><option value="2" selected>2</option><option value="3" selected>3</option><option value="4">4</option></select>'
].join('');

exports.forms = [
  '<form id="simple"><input type="text" name="fruit" value="Apple" /></form>',
  '<form id="nested"><div><input type="text" name="fruit" value="Apple" /></div><input type="text" name="vegetable" value="Carrot" /></form>',
  '<form id="disabled"><input type="text" name="fruit" value="Apple" disabled /></form>',
  '<form id="submit"><input type="text" name="fruit" value="Apple" /><input type="submit" name="submit" value="Submit" /></form>',
  '<form id="select"><select name="fruit"><option value="Apple">Apple</option><option value="Orange" selected>Orange</option></select></form>',
  '<form id="unnamed"><input type="text" name="fruit" value="Apple" /><input type="text" value="Carrot" /></form>'
].join('');
