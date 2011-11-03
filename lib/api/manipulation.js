(function() {
  var $, after, append, before, dom, empty, html, parser, prepend, remove, removeChild, text, updateArray, _;
  var __slice = Array.prototype.slice;
  _ = require('underscore');
  $ = require('../cheerio');
  parser = require('../parser');
  removeChild = function(parent, elem) {
    return $.each(parent.children, function(i, child) {
      if (elem === child) {
        return parent.children.splice(i, 1);
      }
    });
  };
  append = exports.append = function() {
    var dom, elem, elems, _i, _len;
    elems = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    dom = [];
    for (_i = 0, _len = elems.length; _i < _len; _i++) {
      elem = elems[_i];
      dom.push($(elem).dom());
    }
    this.each(function() {
      if (_.isFunction(elems[0])) {} else {
        if (!this.children) {
          this.children = [];
        }
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
      dom.push($(elem).dom());
    }
    this.each(function() {
      if (_.isFunction(elems[0])) {} else {
        if (!this.children) {
          this.children = [];
        }
        this.children = dom.concat(this.children);
        return $.updateDOM(this.children, this);
      }
    });
    return this;
  };
  updateArray = function(arr) {
    arr.forEach(function(elem, i) {
      arr[i].prev = arr[i - 1] || null;
      return arr[i].next = arr[i + 1] || null;
    });
    return arr;
  };
  after = exports.after = function() {
    var doms, elem, elems, _i, _len;
    elems = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    doms = [];
    for (_i = 0, _len = elems.length; _i < _len; _i++) {
      elem = elems[_i];
      doms.push($(elem).dom());
    }
    this.each(function() {
      var parentsChildren, pos;
      parentsChildren = this.parent.children;
      pos = $.inArray(this, parentsChildren);
      if (pos >= 0) {
        parentsChildren.splice.apply(parentsChildren, [pos + 1, 0].concat(doms));
      }
      return $.updateDOM(parentsChildren, this.parent);
    });
    return this;
  };
  before = exports.before = function() {
    var doms, elem, elems, _i, _len;
    elems = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    doms = [];
    for (_i = 0, _len = elems.length; _i < _len; _i++) {
      elem = elems[_i];
      doms.push($(elem).dom());
    }
    this.each(function() {
      var parentsChildren, pos;
      parentsChildren = this.parent.children;
      pos = $.inArray(this, parentsChildren);
      if (pos >= 0) {
        parentsChildren.splice.apply(parentsChildren, [pos, 0].concat(doms));
      }
      return $.updateDOM(parentsChildren, this.parent);
    });
    return this;
  };
  remove = exports.remove = function(selector) {
    var elems;
    elems = this;
    if (selector) {
      elems = this.find(selector);
    }
    elems.each(function() {
      if (this.parent) {
        removeChild(this.parent, this);
        return delete this['parent'];
      }
    });
    return this;
  };
  empty = exports.empty = function() {
    return this.each(function() {
      return this.children = [];
    });
  };
  dom = exports.dom = function(domObject) {
    if (domObject === void 0) {
      if (this[0] && this[0].type === "tag") {
        return $.dom(this[0]);
      }
    }
  };
  html = exports.html = function(htmlString) {
    var htmlElement;
    if (typeof htmlString !== "object" && htmlString !== void 0) {
      htmlElement = parser.parse(htmlString);
      return this.each(function(i) {
        if (this.children) {
          this.children = htmlElement;
        }
        return this;
      });
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
      textElement = parser.parse(textString);
      this.each(function(i) {
        if (this.children) {
          return this.children = textElement;
        }
      });
      return this;
    } else {
      return $.text(this);
    }
  };
  module.exports = $.fn.extend(exports);
}).call(this);
