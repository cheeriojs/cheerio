exports = module.exports = require('./lib/cheerio');

/*
  Attach objects to cheerio
*/
exports.parse = require('./lib/parse');
exports.render = require('./lib/render');
exports.utils = require('./lib/utils');

/*
  Export the version
*/
var version = function() {
  var pkg = require('fs').readFileSync(__dirname + '/package.json', 'utf8');
  return JSON.parse(pkg).version;
};

exports.__defineGetter__('version', version);
