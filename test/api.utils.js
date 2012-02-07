var cheerio = require('../'),
    should = require('should');

/*
  Examples
*/

    
describe('$', function() {
  
  describe('.html', function() {
    
    it('(html) should return innerHTML of element', function() {
      var html = "<div><span>foo</span><span>bar</span></div>",
          $ = cheerio.load(html),
          span = $('div').children().get(1);
          
      $(span).html().should.equal('bar');
      $.html(span).should.equal('<span>bar</span>')
    });
  });
});