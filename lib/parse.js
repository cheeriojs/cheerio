(function() {
  var connect, eval, exports, htmlparser, isTag, parser;

  htmlparser = require("htmlparser2");

  /*
    parser
  */

  parser = exports = module.exports = function(content) {
    var dom, root;
    dom = eval(content);
    root = {
      type: 'root',
      name: 'root',
      parent: null,
      prev: null,
      next: null,
      children: []
    };
    root.children = connect(dom, root);
    return root;
  };

  eval = exports.eval = function(content) {
    var handler;
    handler = new htmlparser.DefaultHandler();
    parser = new htmlparser.Parser(handler);
    parser.includeLocation = false;
    parser.parseComplete(content);
    return handler.dom;
  };

  isTag = function(type) {
    if (type === 'tag' || type === 'script' || type === 'style') {
      return true;
    } else {
      return false;
    }
  };

  connect = exports.connect = function(dom, parent) {
    var elem, i, lastElem, prev, prevIndex, _len;
    if (parent == null) parent = null;
    prevIndex = -1;
    lastElem = null;
    for (i = 0, _len = dom.length; i < _len; i++) {
      elem = dom[i];
      if (isTag(dom[i].type) && dom[i].attribs === void 0) dom[i].attribs = {};
      dom[i].parent = parent;
      prev = dom[prevIndex];
      if (prev) {
        dom[i].prev = prev;
      } else {
        dom[i].prev = null;
      }
      dom[i].next = null;
      if (lastElem) lastElem.next = dom[i];
      if (dom[i].children) {
        connect(dom[i].children, dom[i]);
      } else if (isTag(dom[i].type)) {
        dom[i].children = [];
      }
      prevIndex = i;
      lastElem = dom[i];
    }
    return dom;
  };

  module.exports = exports;

}).call(this);
