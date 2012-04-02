var cheerio = require("../"),
    expect = require("expect.js");

describe('$(":root")', function() {
  it('should return the root element', function() {
    var $ = cheerio.load("<div><span>foo</span><span>bar</span></div>");

    $(":root").append("<div id = 'test'></div>");
    expect($.html()).to.equal('<div><span>foo</span><span>bar</span></div><div id="test"></div>');
  });
});
