var expect = require('expect.js'),
    _ = require('lodash'),
    cheerio = require('..');

var xml = function(str, options) {
  options = _.extend({ xmlMode: true }, options);
  var dom = cheerio.load(str, options);
  return dom.xml();
};

var dom = function(str, options) {
  var $ = cheerio.load('', options);
  return $(str).html();
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

    it('should escape entities', function(){
      var str = '<tag attr="foo &amp; bar"/>';
      expect(xml(str)).to.equal(str);
    });

  });

  describe('(dom)', function () {

    it('should keep camelCase for new nodes', function() {
      var str = '<g><someElem someAttribute="something">hello</someElem></g>';
      expect(dom(str, {xmlMode: false})).to.equal('<someelem someattribute="something">hello</someelem>');
    });

    it('should keep camelCase for new nodes', function() {
      var str = '<g><someElem someAttribute="something">hello</someElem></g>';
      expect(dom(str, {xmlMode: true})).to.equal('<someElem someAttribute="something">hello</someElem>');
    });

    it('should maintain the parsing options of distinct contexts independently', function() {
      var str = '<g><someElem someAttribute="something">hello</someElem></g>';
      var $x = cheerio.load('', { xmlMode: false });

      expect($x(str).html()).to.equal('<someelem someattribute="something">hello</someelem>');
    });

  });

});
