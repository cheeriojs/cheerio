/**
 * Methods for getting and modifying attributes.
 *
 * @module cheerio/attributes
 */

var text = require('../static').text;
var utils = require('../utils');
var isTag = utils.isTag;
var domEach = utils.domEach;
var hasOwn = Object.prototype.hasOwnProperty;
var camelCase = utils.camelCase;
var cssCase = utils.cssCase;
var rspace = /\s+/;
var dataAttrPrefix = 'data-';
// Lookup table for coercing string data-* attributes to their corresponding
// JavaScript primitives
var primitives = {
  null: null,
  true: true,
  false: false,
};
// Attributes that are booleans
var rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;
// Matches strings that look like JSON objects or arrays
var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;

var getAttr = function (elem, name) {
  if (!elem || !isTag(elem)) return;

  if (!elem.attribs) {
    elem.attribs = {};
  }

  // Return the entire attribs object if no attribute specified
  if (!name) {
    return elem.attribs;
  }

  if (hasOwn.call(elem.attribs, name)) {
    // Get the (decoded) attribute
    return rboolean.test(name) ? name : elem.attribs[name];
  }

  // Mimic the DOM and return text content as value for `option's`
  if (elem.name === 'option' && name === 'value') {
    return text(elem.children);
  }

  // Mimic DOM with default value for radios/checkboxes
  if (
    elem.name === 'input' &&
    (elem.attribs.type === 'radio' || elem.attribs.type === 'checkbox') &&
    name === 'value'
  ) {
    return 'on';
  }
};

var setAttr = function (el, name, value) {
  if (value === null) {
    removeAttribute(el, name);
  } else {
    el.attribs[name] = value + '';
  }
};

/**
 * Method for getting and setting attributes. Gets the attribute value for only
 * the first element in the matched set. If you set an attribute's value to
 * `null`, you remove that attribute. You may also pass a `map` and `function`
 * like jQuery.
 *
 * @example
 *
 * $('ul').attr('id')
 * //=> fruits
 *
 * $('.apple').attr('id', 'favorite').html()
 * //=> <li class="apple" id="favorite">Apple</li>
 *
 * @param {string} name - Name of the attribute.
 * @param {string} [value] - If specified sets the value of the attribute.
 *
 * @see {@link http://api.jquery.com/attr/}
 */
exports.attr = function (name, value) {
  // Set the value (with attr map support)
  if (typeof name === 'object' || value !== undefined) {
    if (typeof value === 'function') {
      return domEach(this, function (i, el) {
        setAttr(el, name, value.call(el, i, el.attribs[name]));
      });
    }
    return domEach(this, function (i, el) {
      if (!isTag(el)) return;

      if (typeof name === 'object') {
        Object.keys(name).forEach(function (objName) {
          var objValue = name[objName];
          setAttr(el, objName, objValue);
        });
      } else {
        setAttr(el, name, value);
      }
    });
  }

  return getAttr(this[0], name);
};

var getProp = function (el, name) {
  if (!el || !isTag(el)) return;

  return name in el
    ? el[name]
    : rboolean.test(name)
    ? getAttr(el, name) !== undefined
    : getAttr(el, name);
};

var setProp = function (el, name, value) {
  el[name] = rboolean.test(name) ? !!value : value;
};

/**
 * Method for getting and setting properties. Gets the property value for only
 * the first element in the matched set.
 *
 * @example
 *
 * $('input[type="checkbox"]').prop('checked')
 * //=> false
 *
 * $('input[type="checkbox"]').prop('checked', true).val()
 * //=> ok
 *
 * @param {string} name - Name of the property.
 * @param {any} [value] - If specified set the property to this.
 *
 * @see {@link http://api.jquery.com/prop/}
 */
