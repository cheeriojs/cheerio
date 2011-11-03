(function() {
  var connectDOM, fs, htmlparser, parse;
  htmlparser = require("htmlparser");
  fs = require("fs");
  parse = exports.parse = function(content) {
    var dom, handler, parser;
    handler = new htmlparser.DefaultHandler();
    parser = new htmlparser.Parser(handler);
    parser.includeLocation = false;
    parser.parseComplete(content);
    dom = handler.dom;
    dom = connectDOM(dom);
    return dom;
  };
  connectDOM = function(dom, parent) {
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
        connectDOM(dom[i].children, dom[i]);
      }
      prevIndex = i;
      lastElem = dom[i];
    }
    return dom;
  };
  module.exports = exports;
}).call(this);
