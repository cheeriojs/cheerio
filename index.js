// Use source if we have coffeescript otherwise use lib
try {
    require('coffee-script');
    module.exports = require(__dirname + "/src/cheerio.coffee");
} catch (e) {
    module.exports = require(__dirname + "/lib/cheerio.js");
}