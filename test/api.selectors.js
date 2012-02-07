var cheerio = require("../"),
    should = require("should");

describe('$(":root")', function() {
        it('should return the root element', function() {
            var $ = cheerio.load("<div><span>foo</span><span>bar</span></div>");

            $(":root").append("<div id = 'test'></div>");
            $.html().should.equal('<div><span>foo</span><span>bar</span></div><div id = "test"></div>');
    });
});
