(function() {
  var api, cheerio, parse, path, plugin, soupselect, _, _i, _len;

  path = require("path");

  soupselect = require("soupselect");

  _ = require("underscore");

  parse = require("./parse");

  cheerio = (function() {
    var quickExpr, trimLeft, trimRight;
    cheerio = function(selector, context, root) {
      return new cheerio.fn.init(selector, context, root);
    };
    quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;
    trimLeft = /^\s+/;
    trimRight = /\s+$/;
    cheerio.fn = cheerio.prototype = {
      cheerio: "0.4.1",
      constructor: cheerio,
      init: function(selector, context, root) {
        var elems, match;
        if (!selector) return this;
        if (root) {
          cheerio.extend({
            'root': root
          });
          if (_.isString(context)) selector = "" + context + " " + selector;
          context = root;
        }
        if (typeof selector === "string") {
          if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
            match = [null, selector, null];
          } else {
            match = quickExpr.exec(selector);
          }
          if (match && (match[1] || !context)) {
            if (match[1]) {
              root = parse(selector);
              return cheerio.merge(this, root.children);
            } else if (context) {
              elems = soupselect.select(context, selector);
              this.selector = selector;
              return cheerio.merge(this, elems);
            }
          }
          /*
                    Refactor
          */
          if (!context || context.cheerio) {
            return this.constructor(context || root).find(selector);
          } else {
            if (_.isString(context)) context = parse(context);
            return this.constructor(context).find(selector);
          }
        }
        return cheerio.makeArray(selector, this);
      },
      selector: "",
      sort: [].sort,
      splice: [].splice,
      length: 0
    };
    cheerio.fn.init.prototype = cheerio.fn;
    cheerio.extend = cheerio.fn.extend = function(obj) {
      return _.extend(this, obj);
    };
    return cheerio;
  })();

  module.exports = cheerio;

  /*
    Plug in the API
  */

  api = ['core', 'utils', 'attributes', 'traversing', 'manipulation'];

  for (_i = 0, _len = api.length; _i < _len; _i++) {
    plugin = api[_i];
    require("./api/" + plugin);
  }

}).call(this);
