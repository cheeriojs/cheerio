(function() {
  var $, after, append, before, empty, html, parse, prepend, remove, removeChild, replaceWith, text, _;
  var __slice = Array.prototype.slice;

  _ = require('underscore');

  $ = require('../cheerio');

  parse = require('../parse');

  removeChild = function(parent, elem) {
    return $.each(parent.children, function(i, child) {
      if (elem === child) return parent.children.splice(i, 1);
    });
  };

  append = exports.append = function() {
    var dom, elem, elems, _i, _len;
    elems = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    dom = [];
    for (_i = 0, _len = elems.length; _i < _len; _i++) {
      elem = elems[_i];
      if (elem.cheerio) {
        dom = dom.concat(elem.toArray());
      } else {
        dom = dom.concat(parse.eval(elem));
      }
    }
    this.each(function() {
      if (_.isFunction(elems[0])) {} else {
        if (!this.children) this.children = [];
        this.children = this.children.concat(dom);
        return $.updateDOM(this.children, this);
      }
    });
    return this;
  };

  prepend = exports.prepend = function() {
    var dom, elem, elems, _i, _len;
    elems = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    dom = [];
    for (_i = 0, _len = elems.length; _i < _len; _i++) {
      elem = elems[_i];
      if (elem.cheerio) {
        dom = dom.concat(elem.toArray());
      } else {
        dom = dom.concat(parse.eval(elem));
      }
    }
    this.each(function() {
      if (_.isFunction(elems[0])) {} else {
        if (!this.children) this.children = [];
        this.children = dom.concat(this.children);
        return $.updateDOM(this.children, this);
      }
    });
    return this;
  };

  after = exports.after = function() {
    var dom, elem, elems, _i, _len;
    elems = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    dom = [];
    for (_i = 0, _len = elems.length; _i < _len; _i++) {
      elem = elems[_i];
      if (elem.cheerio) {
        dom = dom.concat(elem.toArray());
      } else {
        dom = dom.concat(parse.eval(elem));
      }
    }
    this.each(function() {
      var index, siblings;
      siblings = this.parent.children;
      index = siblings.indexOf(this);
      if (index >= 0) siblings.splice.apply(siblings, [index + 1, 0].concat(dom));
      $.updateDOM(siblings, this.parent);
      return this.parent.children = siblings;
    });
    return this;
  };

  before = exports.before = function() {
    var dom, elem, elems, _i, _len;
    elems = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    dom = [];
    for (_i = 0, _len = elems.length; _i < _len; _i++) {
      elem = elems[_i];
      if (elem.cheerio) {
        dom = dom.concat(elem.toArray());
      } else {
        dom = dom.concat(parse.eval(elem));
      }
    }
    this.each(function() {
      var index, siblings;
      siblings = this.parent.children;
      index = siblings.indexOf(this);
      if (index >= 0) siblings.splice.apply(siblings, [index, 0].concat(dom));
      $.updateDOM(siblings, this.parent);
      return this.parent.children = siblings;
    });
    return this;
  };

  remove = exports.remove = function(selector) {
    var elems;
    elems = this;
    if (selector) elems = this.find(selector);
    elems.each(function() {
      var index, siblings;
      siblings = this.parent.children;
      index = siblings.indexOf(this);
      siblings.splice(index, 1);
      $.updateDOM(siblings, this.parent);
      return this.parent.children = siblings;
    });
    return this;
  };

  replaceWith = exports.replaceWith = function(content) {
    var elems;
    elems = parse.eval(content);
    return this.each(function() {
      var index, siblings;
      siblings = this.parent.children;
      index = siblings.indexOf(this);
      siblings.splice.apply(siblings, [index, 1].concat(elems));
      $.updateDOM(siblings, this.parent);
      return this.parent.children = siblings;
    });
  };

  empty = exports.empty = function() {
    return this.each(function() {
      return this.children = [];
    });
  };

  html = exports.html = function(htmlString) {
    var htmlElement;
    if (typeof htmlString !== "object" && htmlString !== void 0) {
      htmlElement = parse.eval(htmlString);
      this.each(function(i) {
        return this.children = htmlElement;
      });
      return this;
    } else {
      return $.html(this[0]);
    }
  };

  text = exports.text = function(textString) {
    var textElement;
    if (_.isFunction(textString)) {
      this.each(function(i) {
        var self;
        self = $(this);
        return self.text(textString.call(this, i, self.text()));
      });
    }
    if (typeof textString !== "object" && textString !== void 0) {
      textElement = {
        raw: textString,
        data: textString,
        type: "text",
        parent: null,
        prev: null,
        next: null,
        children: []
      };
      this.each(function(i) {
        this.children = textElement;
        return $.updateDOM(this.children, this);
      });
      return this;
    } else {
      return $.text(this);
    }
  };

  module.exports = $.fn.extend(exports);

}).call(this);
