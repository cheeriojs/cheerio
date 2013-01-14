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
