var $ = require('../'),
    should = require('should');

/*
  Examples
*/

    
describe('$', function() {
  
  describe('.html', function() {
    
    it('() : should return innerHTML; $.html(obj) should return outerHTML', function() {
      var div  = $('div', '<div><span>foo</span><span>bar</span></div>'),
          span = div.children().get(1);
          
      $(span).html().should.equal('bar');
      $.html(span).should.equal('<span>bar</span>');
    });

    it('(<obj>) : should accept an object, an array, or a cheerio object', function() {
      var span = $("<span>foo</span>");
          
      $.html(span.get(0)).should.equal('<span>foo</span>');
      $.html(span.get()).should.equal('<span>foo</span>');
      $.html(span).should.equal('<span>foo</span>');
    });
    
    it('(<value>) : should be able to set to an empty string', function() {
        var elem = $("<span>foo</span>");
        
        elem.html('');
        $.html(elem).should.equal('<span></span>');
    });
    
    it('() : of empty cheerio object should return null', function() {
      should.not.exist($().html());
    });
    
  });
  
  describe('.clone', function() {
    
    it('() : should return a copy', function() {
        var src = $("<div><span>foo</span><span>bar</span><span>baz</span></div>").children(),
            elem = src.clone();

        elem.length.should.equal(3);
        elem.parent().length.should.equal(0);
    });
    
  });
});