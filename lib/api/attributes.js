var _ = require('underscore'),
  utils = require('../utils'),
  isTag = utils.isTag,
  decode = utils.decode,
  encode = utils.encode,
  hasOwn = Object.prototype.hasOwnProperty,
  rspace = /\s+/,

  // Lookup table for coercing string data-* attributes to their corresponding
  // JavaScript primitives
  primitives = {
    null: null,
    true: true,
    false: false
  },

  // Attributes that are booleans
  rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
  // Matches strings that look like JSON objects or arrays
  rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;


var setAttr = function(el, name, value) {
  if (typeof name === 'object') return _.extend(el.attribs, name);

  if (value === null) {
    removeAttribute(el, name);
  } else {
    el.attribs[name] = encode(value);
  }

  return el.attribs;
};

var attr = exports.attr = function(name, value) {
  // Set the value (with attr map support)
  if (typeof name === 'object' || value !== undefined) {
    if (_.isFunction(value)) {
      return this.each(function(i, el) {
        setAttr(el, name, value.call(this, i, el.attribs[name]));
      });
    }
    return this.each(function(i, el) {
      el.attribs = setAttr(el, name, value);
    });
  }

  var elem = this[0];

  if (!elem || !isTag(elem)) return;

  if (!elem.attribs) {
    elem.attribs = {};
  }

  // Return the entire attribs object if no attribute specified
  if (!name) {
    for (var a in elem.attribs) {
      elem.attribs[a] = decode(elem.attribs[a]);
    }
    return elem.attribs;
  }

  if (hasOwn.call(elem.attribs, name)) {
    // Get the (decoded) attribute
    return decode(elem.attribs[name]);
  }
};

var setData = function(el, name, value) {
  if (typeof name === 'object') return _.extend(el.data, name);
  if (typeof name === 'string' && value !== undefined) {
    el.data[name] = encode(value);
  } else if (typeof name === 'object') {
    // If its an object, loop through it
    _.each(name, function(value, key) {
      el.data[key] = encode(value);
    });
  }

  return el.data;
};

var data = exports.data = function(name, value) {
  var elem = this[0];

  if (!elem || !isTag(elem)) return;

  if (!elem.data) {
    elem.data = {};
  }

  // Return the entire data object if no data specified
  if (!name) {

    _.each(elem.data, function(value, key) {
      elem.data[key] = decode(value);
    });

    return elem.data;
  }

  // Set the value (with attr map support)
  if (typeof name === 'object' || value !== undefined) {
    this.each(function(i, el) {
      el.data = setData(el, name, value);
    });
    return this;
  } else if (hasOwn.call(elem.data, name)) {
    // Get the (decoded) data
    var val = decode(elem.data[name]);

    if (hasOwn.call(primitives, val)) {
      val = primitives[val];
    } else if (val === String(Number(val))) {
      val = Number(val);
    } else if (rbrace.test(val)) {
      val = JSON.parse(val);
    }

    return val;
  } else if (typeof name === 'string' && value === undefined) {
    return undefined;
  }

  return this;
};

/**
 * Get the value of an element
 */

var val = exports.val = function(value) {
  var querying = arguments.length === 0,
      element = this[0];

  if(!element) return;

  switch (element.name) {
    case 'textarea':
      return querying ? this.text() : this.each(function() {
        this.text(value);
      });
    case 'input':
      switch (this.attr('type')) {
        case 'radio':
          var queryString = 'input[type=radio][name=' + this.attr('name') + ']:checked';
          var parentEl, root;

          // Go up until we hit a form or root
          parentEl = this.closest('form');
          if (parentEl.length === 0) {
            root = (this.parents().last()[0] || this[0]).parent;
            parentEl = this.make(root);
          }

          if (querying) {
            return parentEl.find(queryString).attr('value');
          } else {
            parentEl.find(':checked').removeAttr('checked');
            parentEl.find('input[type=radio][value="' + value + '"]').attr('checked', '');
            return this;
          }
          break;
        default:
          return querying ? this.attr('value') : this.each(function() {
            this.attr('value', value);
          });
      }
      return;
    case 'select':
      var option = this.find('option:selected'),
          returnValue;
      if (option === undefined) return undefined;
      if (!querying) {
        if (!this.attr().hasOwnProperty('multiple') && typeof value == 'object') {
          return this;
        }
        if (typeof value != 'object') {
          value = [value];
        }
        this.find('option').removeAttr('selected');
        for (var i = 0; i < value.length; i++) {
          this.find('option[value="' + value[i] + '"]').attr('selected', '');
        }
        return this;
      }
      returnValue = option.attr('value');
      if (this.attr().hasOwnProperty('multiple')) {
        returnValue = [];
        option.each(function() {
          returnValue.push(this.attr('value'));
        });
      }
      return returnValue;
    case 'option':
      if (!querying) {
        this.attr('value', value);
        return this;
      }
      return this.attr('value');
  }
};

