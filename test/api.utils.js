var expect = require('expect.js'),
    fixtures = require('./fixtures'),
    cheerio = require('..');


describe('cheerio', function() {

  describe('.html', function() {

    it('() : should return innerHTML; $.html(obj) should return outerHTML', function() {
      var $div = cheerio('div', '<div><span>foo</span><span>bar</span></div>');
      var span = $div.children()[1];
      expect(cheerio(span).html()).to.equal('bar');
      expect(cheerio.html(span)).to.equal('<span>bar</span>');
    });

    it('(<obj>) : should accept an object, an array, or a cheerio object', function() {
      var $span = cheerio('<span>foo</span>');
      expect(cheerio.html($span[0])).to.equal('<span>foo</span>');
      expect(cheerio.html($span)).to.equal('<span>foo</span>');
    });

    it('(<value>) : should be able to set to an empty string', function() {
      var $elem = cheerio('<span>foo</span>').html('');
      expect(cheerio.html($elem)).to.equal('<span></span>');
    });

    it('() : of empty cheerio object should return null', function() {
      expect(cheerio().html()).to.be(null);
    });

    it('(selector) : should return the outerHTML of the selected element', function() {
      var $ = cheerio.load(fixtures.fruits);
      expect($.html('.pear')).to.equal('<li class="pear">Pear</li>');
    });
  });



  describe('.load', function() {

    it('(html) : should retain original root after creating a new node', function() {
      var $html = cheerio.load('<body><ul id="fruits"></ul></body>');
      expect($html('body')).to.have.length(1);
      $html('<script>');
      expect($html('body')).to.have.length(1);
    });

    it('(html) : should handle lowercase tag options', function() {
      var $html = cheerio.load('<BODY><ul id="fruits"></ul></BODY>', { lowerCaseTags : true });
      expect($html.html()).to.be('<body><ul id="fruits"></ul></body>');
    });

    it('(html) : should handle the `normalizeWhitepace` option', function() {
      var $html = cheerio.load('<body><b>foo</b>  <b>bar</b></body>', { normalizeWhitespace : true });
      expect($html.html()).to.be('<body><b>foo</b> <b>bar</b></body>');
    });

    // TODO:
    // it('(html) : should handle xml tag option', function() {
    //   var $html = $.load('<body><script>oh hai</script></body>', { xmlMode : true });
    //   console.log($html('script')[0].type);
    //   expect($html('script')[0].type).to.be('tag');
    // });

    it('(buffer) : should accept a buffer', function() {
      var $html = cheerio.load(new Buffer('<div>foo</div>'));
      expect($html.html()).to.be('<div>foo</div>');
    });

  });


  describe('.clone', function() {

    it('() : should return a copy', function() {
      var $src = cheerio('<div><span>foo</span><span>bar</span><span>baz</span></div>').children();
      var $elem = $src.clone();
      expect($elem.length).to.equal(3);
      expect($elem.parent()).to.have.length(0);
      expect($elem.text()).to.equal($src.text());
      $src.text('rofl');
      expect($elem.text()).to.not.equal($src.text());
    });

    it('() : should preserve parsing options', function() {
      var $ = cheerio.load('<div>π</div>', { decodeEntities: false });
      var $div = $('div');

      expect($div.text()).to.equal($div.clone().text());
    });
  });

  describe('.parseHTML', function() {

    it('() : returns null', function() {
      expect(cheerio.parseHTML()).to.equal(null);
    });

    it('(null) : returns null', function() {
      expect(cheerio.parseHTML(null)).to.equal(null);
    });

    it('("") : returns null', function() {
      expect(cheerio.parseHTML('')).to.equal(null);
    });

    it('(largeHtmlString) : parses large HTML strings', function() {
      var html = new Array(10).join('<div></div>');
      var nodes = cheerio.parseHTML(html);

      expect(nodes.length).to.be.greaterThan(4);
      expect(nodes).to.be.an('array');
    });

    it('("<script>") : ignores scripts by default', function() {
      var html = '<script>undefined()</script>';
      expect(cheerio.parseHTML(html)).to.have.length(0);
    });

    it('("<script>", true) : preserves scripts when requested', function() {
      var html = '<script>undefined()</script>';
      expect(cheerio.parseHTML(html, true)[0].tagName).to.match(/script/i);
    });

    it('("scriptAndNonScript) : preserves non-script nodes', function() {
      var html = '<script>undefined()</script><div></div>';
      expect(cheerio.parseHTML(html)[0].tagName).to.match(/div/i);
    });

    it('(scriptAndNonScript, true) : Preserves script position', function() {
      var html = '<script>undefined()</script><div></div>';
      expect(cheerio.parseHTML(html, true)[0].tagName).to.match(/script/i);
    });

    it('(text) : returns a text node', function() {
      expect(cheerio.parseHTML('text')[0].type).to.be('text');
    });

    it('(\\ttext) : preserves leading whitespace', function() {
      expect(cheerio.parseHTML('\t<div></div>')[0].data).to.equal('\t');
    });

    it('( text) : Leading spaces are treated as text nodes', function() {
      expect(cheerio.parseHTML(' <div/> ')[0].type).to.be('text');
    });

    it('(html) : should preserve content', function() {
      var html = '<div>test div</div>';
      expect(cheerio(cheerio.parseHTML(html)[0]).html()).to.equal('test div');
    });

    it('(malformedHtml) : should not break', function() {
      expect(cheerio.parseHTML('<span><span>')).to.have.length(1);
    });

    it('(garbageInput) : should not cause an error', function() {
      expect(cheerio.parseHTML('<#if><tr><p>This is a test.</p></tr><#/if>') || true).to.be.ok();
    });

  });

  describe('.contains', function() {

    var $;

    beforeEach(function() {
      $ = cheerio.load(fixtures.food);
    });

    it('(container, contained) : should correctly detect the provided element', function() {
      var $food = $('#food');
      var $fruits = $('#fruits');
      var $apple = $('.apple');

      expect($.contains($food[0], $fruits[0])).to.equal(true);
      expect($.contains($food[0], $apple[0])).to.equal(true);
    });

    it('(container, other) : should not detect elements that are not contained', function() {
      var $fruits = $('#fruits');
      var $vegetables = $('#vegetables');
      var $apple = $('.apple');

      expect($.contains($vegetables[0], $apple[0])).to.equal(false);
      expect($.contains($fruits[0], $vegetables[0])).to.equal(false);
      expect($.contains($vegetables[0], $fruits[0])).to.equal(false);
      expect($.contains($fruits[0], $fruits[0])).to.equal(false);
      expect($.contains($vegetables[0], $vegetables[0])).to.equal(false);
    });

  });

  describe('.root', function() {

    it('() : should return a cheerio-wrapped root object', function() {
      var $html = cheerio.load('<div><span>foo</span><span>bar</span></div>');
      $html.root().append('<div id="test"></div>');
      expect($html.html()).to.equal('<div><span>foo</span><span>bar</span></div><div id="test"></div>');
    });

  });

});
