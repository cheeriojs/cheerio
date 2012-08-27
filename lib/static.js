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
  } else if (this.root && this.root.children) {
    return render(this.root.children);
  } else {
    return '';
  }
};
