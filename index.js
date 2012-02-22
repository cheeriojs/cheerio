exports = module.exports = require('./lib/cheerio');

/*
  Export the version
*/

var version = function() {
  var pkg = require('fs').readFileSync(__dirname + '/package.json', 'utf8');
  return JSON.parse(pkg).version;
};

exports.__defineGetter__('version', version);
