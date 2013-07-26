var expect = require('expect.js'),
    fixtures = require('./fixtures'),
    $ = require('../');


describe('$', function() {

  describe('.html', function() {

    it('() : should return innerHTML; $.html(obj) should return outerHTML', function() {
      var $div = $('div', '<div><span>foo</span><span>bar</span></div>');
      var span = $div.children()[1];
      expect($(span).html()).to.equal('bar');
      expect($.html(span)).to.equal('<span>bar</span>');
    });

    it('(<obj>) : should accept an object, an array, or a cheerio object', function() {
      var $span = $('<span>foo</span>');
      expect($.html($span[0])).to.equal('<span>foo</span>');
      expect($.html($span)).to.equal('<span>foo</span>');
    });

    it('(<value>) : should be able to set to an empty string', function() {
      var $elem = $('<span>foo</span>').html('');
      expect($.html($elem)).to.equal('<span></span>');
    });

    it('() : of empty cheerio object should return null', function() {
      expect($().html()).to.be(null);
    });

    it('(selector) : should return the outerHTML of the selected element', function() {
      var _$ = $.load(fixtures.fruits);
      expect(_$.html('.pear')).to.equal('<li class="pear">Pear</li>');
    });
  });



  describe('.load', function() {

    it('(html) : should retain original root after creating a new node', function() {
      var $html = $.load('<body><ul id="fruits"></ul></body>');
      expect($html('body')).to.have.length(1);
      $html('<script>');
      expect($html('body')).to.have.length(1);
    });

    it('(html) : should handle lowercase tag options', function() {
      var $html = $.load('<BODY><ul id="fruits"></ul></BODY>', { lowerCaseTags : true });
      expect($html.html()).to.be('<body><ul id="fruits"></ul></body>');
    });

    it('(html) : should handle the ignore whitepace option', function() {
      var $html = $.load('<body><a href="http://yahoo.com">Yahoo</a> <a href="http://google.com">Google</a></body>', { ignoreWhitespace : true });
      expect($html.html()).to.be('<body><a href="http://yahoo.com">Yahoo</a><a href="http://google.com">Google</a></body>');
    });

    // TODO:
    // it('(html) : should handle xml tag option', function() {
    //   var $html = $.load('<body><script>oh hai</script></body>', { xmlMode : true });
    //   console.log($html('script')[0].type);
    //   expect($html('script')[0].type).to.be('tag');
    // });

  });


  describe('.clone', function() {

    it('() : should return a copy', function() {
      var $src = $('<div><span>foo</span><span>bar</span><span>baz</span></div>').children();
      var $elem = $src.clone();
      expect($elem.length).to.equal(3);
      expect($elem.parent()).to.have.length(0);
      expect($elem.text()).to.equal($src.text());
      $src.text('rofl');
      expect($elem.text()).to.not.equal($src.text());
    });

  });

  describe('.parseHTML', function() {

    it('() : returns null', function() {
      expect($.parseHTML()).to.equal(null);
    });

    it('(null) : returns null', function() {
      expect($.parseHTML(null)).to.equal(null);
    });

    it('("") : returns null', function() {
      expect($.parseHTML('')).to.equal(null);
    });

    it('(largeHtmlString) : parses large HTML strings', function() {
      var html = new Array(10).join('<div></div>');
      var nodes = $.parseHTML(html);

      expect(nodes.length).to.be.greaterThan(4);
      expect(nodes).to.be.an('array');
    });

    it('("<script>") : ignores scripts by default', function() {
      var html = '<script>undefined()</script>';
      expect($.parseHTML(html)).to.have.length(0);
    });

    it('("<script>", true) : preserves scripts when requested', function() {
      var html = '<script>undefined()</script>';
      expect($.parseHTML(html, true)[0].name).to.match(/script/i);
    });

    it('("scriptAndNonScript) : preserves non-script nodes', function() {
      var html = '<script>undefined()</script><div></div>';
      expect($.parseHTML(html)[0].name).to.match(/div/i);
    });

    it('(scriptAndNonScript, true) : Preserves script position', function() {
      var html = '<script>undefined()</script><div></div>';
      expect($.parseHTML(html, true)[0].name).to.match(/script/i);
    });

    it('(text) : returns a text node', function() {
      expect($.parseHTML('text')[0].type).to.be('text');
    });

    it('(\\ttext) : preserves leading whitespace', function() {
      expect($.parseHTML('\t<div></div>')[0].data).to.equal('\t');
    });

    it('( text) : Leading spaces are treated as text nodes', function() {
      expect($.parseHTML(' <div/> ')[0].type).to.be('text');
    });

    it('(html) : should preserve content', function() {
      var html = '<div>test div</div>';
      expect($($.parseHTML(html)[0]).html()).to.equal('test div');
    });

    it('(malformedHtml) : should not break', function() {
      expect($.parseHTML('<span><span>')).to.have.length(1);
    });

    it('(garbageInput) : should not cause an error', function() {
      expect($.parseHTML('<#if><tr><p>This is a test.</p></tr><#/if>') || true).to.be.ok();
    });

  });

  describe('.root', function() {

    it('() : should return a cheerio-wrapped root object', function() {
      var $html = $.load('<div><span>foo</span><span>bar</span></div>');
      $html.root().append('<div id="test"></div>');
      expect($html.html()).to.equal('<div><span>foo</span><span>bar</span></div><div id="test"></div>');
    });

  });

});
