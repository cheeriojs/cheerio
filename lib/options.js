/*
 * Cheerio default options
 */

exports.default = {
  withDomLvl1: true,
  normalizeWhitespace: false,
  xml: false,
  decodeEntities: true,
};

exports.flatten = function (options) {
  return options && options.xml
    ? Object.assign({ xmlMode: true }, options.xml)
    : options;
};
