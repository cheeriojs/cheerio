var _ = require('underscore'),
    utils = require('../utils'),
    isTag = utils.isTag,
    decode = utils.decode,
    encode = utils.encode,
    rspace = /\s+/,

    // Attributes that are booleans
    rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;


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

  // Set the value (with attr map support)
  if (typeof name === 'object' || value !== undefined) {
    this.each(function(i, el) {
      el.attribs = setAttr(el, name, value);
    });
    return this;
  } else if (Object.hasOwnProperty.call(elem.attribs, name)) {
    // Get the (decoded) attribute
    return decode(elem.attribs[name]);
  }
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
          var parentEl = this;

          //Go up until we hit a form or root
          while(parentEl[0].name != 'form' && parentEl[0].name != 'root') parentEl = parentEl.parent();

          if (querying) {
            return parentEl.find(queryString).attr('value');
          } else {
            parentEl.find(':checked').removeAttr('checked');
            parentEl.find('input[type=radio][value="' + value + '"]').attr('checked', '');
            return this;
          }
          break;
        case 'checkbox':
          //@todo wwjd (what would jquery do)
          if (this.attr().hasOwnProperty('checked')) {
            return this.attr('value');
          }
          return null;
        default:
          return querying ? this.attr('value') : this.each(function() {
            this.attr('value', value);
          });
    }
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
      this.addClass(value.call(this, i, className));
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

  var classes = split(value);

  // Handle if value is a function
  if (_.isFunction(value)) {
    return this.each(function(i, el) {
      this.removeClass(value.call(this, i, el.attribs['class'] || ''));
    });
  }

  return this.each(function(i, el) {
    if (!isTag(el)) return;
    el.attribs['class'] = (!value) ? '' : _.reject(
      split(el.attribs['class']),
      function(name) { return _.contains(classes, name); }
    ).join(' ');
  });
};
