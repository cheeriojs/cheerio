/**
 * Module dependencies
 */

var render = require('./render');

/*
 * $.html([selector | dom])
 */
exports.html = function(dom) {
  if (dom) {
    dom = (type(dom) === 'string') ? this(dom) : dom;
    return render(dom);
  } else if (this._root && this._root.children) {
    return render(this._root.children);
  } else {
    return '';
  }
};