/**
 * Remove an attribute
 */

var removeAttribute = function(elem, name) {
  if (!isTag(elem.type) || !elem.attribs || !Object.hasOwnProperty.call(elem.attribs, name))
    return;

  if (rboolean.test(elem.attribs[name]))
    elem.attribs[name] = false;
  else
    delete elem.attribs[name];
};


var removeAttr = exports.removeAttr = function(name) {
  this.each(function(i, elem) {
    removeAttribute(elem, name);
  });

  return this;
};

var hasClass = exports.hasClass = function(className) {
  return _.any(this, function(elem) {
    var attrs = elem.attribs;
    return attrs && _.contains((attrs['class'] || '').split(rspace), className);
  });
};

var addClass = exports.addClass = function(value) {
  // Support functions
  if (_.isFunction(value)) {
    this.each(function(i) {
      var className = this.attr('class') || '';
      this.addClass(value.call(this[0], i, className));
    });
  }

  // Return if no value or not a string or function
  if (!value || !_.isString(value)) return this;

  var classNames = value.split(rspace),
      numElements = this.length,
      numClasses,
      setClass,
      $elem;


  for (var i = 0; i < numElements; i++) {
    $elem = this.make(this[i]);
    // If selected element isnt a tag, move on
    if (!isTag(this[i])) continue;

    // If we don't already have classes
    if (!$elem.attr('class')) {
      $elem.attr('class', classNames.join(' ').trim());
    } else {
      setClass = ' ' + $elem.attr('class') + ' ';
      numClasses = classNames.length;

      // Check if class already exists
      for (var j = 0; j < numClasses; j++) {
        if (!~setClass.indexOf(' ' + classNames[j] + ' '))
          setClass += classNames[j] + ' ';
      }

      $elem.attr('class', setClass.trim());
    }
  }

  return this;
};

var removeClass = exports.removeClass = function(value) {
  var split = function(className) {
    return className ? className.trim().split(rspace) : [];
  };
  var classes, removeAll;

  // Handle if value is a function
  if (_.isFunction(value)) {
    return this.each(function(i, el) {
      this.removeClass(value.call(this[0], i, el.attribs['class'] || ''));
    });
  }

  classes = split(value);
  removeAll = arguments.length === 0;

  return this.each(function(i, el) {
    if (!isTag(el)) return;
    el.attribs.class = removeAll ?
      '' :
      _.difference(split(el.attribs.class), classes).join(' ');
  });
};

var toggleClass = exports.toggleClass = function(value, stateVal) {
  // Support functions
  if (_.isFunction(value)) {
    return this.each(function(i, el) {
      this.toggleClass(value.call(this, i, el.attribs['class'] || '', stateVal), stateVal);
    });
  }

  // Return if no value or not a string or function
  if (!value || !_.isString(value)) return this;

  var classNames = value.split(rspace),
    numClasses = classNames.length,
    isBool = typeof stateVal === 'boolean',
    numElements = this.length,
    $elem,
    state;

  for (var i = 0; i < numElements; i++) {
    $elem = this.make(this[i]);
    // If selected element isnt a tag, move on
    if (!isTag(this[i])) continue;

    // Check if class already exists
    for (var j = 0; j < numClasses; j++) {
      // check each className given, space separated list
      state = isBool ? stateVal : !$elem.hasClass(classNames[j]);
      $elem[state ? 'addClass' : 'removeClass'](classNames[j]);
    }
  }

  return this;
};

var is = exports.is = function (selector) {
  if (selector) {
    return this.filter(selector).length > 0;
  }
  return false;
};

