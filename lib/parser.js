(function() {
  var createTree, eval, fs, htmlparser, parse, splice;
  htmlparser = require("htmlparser2");
  fs = require("fs");
  splice = [].splice;
  eval = exports.eval = function(content) {
    var handler, parser;
    handler = new htmlparser.DefaultHandler();
    parser = new htmlparser.Parser(handler);
    parser.includeLocation = false;
    parser.parseComplete(content);
    return handler.dom;
  };
  parse = exports.parse = function(content) {
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
    root.children = createTree(dom, root);
    return root;
  };
  createTree = exports.createTree = function(dom, parent) {
    var elem, i, lastElem, prev, prevIndex, _len;
    if (parent == null) {
      parent = null;
    }
    prevIndex = -1;
    lastElem = null;
    for (i = 0, _len = dom.length; i < _len; i++) {
      elem = dom[i];
      dom[i].parent = parent;
      prev = dom[prevIndex];
      if (prev) {
        dom[i].prev = prev;
      } else {
        dom[i].prev = null;
      }
      dom[i].next = null;
      if (lastElem) {
        lastElem.next = dom[i];
      }
      if (dom[i].children) {
        createTree(dom[i].children, dom[i]);
      }
      prevIndex = i;
      lastElem = dom[i];
    }
    return dom;
  };
  module.exports = exports;
}).call(this);
