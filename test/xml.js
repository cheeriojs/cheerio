var expect = require('expect.js'),
    _ = require('underscore'),
    cheerio = require('../lib/cheerio');

var xml = function(str, options) {
  options = _.extend({ xmlMode: true }, options);
  var dom = cheerio.load(str, options);
  return dom.xml();
};

describe('render', function() {

  describe('(xml)', function() {

    it('should render <media:thumbnail /> tags correctly', function() {
      var str = '<media:thumbnail url="http://www.foo.com/keyframe.jpg" width="75" height="50" time="12:05:01.123" />';
      expect(xml(str)).to.equal('<media:thumbnail url="http://www.foo.com/keyframe.jpg" width="75" height="50" time="12:05:01.123"/>');
    });

    it('should render <link /> tags (RSS) correctly', function() {
      var str = '<link>http://www.github.com/</link>';
      expect(xml(str)).to.equal('<link>http://www.github.com/</link>');
    });

  });

});
