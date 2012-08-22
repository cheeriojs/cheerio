var _ = require('underscore'),
    utils = require('../utils'),
    isTag = utils.isTag,
    decode = utils.decode,
    encode = utils.encode,
    rclass = /[\n\t\r]/g,
    rspace = /\s+/;


function attr(elem, name, value) {
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

    return this;
  } else if(elem.attribs[name]) {
    // Get the (decoded) attribute
    return decode(elem.attribs[name]);
  }
}

exports.attr = function(name, value) {
  var len = this.length;

  for(var i = 0; i < len; i++) {
    // TODO: Need to figure out when to return `this`
    // and when to loop Through
    attr.call(this, this[i], name, value);
  }

};

var removeAttr = exports.removeAttr = function(name) {
  this.each(function() {
    $.removeAttr(this, name);
  });

  return this;
};

var hasClass = exports.hasClass = function(className) {
  return _.any(this, function(elem) {
    var attrs = elem.attribs;
    return attrs && _.contains((attrs['class'] || '').split(/\s+/), className);
  });
};

var addClass = exports.addClass = function(value) {
  // Support functions
  if (_.isFunction(value)) {
    this.each(function(i) {
      var $this = $(this),
          className = $this.attr('class') || '';

      $this.addClass(value.call(this, i, className));
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
    $elem = $(this[i]);
    // If selected element isnt a tag, move on
    if (!$.isTag(this[i])) continue;

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
    return !className ? [] : className.trim().split(/\s+/);
  };

  // Handle if value is a function
  if (_.isFunction(value)) {
    return this.each(function(idx) {
      $this.removeClass(value.call(this, idx, $(this).attr('class') || ''));
    });
  }

  return this.each(function() {
    if ($.isTag(this)) {
      // If `value` is "" or undefined, set the class attribute to "".
      // Otherwise, split the class name into an array of class names,
      // discard occurrences of `value`, and join the remaining class
      // names to produce the updated attribute value.
      this.attribs['class'] = !value ? '' : _.reject(
        split(this.attribs['class']),
        function(name) { return _.contains(split(value), name); }
      ).join(' ');
    }
  });
};
