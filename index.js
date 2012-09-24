/**
 * Export cheerio (with )
 */

exports = module.exports = process.env.CHEERIO_COV
  ? require('./lib-cov/cheerio')
  : require('./lib/cheerio');

/*
  Export the version
*/

exports.version = require('./package').version;
