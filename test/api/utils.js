var expect = require('expect.js'),
  fixtures = require('../fixtures'),
  cheerio = require('../..');

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
  });

  describe('.text', function() {
    it('(cheerio object) : should return the text contents of the specified elements', function() {
      var $ = cheerio.load('<a>This is <em>content</em>.</a>');
      expect(cheerio.text($('a'))).to.equal('This is content.');
    });

    it('(cheerio object) : should omit comment nodes', function() {
      var $ = cheerio.load('<a>This is <!-- a comment --> not a comment.</a>');
      expect(cheerio.text($('a'))).to.equal('This is  not a comment.');
    });

    it('(cheerio object) : should include text contents of children recursively', function() {
      var $ = cheerio.load(
        '<a>This is <div>a child with <span>another child and <!-- a comment --> not a comment</span> followed by <em>one last child</em> and some final</div> text.</a>'
      );
      expect(cheerio.text($('a'))).to.equal(
        'This is a child with another child and  not a comment followed by one last child and some final text.'
      );
    });

    it('() : should return the rendered text content of the root', function() {
      var $ = cheerio.load(
        '<a>This is <div>a child with <span>another child and <!-- a comment --> not a comment</span> followed by <em>one last child</em> and some final</div> text.</a>'
      );
      expect(cheerio.text($.root())).to.equal(
        'This is a child with another child and  not a comment followed by one last child and some final text.'
      );
    });

    it('(cheerio object) : should omit script tags', function() {
      var $ = cheerio.load('<script>console.log("test")</script>');
      expect(cheerio.text($.root())).to.equal('');
    });

    it('(cheerio object) : should omit style tags', function() {
      var $ = cheerio.load(
        '<style type="text/css">.cf-hidden { display: none; } .cf-invisible { visibility: hidden; }</style>'
      );
      expect($.text()).to.equal('');
    });

    it('(cheerio object) : should include text contents of children omiting style and script tags', function() {
      var $ = cheerio.load(
        '<body>Welcome <div>Hello, testing text function,<script>console.log("hello")</script></div><style type="text/css">.cf-hidden { display: none; }</style>End of messege</body>'
      );
      expect(cheerio.text($.root())).to.equal(
        'Welcome Hello, testing text function,End of messege'
      );
    });
  });

  describe('.load', function() {
    it('(html) : should retain original root after creating a new node', function() {
      var $ = cheerio.load('<body><ul id="fruits"></ul></body>');
      expect($('body')).to.have.length(1);
      $('<script>');
      expect($('body')).to.have.length(1);
    });

    it('(html) : should handle lowercase tag options', function() {
      var $ = cheerio.load('<BODY><ul id="fruits"></ul></BODY>', {
        xml: { lowerCaseTags: true }
      });
      expect($.html()).to.be('<body><ul id="fruits"/></body>');
    });

    it('(html) : should handle the `normalizeWhitepace` option', function() {
      var $ = cheerio.load('<body><b>foo</b>  <b>bar</b></body>', {
        xml: { normalizeWhitespace: true }
      });
      expect($.html()).to.be('<body><b>foo</b> <b>bar</b></body>');
    });

    // TODO:
    // it('(html) : should handle xml tag option', function() {
    //   var $ = $.load('<body><script>oh hai</script></body>', { xml : true });
    //   console.log($('script')[0].type);
    //   expect($('script')[0].type).to.be('tag');
    // });

    it('(buffer) : should accept a buffer', function() {
      var html = '<html><head></head><body>foo</body></html>';
      var buf =
        Buffer.from && Buffer.from !== Uint8Array.from
          ? Buffer.from(html)
          : new Buffer(html);
      var $html = cheerio.load(buf);
      expect($html.html()).to.be(html);
    });
  });

  describe('.clone', function() {
    it('() : should return a copy', function() {
      var $src = cheerio(
        '<div><span>foo</span><span>bar</span><span>baz</span></div>'
      ).children();
      var $elem = $src.clone();
      expect($elem.length).to.equal(3);
      expect($elem.parent()).to.have.length(0);
      expect($elem.text()).to.equal($src.text());
      $src.text('rofl');
      expect($elem.text()).to.not.equal($src.text());
    });

    it('() : should return a copy of document', function() {
      var $src = cheerio
        .load('<html><body><div>foo</div>bar</body></html>')
        .root()
        .children();
      var $elem = $src.clone();
      expect($elem.length).to.equal(1);
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
    var $ = cheerio.load('');

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
      expect($.parseHTML(html, true)[0].tagName).to.match(/script/i);
    });

    it('("scriptAndNonScript) : preserves non-script nodes', function() {
      var html = '<script>undefined()</script><div></div>';
      expect($.parseHTML(html)[0].tagName).to.match(/div/i);
    });

    it('(scriptAndNonScript, true) : Preserves script position', function() {
      var html = '<script>undefined()</script><div></div>';
      expect($.parseHTML(html, true)[0].tagName).to.match(/script/i);
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
      expect(cheerio($.parseHTML(html)[0]).html()).to.equal('test div');
    });

    it('(malformedHtml) : should not break', function() {
      expect($.parseHTML('<span><span>')).to.have.length(1);
    });

    it('(garbageInput) : should not cause an error', function() {
      expect(
        $.parseHTML('<#if><tr><p>This is a test.</p></tr><#/if>') || true
      ).to.be.ok();
    });

    it('(text) : should return an array that is not effected by DOM manipulation methods', function() {
      var $ = cheerio.load('<div>');
      var elems = $.parseHTML('<b></b><i></i>');

      $('div').append(elems);

      expect(elems).to.have.length(2);
    });
  });

  /**
   * The `.parseHTML` method exported by the Cheerio module is deprecated.
   *
   * In order to promote consistency with the jQuery library, users are
   * encouraged to instead use the static method of the same name as it is
   * defined on the "loaded" Cheerio factory function. For example:
   *
   *     var $ = cheerio.load('');
   *     $.parseHTML('<b>markup</b>');
   */
  describe('.parseHTML - deprecated API', function() {
    it('(html) : should preserve content', function() {
      var html = '<div>test div</div>';
      expect(cheerio(cheerio.parseHTML(html)[0]).html()).to.equal('test div');
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
      var $ = cheerio.load('<html><head></head><body>foo</body></html>');
      $.root().append('<div id="test"></div>');
      expect($.html()).to.equal(
        '<html><head></head><body>foo</body></html><div id="test"></div>'
      );
    });
  });
});