exports.prop = function (name, value) {
  var i = 0;
  var property;

  if (typeof name === 'string' && value === undefined) {
    switch (name) {
      case 'style':
        property = this.css();

        Object.keys(property).forEach(function (p) {
          property[i++] = p;
        });

        property.length = i;

        break;
      case 'tagName':
      case 'nodeName':
        property = this[0].name.toUpperCase();
        break;
      case 'outerHTML':
        property = this.clone().wrap('<container />').parent().html();
        break;
      default:
        property = getProp(this[0], name);
    }

    return property;
  }

  if (typeof name === 'object' || value !== undefined) {
    if (typeof value === 'function') {
      return domEach(this, function (j, el) {
        setProp(el, name, value.call(el, j, getProp(el, name)));
      });
    }

    return domEach(this, function (__, el) {
      if (!isTag(el)) return;

      if (typeof name === 'object') {
        Object.keys(name).forEach(function (key) {
          var val = name[key];
          setProp(el, key, val);
        });
      } else {
        setProp(el, name, value);
      }
    });
  }
};

var setData = function (el, name, value) {
  if (!el.data) {
    el.data = {};
  }

  if (typeof name === 'object') return Object.assign(el.data, name);
  if (typeof name === 'string' && value !== undefined) {
    el.data[name] = value;
  }
};

// Read the specified attribute from the equivalent HTML5 `data-*` attribute,
// and (if present) cache the value in the node's internal data store. If no
// attribute name is specified, read *all* HTML5 `data-*` attributes in this
// manner.
var readData = function (el, name) {
  var readAll = arguments.length === 1;
  var domNames;
  var domName;
  var jsNames;
  var jsName;
  var value;
  var idx;
  var length;

  if (readAll) {
    domNames = Object.keys(el.attribs).filter(function (attrName) {
      return attrName.slice(0, dataAttrPrefix.length) === dataAttrPrefix;
    });
    jsNames = domNames.map(function (_domName) {
      return camelCase(_domName.slice(dataAttrPrefix.length));
    });
  } else {
    domNames = [dataAttrPrefix + cssCase(name)];
    jsNames = [name];
  }

  for (idx = 0, length = domNames.length; idx < length; ++idx) {
    domName = domNames[idx];
    jsName = jsNames[idx];
    if (hasOwn.call(el.attribs, domName) && !hasOwn.call(el.data, jsName)) {
      value = el.attribs[domName];

      if (hasOwn.call(primitives, value)) {
        value = primitives[value];
      } else if (value === String(Number(value))) {
        value = Number(value);
      } else if (rbrace.test(value)) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          /* ignore */
        }
      }

      el.data[jsName] = value;
    }
  }

  return readAll ? el.data : value;
};

/**
 * Method for getting and setting data attributes. Gets or sets the data
 * attribute value for only the first element in the matched set.
 *
 * @example
 *
 * $('<div data-apple-color="red"></div>').data()
 * //=> { appleColor: 'red' }
 *
 * $('<div data-apple-color="red"></div>').data('apple-color')
 * //=> 'red'
 *
 * const apple = $('.apple').data('kind', 'mac')
 * apple.data('kind')
 * //=> 'mac'
 *
 * @param {string} name - Name of the attribute.
 * @param {any} [value] - If specified new value.
 *
 * @see {@link http://api.jquery.com/data/}
 */
exports.data = function (name, value) {
  var elem = this[0];

  if (!elem || !isTag(elem)) return;

  if (!elem.data) {
    elem.data = {};
  }

  // Return the entire data object if no data specified
  if (!name) {
    return readData(elem);
  }

  // Set the value (with attr map support)
  if (typeof name === 'object' || value !== undefined) {
    domEach(this, function (i, el) {
      setData(el, name, value);
    });
    return this;
  } else if (hasOwn.call(elem.data, name)) {
    return elem.data[name];
  }

  return readData(elem, name);
};

/**
 * Method for getting and setting the value of input, select, and textarea.
 * Note: Support for `map`, and `function` has not been added yet.
 *
 * @example
 *
 * $('input[type="text"]').val()
 * //=> input_text
 *
 * $('input[type="text"]').val('test').html()
 * //=> <input type="text" value="test"/>
 *
 * @param {string} [value] - If specified new value.
 *
 * @see {@link http://api.jquery.com/val/}
 */
