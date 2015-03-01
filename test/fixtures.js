/* jshint indent: false */
exports.fruits = [
  '<ul id="fruits">',
    '<li class="apple">Apple</li>',
    '<li class="orange">Orange</li>',
    '<li class="pear">Pear</li>',
  '</ul>'
].join('');

exports.vegetables = [
  '<ul id="vegetables">',
    '<li class="carrot">Carrot</li>',
    '<li class="sweetcorn">Sweetcorn</li>',
  '</ul>'
].join('');

exports.chocolates = [
  '<ul id="chocolates">',
    '<li class="linth" data-highlight="Lindor" data-origin="swiss">Linth</li>',
    '<li class="frey" data-taste="sweet" data-best-collection="Mahony">Frey</li>',
    '<li class="cailler">Cailler</li>',
  '</ul>'
].join('');

exports.drinks = [
  '<ul id="drinks">',
    '<li class="beer">Beer</li>',
    '<li class="juice">Juice</li>',
    '<li class="milk">Milk</li>',
    '<li class="water">Water</li>',
    '<li class="cider">Cider</li>',
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
  '<input type="radio" value="off" name="radio[brackets]" /><input type="radio" name="radio[brackets]" value="on" checked />',
  '<select id="multi" multiple><option value="1">1</option><option value="2" selected>2</option><option value="3" selected>3</option><option value="4">4</option></select>'
].join('');

exports.text = [
  '<p>Apples, <b>oranges</b> and pears.</p>',
  '<p>Carrots and <!-- sweetcorn --></p>'
].join('');

exports.forms = [
  '<form id="simple"><input type="text" name="fruit" value="Apple" /></form>',
  '<form id="nested"><div><input type="text" name="fruit" value="Apple" /></div><input type="text" name="vegetable" value="Carrot" /></form>',
  '<form id="disabled"><input type="text" name="fruit" value="Apple" disabled /></form>',
  '<form id="submit"><input type="text" name="fruit" value="Apple" /><input type="submit" name="submit" value="Submit" /></form>',
  '<form id="select"><select name="fruit"><option value="Apple">Apple</option><option value="Orange" selected>Orange</option></select></form>',
  '<form id="unnamed"><input type="text" name="fruit" value="Apple" /><input type="text" value="Carrot" /></form>',
  '<form id="multiple"><select name="fruit" multiple><option value="Apple" selected>Apple</option><option value="Orange" selected>Orange</option><option value="Carrot">Carrot</option></select></form>',
  '<form id="textarea"><textarea name="fruits">Apple\nOrange</textarea></form>'
].join('');
