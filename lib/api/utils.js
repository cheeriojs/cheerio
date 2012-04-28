(function() {
  var $, access, attr, class2type, dom, each, map, html, inArray, indexOf, isArray, isTag, load, makeArray, merge, parse, push, rboolean, removeAttr, render, tags, text, toString, type, updateDOM, _;

  _ = require("underscore");

  $ = require("../cheerio");

  parse = require("../parse");

  render = require("../render");

  class2type = {};

  _.each("Boolean Number String Function Array Date Regex Object".split(" "), function(name, i) {
    return class2type["[object " + name + "]"] = name.toLowerCase();
  });

  /*
  Node Types
    directive : 10
    comment : 8
    script : 1
    style : 1
    text : 3
    tag : 1
  */

  rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;

  toString = Object.prototype.toString;

  push = Array.prototype.push;

  indexOf = Array.prototype.indexOf;

  tags = {
    'tag': 1,
    'script': 1,
    'style': 1
  };

  isTag = exports.isTag = function(type) {
    if (type.type) type = type.type;
    if (tags[type]) {
      return true;
    } else {
      return false;
    }
  };

  updateDOM = exports.updateDOM = function(arr, parent) {
    var elem, i, _len;
    arr = $(arr).get();
    for (i = 0, _len = arr.length; i < _len; i++) {
      elem = arr[i];
      arr[i].prev = arr[i - 1] || null;
      arr[i].next = arr[i + 1] || null;
      arr[i].parent = parent || null;
    }
    if (!parent.children) parent.children = [];
    parent.children = arr;
    return parent;
  };

  type = exports.type = function(obj) {
    if (obj === null) {
      return String(obj);
    } else {
      return class2type[toString.call(obj)] || "object";
    }
  };

  isArray = exports.isArray = function(array) {
    return _(this).isArray();
  };

  merge = exports.merge = function(first, second) {
    var i, j, l;
    i = first.length;
    j = 0;
    if (typeof second.length === "number") {
      l = second.length;
      while (j < l) {
        first[i++] = second[j];
        j++;
      }
    } else {
      while (second[j] !== void 0) {
        first[i++] = second[j++];
      }
    }
    first.length = i;
    return first;
  };

  makeArray = exports.makeArray = function(array, results) {
    var ret;
    ret = results || [];
    if (array) {
      type = $.type(array);
      if (!(array.length != null) || type === "string" || type === "function" || type === "regexp") {
        push.call(ret, array);
      } else {
        $.merge(ret, array);
      }
    }
    return ret;
  };

  inArray = exports.inArray = function(elem, array) {
    if (!array) return -1;
    return indexOf.call(array, elem);
  };

  each = exports.each = function(object, callback, args) {
    var i, isObj, length, name;
    length = object.length;
    i = 0;
    isObj = length === void 0 || _.isFunction(object);
    if (args) {
      if (isObj) {
        for (name in object) {
          if (callback.apply(object[name], args) === false) break;
        }
      } else {
        while (i < length) {
          if (callback.apply(object[i++], args) === false) break;
        }
      }
    } else {
      if (isObj) {
        for (name in object) {
          if (callback.call(object[name], name, object[name]) === false) break;
        }
      } else {
        while (i < length) {
          if (callback.call(object[i], i, object[i++]) === false) break;
        }
      }
    }
    return object;
  };

  map = exports.map = function(object, callback, args) {
    var result = [];
    object.each(function(i, item){
      result.push( callback(i,item) );
    }) ;

    return result;
  };

  access = exports.access = function(elems, key, value, exec, fn, pass) {
    var i, k, length;
    length = elems.length;
    if (typeof key === "object") {
      for (k in key) {
        access(elems, k, key[k], exec, fn, value);
      }
      return elems;
    }
    if (value !== void 0) {
      exec = !pass && exec && _.isFunction(value);
      i = 0;
      while (i < length) {
        fn(elems[i], key, (exec ? value.call(elems[i], i, fn(elems[i], key)) : value), pass);
        i++;
      }
      return elems;
    }
    return (length ? fn(elems[0], key) : void 0);
  };

  attr = exports.attr = function(elem, name, value, pass) {
    type = elem.type;
    if (!elem || !$.isTag(elem)) return;
    if (!elem.attribs) elem.attribs = {};
    if (!name) return elem.attribs;
    if (value !== void 0) {
      if (value === null) {
        return $.removeAttr(elem, name);
      } else {
        return elem.attribs[name] = "" + value;
      }
    } else {
      return elem.attribs[name];
    }
  };

  removeAttr = exports.removeAttr = function(elem, name) {
    if (isTag(elem.type) && elem.attribs) {
      if (elem.attribs[name]) {
        if (rboolean.test(elem.attribs[name])) {
          return elem.attribs[name] = false;
        } else {
          return delete elem.attribs[name];
        }
      }
    }
  };

  text = exports.text = function(elems) {
    var elem, ret, _i, _len;
    ret = "";
    if (!elems) return ret;
    for (_i = 0, _len = elems.length; _i < _len; _i++) {
      elem = elems[_i];
      if (elem.type === "text") {
        ret += elem.data;
      } else if (elem.children && elem.type !== "comment") {
        ret += text(elem.children);
      }
    }
    return ret;
  };

  load = exports.load = function(html) {
    var fn, root;
    root = parse(html);
    $.extend({
      'root': root
    });
    fn = function(selector, context, r) {
      if (r) root = parse(r);
      return $(selector, context, root);
    };
    return _(fn).extend($);
  };

  html = exports.html = function(dom) {
    if (dom !== void 0 && dom.type) {
      return render(dom);
    } else if (this.root && this.root.children) {
      return render(this.root.children);
    } else {
      return "";
    }
  };

  dom = exports.dom = function(dom) {
    if (dom !== void 0) {
      if (dom.type) return dom;
    } else if (this.root && this.root.children) {
      return this.root.children;
    } else {
      return "";
    }
  };

  module.exports = $.extend(exports);

}).call(this);
