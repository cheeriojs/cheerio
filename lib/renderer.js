(function() {
  var render, renderDirective, renderTag, renderText, singleTag, tagType, utils, _;
  _ = require("underscore");
  utils = require("./utils");
  singleTag = {
    area: 1,
    base: 1,
    basefont: 1,
    br: 1,
    col: 1,
    frame: 1,
    hr: 1,
    img: 1,
    input: 1,
    isindex: 1,
    link: 1,
    meta: 1,
    param: 1,
    embed: 1
  };
  tagType = {
    tag: 1,
    script: 1,
    link: 1,
    style: 1,
    template: 1
  };
  render = exports.render = function(dom, output) {
    var data, elem, str, _i, _len;
    if (output == null) {
      output = [];
    }
    if (!_.isArray(dom)) {
      dom = [dom];
    }
    for (_i = 0, _len = dom.length; _i < _len; _i++) {
      elem = dom[_i];
      str = elem.name;
      if (elem.raw === null) {
        continue;
      }
      data = elem.data;
      if (data[0] === '%' && data[data.length - 1] === '%') {
        elem.type = "template";
      }
      if (tagType[elem.type]) {
        output.push(renderTag(elem));
      } else if (elem.type === "directive") {
        output.push(renderDirective(elem));
      } else {
        output.push(renderText(elem));
      }
      if (elem.children) {
        output.push(render(elem.children));
      }
      if (!singleTag[elem.name] && tagType[elem.type]) {
        output.push("</" + elem.name + ">");
      }
    }
    return output.join("");
  };
  renderTag = function(elem) {
    var tag;
    tag = "<" + elem.name;
    if (elem.attribs && _.size(elem.attribs) > 0) {
      tag += " " + utils.formatAttributes(elem.attribs);
    }
    if (!singleTag[elem.name]) {
      tag += ">";
    } else {
      tag += "/>";
    }
    return tag;
  };
  renderDirective = function(elem) {
    return "<" + elem.raw + ">";
  };
  renderText = function(elem) {
    return elem.raw;
  };
  module.exports = exports;
}).call(this);
