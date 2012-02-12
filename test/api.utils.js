var cheerio = require('../'),
    should = require('should');

/*
  Examples
*/

    
describe('$', function() {
  
  describe('.html', function() {
    
    it('.html() should return innerHTML; $.html(obj) should return outerHTML', function() {
      var html = "<div><span>foo</span><span>bar</span></div>",
          $ = cheerio.load(html),
          span = $('div').children().get(1);
          
      $(span).html().should.equal('bar');
      $.html(span).should.equal('<span>bar</span>')
    });

    it('$.html(<obj>) should accept an object, an array, or a cheerio object', function() {
      var $ = cheerio;
      var span = $("<span>foo</span>");
          
      $.html(span.get(0)).should.equal('<span>foo</span>')
      $.html(span.get()).should.equal('<span>foo</span>')
      $.html(span).should.equal('<span>foo</span>')
    });

  });
});