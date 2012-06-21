var _ = require('underscore'),
    $ = require('../cheerio'),
    rclass = /[\n\t\r]/g,
    rspace = /\s+/;

var attr = exports.attr = function(name, value) {
  return $.access(this, name, value, true, $.attr);
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

  // Handle if value is a function
  if (_.isFunction(value)) {
    this.each(function(j) {
      var $this = $(this),
          className = $this.attr('class') || '';
      $this.removeClass(value.call(this, j, className));
    });
  }

  // If value isnt undefined and also not a string
  if (value !== undefined && !_.isString(value)) return this;

  var classNames = (value || '').split(rspace),
      numClasses = classNames.length,
      className,
      $elem,
      ret;

  for (var i = 0, iLen = this.length; i < iLen; i++) {
    $elem = $(this[i]);
    className = this[i].attribs['class'];

    if (!$.isTag(this[i]) || !className) continue;
    else if (!value) {
      this[i].attribs['class'] = '';
      continue;
    }

    // Separate out the classes
    ret = (' ' + className + ' ').replace(rclass, ' ');

    for (var j = 0; j < numClasses; j++) {
      className = classNames[j];
      ret = ret.replace(' ' + className + ' ', ' ');
    }

    this[i].attribs['class'] = ret.trim();
  }

  return this;
};

module.exports = $.fn.extend(exports);
