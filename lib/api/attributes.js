(function() {
  var $, addClass, attr, hasClass, rclass, removeAttr, removeClass, rspace, _;
  _ = require("underscore");
  $ = require("../cheerio");
  rclass = /[\n\t\r]/g;
  rspace = /\s+/;
  attr = exports.attr = function(name, value) {
    return $.access(this, name, value, true, $.attr);
  };
  removeAttr = exports.removeAttr = function(name) {
    return this.each(function() {
      return $.removeAttr(this, name);
    });
  };
  hasClass = exports.hasClass = function(selector) {
    var className, elem, _i, _len;
    className = " " + selector + " ";
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      elem = this[_i];
      if (elem.type === "tag" && elem.attribs && (" " + elem.attribs["class"] + " ").replace(rclass, " ").indexOf(className) > -1) {
        return true;
      }
    }
    return false;
  };
  addClass = exports.addClass = function(value) {
    var $elem, className, classNames, elem, setClass, _i, _j, _len, _len2;
    if (_.isFunction(value)) {
      return this.each(function(i) {
        var $this, className;
        $this = $(this);
        className = $this.attr('class') || "";
        return $this.addClass(value.call(this, i, className));
      });
    }
    if (value && _.isString(value)) {
      classNames = value.split(rspace);
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        elem = this[_i];
        $elem = $(elem);
        if (elem.type === "tag") {
          if (!$elem.attr("class")) {
            $elem.attr('class', classNames.join(' ').trim());
          } else {
            setClass = " " + $elem.attr("class") + " ";
            for (_j = 0, _len2 = classNames.length; _j < _len2; _j++) {
              className = classNames[_j];
              if (!~setClass.indexOf(" " + className + " ")) {
                setClass += className + " ";
              }
            }
            $elem.attr('class', setClass.trim());
          }
        }
      }
    }
    return this;
  };
  removeClass = exports.removeClass = function(value) {
    var $elem, className, classNames, elem, ret, _i, _j, _len, _len2;
    if (_.isFunction(value)) {
      return this.each(function(j) {
        var $this, className;
        $this = $(this);
        className = $this.attr('class') || "";
        return $this.removeClass(value.call(this, j, className));
      });
    }
    if ((value && _.isString(value)) || value === void 0) {
      classNames = (value || "").split(rspace);
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        elem = this[_i];
        $elem = $(elem);
        if (elem.type === 'tag' && $elem.attr('class')) {
          if (value) {
            ret = (" " + $elem.attr('class') + " ").replace(rclass, " ");
            for (_j = 0, _len2 = classNames.length; _j < _len2; _j++) {
              className = classNames[_j];
              ret = ret.replace(" " + className + " ", " ");
            }
            $elem.attr('class', ret.trim());
          } else {
            $elem.attr('class', '');
          }
        }
      }
    }
    return this;
  };
  module.exports = $.fn.extend(exports);
}).call(this);
