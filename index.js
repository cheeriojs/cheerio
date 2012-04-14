var fs = require('fs');

exports = module.exports = require('./lib/cheerio');

/*
  Export the version
*/
exports.version = (function() {
  var pkg = fs.readFileSync(__dirname + '/package.json', 'utf8');
  return JSON.parse(pkg).version;
})();
