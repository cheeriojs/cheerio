(function() {
  var api, cheerio, parser, path, plugin, renderer, soupselect, _, _i, _len;
  path = require("path");
  soupselect = require("soupselect");
  _ = require("underscore");
  parser = require("./parser");
  renderer = require("./renderer");
  cheerio = (function() {
    var quickExpr, trimLeft, trimRight;
    cheerio = function(selector, context, root) {
      return new cheerio.fn.init(selector, context, root);
    };
    quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;
    trimLeft = /^\s+/;
    trimRight = /\s+$/;
    cheerio.fn = cheerio.prototype = {
      constructor: cheerio,
      init: function(selector, context, root) {
        var elems, match;
        if (!selector) {
          return this;
        }
        if (root) {
          this.root = root;
          if (_.isString(context)) {
            selector = "" + context + " " + selector;
          }
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
              return cheerio.merge(this, parser.parse(selector));
            } else {
              elems = soupselect.select(context, selector);
              this.selector = selector;
              return cheerio.merge(this, elems);
            }
          }
          if (!context || context.cheerio) {
            return (context || root).find(selector);
          } else {
            if (_.isString(context)) {
              context = parser.parse(context);
            }
            return this.constructor(context).find(selector);
          }
        }
        return cheerio.makeArray(selector, this);
      },
      cheerio: "0.0.1",
      selector: "",
      sort: [].sort,
      splice: [].splice,
      length: 0,
      root: void 0
    };
    cheerio.fn.init.prototype = cheerio.fn;
    cheerio.extend = cheerio.fn.extend = function(obj) {
      return _.extend(this, obj);
    };
    cheerio.extend({
      load: function(html) {
        var fn, root;
        root = parser.parse(html);
        cheerio.extend({
          'root': root
        });
        fn = function(selector, context) {
          return cheerio(selector, context, root);
        };
        return _(fn).extend(cheerio);
      },
      html: function(dom) {
        if (dom !== void 0 && dom.type) {
          return renderer.render(dom);
        } else if (this.root) {
          return renderer.render(this.root);
        } else {
          return "";
        }
      },
      dom: function(dom) {
        if (dom !== void 0 && dom.type) {
          return dom;
        } else if (this.root) {
          return this.root;
        } else {
          return "";
        }
      }
    });
    cheerio.fn.extend({
      find: function(selector) {
        var elem;
        elem = soupselect.select(this.toArray(), selector);
        return cheerio(elem);
      }
    });
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
