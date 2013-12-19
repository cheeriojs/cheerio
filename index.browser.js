/**
 * Export cheerio (with )
 */

exports = require('./lib/cheerio');

/*
  Export the version
*/

// Browserify currently requires the .json extension.
exports.version = require('./package.json').version;