exports.val = function (value) {
  var querying = arguments.length === 0;
  var element = this[0];

  if (!element) return;

  switch (element.name) {
    case 'textarea':
      return this.text(value);
    case 'input':
      if (this.attr('type') === 'radio') {
        if (querying) {
          return this.attr('value');
        }

        this.attr('value', value);
        return this;
      }

      return this.attr('value', value);
    case 'select':
      var option = this.find('option:selected');
      var returnValue;
      if (option === undefined) return undefined;
      if (!querying) {
        if (!hasOwn.call(this.attr(), 'multiple') && typeof value == 'object') {
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
      if (hasOwn.call(this.attr(), 'multiple')) {
        returnValue = [];
        domEach(option, function (__, el) {
          returnValue.push(getAttr(el, 'value'));
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
 * Remove an attribute.
 *
 * @private
 * @param {node} elem - Node to remove attribute from.
 * @param {string} name - Name of the attribute to remove.
 */
var removeAttribute = function (elem, name) {
  if (!elem.attribs || !hasOwn.call(elem.attribs, name)) return;

  delete elem.attribs[name];
};

/**
 * Splits a space-separated list of names to individual
 * names.
 *
 * @param {string} names -  Names to split.
 * @returns {string[]} - Split names.
 */
var splitNames = function (names) {
  return names ? names.trim().split(rspace) : [];
};

/**
 * Method for removing attributes by `name`.
 *
 * @example
 *
 * $('.pear').removeAttr('class').html()
 * //=> <li>Pear</li>
 *
 * $('.apple').attr('id', 'favorite')
 * $('.apple').removeAttr('id class').html()
 * //=> <li>Apple</li>
 *
 * @param {string} name - Name of the attribute.
 *
 * @see {@link http://api.jquery.com/removeAttr/}
 */
exports.removeAttr = function (name) {
  var attrNames = splitNames(name);

  for (var i = 0; i < attrNames.length; i++) {
    domEach(this, function (j, elem) {
      removeAttribute(elem, attrNames[i]);
    });
  }

  return this;
};

/**
 * Check to see if *any* of the matched elements have the given `className`.
 *
 * @example
 *
 * $('.pear').hasClass('pear')
 * //=> true
 *
 * $('apple').hasClass('fruit')
 * //=> false
 *
 * $('li').hasClass('pear')
 * //=> true
 *
 * @param {string} className - Name of the class.
 *
 * @see {@link http://api.jquery.com/hasClass/}
 */
exports.hasClass = function (className) {
  return this.toArray().some(function (elem) {
    var attrs = elem.attribs;
    var clazz = attrs && attrs['class'];
    var idx = -1;
    var end;

    if (clazz && className.length) {
      while ((idx = clazz.indexOf(className, idx + 1)) > -1) {
        end = idx + className.length;

        if (
          (idx === 0 || rspace.test(clazz[idx - 1])) &&
          (end === clazz.length || rspace.test(clazz[end]))
        ) {
          return true;
        }
      }
    }
  });
};

/**
 * Adds class(es) to all of the matched elements. Also accepts a `function`
 * like jQuery.
 *
 * @example
 *
 * $('.pear').addClass('fruit').html()
 * //=> <li class="pear fruit">Pear</li>
 *
 * $('.apple').addClass('fruit red').html()
 * //=> <li class="apple fruit red">Apple</li>
 *
 * @param {string} value - Name of new class.
 *
 * @see {@link http://api.jquery.com/addClass/}
 */
exports.addClass = function (value) {
  // Support functions
  if (typeof value === 'function') {
    return domEach(this, function (i, el) {
      var className = el.attribs['class'] || '';
      exports.addClass.call([el], value.call(el, i, className));
    });
  }

  // Return if no value or not a string or function
  if (!value || typeof value !== 'string') return this;

  var classNames = value.split(rspace);
  var numElements = this.length;

  for (var i = 0; i < numElements; i++) {
    // If selected element isn't a tag, move on
    if (!isTag(this[i])) continue;

    // If we don't already have classes
    var className = getAttr(this[i], 'class');
    var numClasses;
    var setClass;

    if (!className) {
      setAttr(this[i], 'class', classNames.join(' ').trim());
    } else {
      setClass = ' ' + className + ' ';
      numClasses = classNames.length;

      // Check if class already exists
      for (var j = 0; j < numClasses; j++) {
        var appendClass = classNames[j] + ' ';
        if (setClass.indexOf(' ' + appendClass) < 0) setClass += appendClass;
      }

      setAttr(this[i], 'class', setClass.trim());
    }
  }

  return this;
};

/**
 * Removes one or more space-separated classes from the selected elements. If
 * no `className` is defined, all classes will be removed. Also accepts a
 * `function` like jQuery.
 *
 * @example
 *
 * $('.pear').removeClass('pear').html()
 * //=> <li class="">Pear</li>
 *
 * $('.apple').addClass('red').removeClass().html()
 * //=> <li class="">Apple</li>
 * @param {string} value - Name of the class.
 *
 * @see {@link http://api.jquery.com/removeClass/}
 */
exports.removeClass = function (value) {
  var classes;
  var numClasses;
  var removeAll;

  // Handle if value is a function
  if (typeof value === 'function') {
    return domEach(this, function (i, el) {
      exports.removeClass.call(
        [el],
        value.call(el, i, el.attribs['class'] || '')
      );
    });
  }

  classes = splitNames(value);
  numClasses = classes.length;
  removeAll = arguments.length === 0;

  return domEach(this, function (i, el) {
    if (!isTag(el)) return;

    if (removeAll) {
      // Short circuit the remove all case as this is the nice one
      el.attribs.class = '';
    } else {
      var elClasses = splitNames(el.attribs.class);
      var index;
      var changed;

      for (var j = 0; j < numClasses; j++) {
        index = elClasses.indexOf(classes[j]);

        if (index >= 0) {
          elClasses.splice(index, 1);
          changed = true;

          // We have to do another pass to ensure that there are not duplicate
          // classes listed
          j--;
        }
      }
      if (changed) {
        el.attribs.class = elClasses.join(' ');
      }
    }
  });
};

/**
 * Add or remove class(es) from the matched elements, depending on either the
 * class's presence or the value of the switch argument. Also accepts a
 * `function` like jQuery.
 *
 * @example
 *
 * $('.apple.green').toggleClass('fruit green red').html()
 * //=> <li class="apple fruit red">Apple</li>
 *
 * $('.apple.green').toggleClass('fruit green red', true).html()
 * //=> <li class="apple green fruit red">Apple</li>
 *
 * @param {(string|Function)} value - Name of the class. Can also be a function.
 * @param {boolean} [stateVal] - If specified the state of the class.
 *
 * @see {@link http://api.jquery.com/toggleClass/}
 */
exports.toggleClass = function (value, stateVal) {
  // Support functions
  if (typeof value === 'function') {
    return domEach(this, function (i, el) {
      exports.toggleClass.call(
        [el],
        value.call(el, i, el.attribs['class'] || '', stateVal),
        stateVal
      );
    });
  }

  // Return if no value or not a string or function
  if (!value || typeof value !== 'string') return this;

  var classNames = value.split(rspace);
  var numClasses = classNames.length;
  var state = typeof stateVal === 'boolean' ? (stateVal ? 1 : -1) : 0;
  var numElements = this.length;
  var elementClasses;
  var index;

  for (var i = 0; i < numElements; i++) {
    // If selected element isn't a tag, move on
    if (!isTag(this[i])) continue;

    elementClasses = splitNames(this[i].attribs.class);

    // Check if class already exists
    for (var j = 0; j < numClasses; j++) {
      // Check if the class name is currently defined
      index = elementClasses.indexOf(classNames[j]);

      // Add if stateValue === true or we are toggling and there is no value
      if (state >= 0 && index < 0) {
        elementClasses.push(classNames[j]);
      } else if (state <= 0 && index >= 0) {
        // Otherwise remove but only if the item exists
        elementClasses.splice(index, 1);
      }
    }

    this[i].attribs.class = elementClasses.join(' ');
  }

  return this;
};

/**
 * Checks the current list of elements and returns `true` if _any_ of the
 * elements match the selector. If using an element or Cheerio selection,
 * returns `true` if _any_ of the elements match. If using a predicate
 * function, the function is executed in the context of the selected element,
 * so `this` refers to the current element.
 *
 * @param {string|Function|cheerio|node} selector - Selector for the selection.
 *
 * @see {@link http://api.jquery.com/is/}
 */
exports.is = function (selector) {
  if (selector) {
    return this.filter(selector).length > 0;
  }
  return false;
};
