/*
  Module Dependencies
*/
var _ = require('underscore'),
    $ = require('../cheerio'),
    entities = require('entities');

var class2type = {},
    types = 'Boolean Number String Function Array Date Regex Object',
    rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
    toString = Object.prototype.toString,
    push = Array.prototype.push,
    indexOf = Array.prototype.indexOf,
    isArray = Array.isArray,
    tags = { tag : 1, script : 1, style : 1 };

/*
Node Types
  directive : 10
  comment : 8
  script : 1
  style : 1
  text : 3
  tag : 1
*/

// Fill in class2type
_.each(types.split(' '), function(name) {
  class2type['[object '+ name +']'] = name.toLowerCase();
});

/*
  Tags
*/
var tags = { tag : true, script : true, style : true };

// Expose encode and decode methods from FB55's node-entities library
// 0 = XML, 1 = HTML4 and 2 = HTML5
var encode = exports.encode = function(str) { return entities.encode(str, 0); };
var decode = exports.decode = function(str) { return entities.decode(str, 2); };

/*
  isTag(type) includes <script> and <style> tags
*/
var isTag = exports.isTag = function(type) {
  if (type.type) type = type.type;
  return tags[type] || false;
};


var type = exports.type = function(obj) {
  if (obj === null)
    return String(obj);
  else
    return class2type[toString.call(obj)] || 'object';
};

var merge = exports.merge = function(first, second) {
  var i = first.length,
      j = 0;

  if (typeof second.length === 'number') {
    for (var l = second.length; j < l; j++) {
      first[i++] = second[j];
    }

  } else {
    while (second[j] !== undefined) {
      first[i++] = second[j++];
    }
  }

  first.length = i;

  return first;
};

var makeArray = exports.makeArray = function(array, results) {
  var ret = results || [],
      type = $.type(array);

  if (!array) return ret;

  if (array.length == null || type === 'string' || type === 'function' || type === 'regexp') {
    push.call(ret, array);
  } else {
    merge(ret, array);
  }

  return ret;
};

var inArray = exports.inArray = function(elem, array, i) {
  var len;

  if (array) {
    if (indexOf) {
      return indexOf.call(array, elem, i);
    }

    len = array.length;
    i = i ? i < 0 ? Math.max(0, len + i) : i : 0;

    for (; i < len; i++) {
      // Skip accessing in sparse arrays
      if (i in array && array[i] === elem) {
        return i;
      }
    }
  }

  return -1;
};

// args is for internal usage only
var each = exports.each = function(object, callback, args) {
  var name, i = 0,
      length = object.length,
      isObj = length === undefined || _.isFunction(object);

  if (args) {
    if (isObj) {
      for (name in object) {
        if (callback.apply(object[name], args) === false) {
          break;
        }
      }
    } else {
      for (; i < length;) {
        if (callback.apply(object[i++], args) === false) {
          break;
        }
      }
    }

    // A special, fast, case for the most common use of each
  } else {
    if (isObj) {
      for (name in object) {
        if (callback.call(object[name], name, object[name]) === false) {
          break;
        }
      }
    } else {
      for (; i < length;) {
        if (callback.call(object[i], i, object[i++]) === false) {
          break;
        }
      }
    }
  }

  return object;
};

// Mutifunctional method to get and set values to a collection
// The value/s can optionally be executed if it's a function
var access = exports.access = function(elems, key, value, exec, fn, pass) {
  var length = elems.length;

  // Setting many attributes
  if (typeof key === 'object') {
    for (var k in key) {
      access(elems, k, key[k], exec, fn, value);
    }
    return elems;
  }

  // Setting one attribute
  if (value !== undefined) {
    // Optionally, function values get executed if exec is true
    exec = !pass && exec && _.isFunction(value);

    for (var i = 0; i < length; i++) {
      fn(elems[i], key, exec ? value.call(elems[i], i, fn(elems[i], key)) : value, pass);
    }

    return elems;
  }

  // Getting an attribute
  return length ? fn(elems[0], key) : undefined;
};

var attr = exports.attr = function(elem, name, value, pass) {
  var type = elem.type;

  if (!elem || !isTag(elem))
    return undefined;

  if (!elem.attribs) {
    elem.attribs = {};
  }

  // Return the entire attribs object if no attribute specified
  if (!name) {
    for(var a in elem.attribs) {
      elem.attribs[a] = decode(elem.attribs[a]);
    }
    return elem.attribs;
  }

  if (value !== undefined) {
    if (value === null) {
      // Remove the attribute
      $.removeAttr(elem, name);
    } else {
      // Set the attribute
      elem.attribs[name] = '' + encode(value);
    }
  } else if(elem.attribs[name]) {
    // Get the (decoded) attribute
    return decode(elem.attribs[name]);
  }
};

var removeAttr = exports.removeAttr = function(elem, name) {
  if (!isTag(elem.type) || !elem.attribs || !elem.attribs[name])
    return;

  if (rboolean.test(elem.attribs[name]))
    elem.attribs[name] = false;
  else
    delete elem.attribs[name];
};

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

var load = exports.load = function(html, options) {
  // Add in our the options, extending the defaults
  options = options || {};
  options = _.defaults(options, $.fn.options);

  var root = $.parse(html, options);

  function fn(selector, context, r) {
    // Overwrite our original root if we explicitly pass in a root
    if (r) root = $.parse(r, options);
    return $(selector, context, root);
  }

  // Add the root to cheerio
  $.extend({ '_root': root });

  return _(fn).extend($);
};

var html = exports.html = function(dom) {
  if (dom !== undefined) {
    return $.render(dom);
  } else if (this._root && this._root.children) {
    return $.render(this._root.children);
  } else {
    return '';
  }
};

// TODO: Add me to .html above
var tidy = exports.tidy = function(dom) {
  if (dom !== undefined) {
    return $.render(dom, { tidy : true });
  } else if (this._root && this._root.children) {
    return $.render(this._root.children, { tidy : true });
  } else {
    return '';
  }
};

var dom = exports.dom = function(dom) {
  if (dom && dom.type) {
    return dom;
  } else if (this._root && this._root.children) {
    return this._root.children;
  } else {
    return '';
  }
};

var root = exports.root = function() {
  return $(this._root);
};


module.exports = $.extend(exports);
