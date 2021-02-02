'use strict';
/** Cheerio default options. */
exports.default = {
  xml: false,
  decodeEntities: true,
};

var assign = require('./utils').assign;
var xmlModeDefault = { _useHtmlParser2: true, xmlMode: true };

exports.flatten = function (options) {
  return options && options.xml
    ? typeof options.xml === 'boolean'
      ? xmlModeDefault
      : assign({}, xmlModeDefault, options.xml)
    : options;
};
