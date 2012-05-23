var iterate = require('CSSselect').iterate;

var select = module.exports = function(selector, dom) {
  var len = dom.length;
  for(var i = 0; i < len; i++) {
    if(dom[i].type === 'root') dom = dom[i].children;
  }

  return iterate(selector, dom);
};