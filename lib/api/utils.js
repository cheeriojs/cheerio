(function() {
  var $, access, attr, class2type, each, hasOwn, inArray, indexOf, isArray, makeArray, merge, push, rboolean, removeAttr, slice, text, toString, trim, type, updateDOM, _;
  _ = require("underscore");
  $ = require("../cheerio");
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
  hasOwn = Object.prototype.hasOwnProperty;
  push = Array.prototype.push;
  slice = Array.prototype.slice;
  trim = String.prototype.trim;
  indexOf = Array.prototype.indexOf;
  updateDOM = exports.updateDOM = function(arr, parent) {
    var elem, i, _len;
    for (i = 0, _len = arr.length; i < _len; i++) {
      elem = arr[i];
      arr[i].prev = arr[i - 1] || null;
      arr[i].next = arr[i + 1] || null;
      arr[i].parent = parent || null;
    }
    return arr;
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
    if (array != null) {
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
    if (!array) {
      return -1;
    }
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
          if (callback.apply(object[name], args) === false) {
            break;
          }
        }
      } else {
        while (i < length) {
          if (callback.apply(object[i++], args) === false) {
            break;
          }
        }
      }
    } else {
      if (isObj) {
        for (name in object) {
          if (callback.call(object[name], name, object[name]) === false) {
            break;
          }
        }
      } else {
        while (i < length) {
          if (callback.call(object[i], i, object[i++]) === false) {
            break;
          }
        }
      }
    }
    return object;
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
    if (length) {
      return fn(elems[0], key);
    } else {
      return;
    }
  };
  attr = exports.attr = function(elem, name, value, pass) {
    type = elem.type;
    if (!elem || elem.type !== "tag") {
      return;
    }
    if (!elem.attribs) {
      elem.attribs = {};
    }
    if (!name) {
      return elem.attribs;
    }
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
    if (elem.type === 'tag' && elem.attribs) {
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
  module.exports = $.extend(exports);
}).call(this);
