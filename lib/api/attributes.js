var _ = require('underscore'),
    $ = require('../cheerio'),
    rclass = /[\n\t\r]/g,
    rspace = /\s+/;

var attr = exports.attr = function(name, value) {
  return $.access(this, name, value, true, $.attr);
};

var val = exports.val = function(value) {
  var element = this;
  if (!_.isUndefined(this.length) && this.length)
    element = this[0];
  switch (element.name) {
    case 'textarea':
      return this.text(value);
    case 'input':
			switch (this.attr('type')) {
				case 'radio':
					if (typeof value == 'undefined')
						return this.find(':checked').attr('value');
					this.find(':checked').removeAttr('checked');
					this.find('*[value="' + value + '"]').attr('checked', '');
					return this;
				case 'checkbox':
					//@todo wwjd (what would jquery do)
					if (this.attr().hasOwnProperty('checked'))
						return this.attr('value');
					return null;
				case 'text':
				default:
      		return this.attr('value', value);
			}
		case 'select':
			var option = this.find('option:selected');
			var returnValue;
			if (typeof option == 'undefined')
				return undefined;
			if (typeof value != 'undefined') {
				if (!this.attr().hasOwnProperty('multiple') && typeof value == 'object')
					return this;
				if (typeof value != 'object')
					value = [value];
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
					returnValue.push($(this).attr('value'));
				});
			}
			return returnValue;
  }
  return undefined;
}

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
    return className.trim().split(/\s+/);
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

module.exports = $.fn.extend(exports);
