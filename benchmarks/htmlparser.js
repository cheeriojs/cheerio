
var request = require('request'),
      cheerio = require('cheerio');

request('http://yahoo.com', function(err, response, body) {
  if (!err && response.statusCode === 200) {
    var start = new Date(),
        $ = cheerio.load(body),
        end = new Date();

    console.log('ops took: ' + (end.getTime() - start.getTime()) + ' ms');
  }
});

