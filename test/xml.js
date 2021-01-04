'use strict';
var cheerio = require('..');

function xml(str, options) {
  options = Object.assign({ xml: true }, options);
  var $ = cheerio.load(str, options);
  return $.xml();
}

function dom(str, options) {
  var $ = cheerio.load('', options);
  return $(str).html();
}

describe('render', function () {
  describe('(xml)', function () {
    it('should render <media:thumbnail /> tags correctly', function () {
      var str =
        '<media:thumbnail url="http://www.foo.com/keyframe.jpg" width="75" height="50" time="12:05:01.123" />';
      expect(xml(str)).toBe(
        '<media:thumbnail url="http://www.foo.com/keyframe.jpg" width="75" height="50" time="12:05:01.123"/>'
      );
    });

    it('should render <link /> tags (RSS) correctly', function () {
      var str = '<link>http://www.github.com/</link>';
      expect(xml(str)).toBe('<link>http://www.github.com/</link>');
    });

    it('should escape entities', function () {
      var str = '<tag attr="foo &amp; bar"/>';
      expect(xml(str)).toBe(str);
    });

    it('should render HTML as XML', function () {
      var $ = cheerio.load('<foo></foo>', null, false);
      expect($.xml()).toBe('<foo/>');
    });
  });

  describe('(dom)', function () {
    it('should not keep camelCase for new nodes', function () {
      var str = '<g><someElem someAttribute="something">hello</someElem></g>';
      expect(dom(str, { xml: false })).toBe(
        '<someelem someattribute="something">hello</someelem>'
      );
    });

    it('should keep camelCase for new nodes', function () {
      var str = '<g><someElem someAttribute="something">hello</someElem></g>';
      expect(dom(str, { xml: true })).toBe(
        '<someElem someAttribute="something">hello</someElem>'
      );
    });

    it('should maintain the parsing options of distinct contexts independently', function () {
      var str = '<g><someElem someAttribute="something">hello</someElem></g>';
      var $ = cheerio.load('', { xml: false });

      expect($(str).html()).toBe(
        '<someelem someattribute="something">hello</someelem>'
      );
    });
  });
});
