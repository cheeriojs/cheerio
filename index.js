var cheerio = exports = module.exports = require('./lib/cheerio');

/*
  Attach objects to cheerio
*/
exports.parse = cheerio.parse;
exports.render = cheerio.render;

/*
  Export the version
*/
var version = function() {
  var pkg = require('fs').readFileSync(__dirname + '/package.json', 'utf8');
  return JSON.parse(pkg).version;
};

exports.__defineGetter__('version', version);
