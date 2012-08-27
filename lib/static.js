/**
 * Module dependencies
 */

var render = require('./render').render,
    decode = require('./utils').decode;

/*
 * $.html([selector | dom])
 */
var html = exports.html = function(dom) {
  if (dom) {
    dom = (typeof dom === 'string') ? this.make(dom) : dom;
    return render(dom);
  } else if (this.root && this.root.children) {
    return render(this.root.children);
  } else {
    return '';
  }
};

/*
 * $.text(dom)
 */
var text = exports.text = function(elems) {
  if (!elems) return '';

  var ret = '',
      len = elems.length,
      elem;

  for (var i = 0; i < len; i ++) {
    elem = elems[i];
    if (elem.type === 'text') ret += decode(elem.data);
    else if (elem.children && elem.type !== 'comment') {
      ret += text(elem.children);
    }
  }

  return ret;
};
