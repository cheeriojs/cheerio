var fs = require('fs');

exports = module.exports = require('./lib/cheerio');

/*
  Export the version
*/
exports.version = require('./package').version;
