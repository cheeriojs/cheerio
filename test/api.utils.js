var $ = require('../'),
    expect = require('expect.js');

/*
  Examples
*/

    
describe('$', function() {
  
  describe('.html', function() {
    
    it('() : should return innerHTML; $.html(obj) should return outerHTML', function() {
      var div  = $('div', '<div><span>foo</span><span>bar</span></div>'),
          span = div.children().get(1);
          
      expect($(span).html()).to.equal('bar');
      expect($.html(span)).to.equal('<span>bar</span>');
    });

    it('(<obj>) : should accept an object, an array, or a cheerio object', function() {
      var span = $("<span>foo</span>");
          
      expect($.html(span.get(0))).to.equal('<span>foo</span>');
      expect($.html(span.get())).to.equal('<span>foo</span>');
      expect($.html(span)).to.equal('<span>foo</span>');
    });
    
    it('(<value>) : should be able to set to an empty string', function() {
        var elem = $("<span>foo</span>");
        
        elem.html('');
        expect($.html(elem)).to.equal('<span></span>');
    });
    
    it('() : of empty cheerio object should return null', function() {
      expect($().html()).to.be(null);
    });
    
  });
  
  describe('.clone', function() {
    
    it('() : should return a copy', function() {
        var src = $("<div><span>foo</span><span>bar</span><span>baz</span></div>").children(),
            elem = src.clone();

        expect(elem.length).to.equal(3);
        expect(elem.parent().length).to.equal(1);
        expect(elem.parent()[0].type).to.equal('root');
        expect(elem.text()).to.equal(src.text());
        src.text('rofl');
        expect(elem.text()).to.not.equal(src.text());
    });
    
  });

  describe('.root', function() {

    it('() : should return a cheerio-wrapped root object', function() {
      var $html = $.load("<div><span>foo</span><span>bar</span></div>");
      $html.root().append("<div id = 'test'></div>");
      expect($html.html()).to.equal('<div><span>foo</span><span>bar</span></div><div id="test"></div>');
    });

  });

  describe('.load', function() {
    it('(html) : should retain original root after creating a new node', function() {
      var $html = $.load('<body><ul id = "fruits"></ul></body>');
      expect($html('body')).to.have.length(1);
      var script = $html('<script>');
      expect($html('body')).to.have.length(1);
    });
  });
});