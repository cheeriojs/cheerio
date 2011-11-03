(function() {
  var formatAttributes, print, print_r;
  formatAttributes = exports.formatAttributes = function(attributes) {
    var key, output, value;
    if (!attributes) {
      return "";
    }
    output = [];
    for (key in attributes) {
      value = attributes[key];
      if (key === value) {
        output.push(key);
      } else {
        output.push(key + ' = "' + value + '"');
      }
    }
    return output.join(" ");
  };
  module.exports = exports;
  String.prototype.repeat = function(times) {
    return new Array(times + 1).join(this);
  };
  print = exports.print = function(dom, attr, depth, out) {
    var attrs, elem, passback, prop, str, val, _i, _j, _len, _len2;
    if (attr == null) {
      attr = null;
    }
    if (depth == null) {
      depth = 0;
    }
    if (out == null) {
      out = [];
    }
    for (_i = 0, _len = dom.length; _i < _len; _i++) {
      elem = dom[_i];
      if (elem.type !== "tag") {
        continue;
      }
      str = '–'.repeat(depth);
      if (depth > 0) {
        str += str + " " + elem.name;
      } else {
        str += elem.name;
      }
      if (attr) {
        attrs = attr.split(".");
        val = elem;
        passback = true;
        for (_j = 0, _len2 = attrs.length; _j < _len2; _j++) {
          prop = attrs[_j];
          val = val[prop];
          if (!val) {
            passback = false;
            break;
          }
        }
        if (passback) {
          str += "   ( " + attr + " : " + val + " )";
        }
      }
      out.push(str);
      if (elem.children) {
        print(elem.children, attr, depth + 1, out);
      }
    }
    return out.join("\n");
  };
  print_r = exports.print_r = function(arr, attr) {
    var attributes, out;
    if (attr == null) {
      attr = "name";
    }
    out = "[ ";
    attributes = arr.map(function(elem) {
      return elem[attr];
    });
    out += attributes.join(", ");
    out += " ]";
    return out;
  };
}).call(this);
