'use strict';
const fixtures = require('../__fixtures__/fixtures');
const cheerio = require('../..');

describe('cheerio', () => {
  describe('.html', () => {
    it('() : should return innerHTML; $.html(obj) should return outerHTML', () => {
      const $div = cheerio(
        'div',
        '<div><span>foo</span><span>bar</span></div>'
      );
      const span = $div.children()[1];
      expect(cheerio(span).html()).toBe('bar');
      expect(cheerio.html(span)).toBe('<span>bar</span>');
    });

    it('(<obj>) : should accept an object, an array, or a cheerio object', () => {
      const $span = cheerio('<span>foo</span>');
      expect(cheerio.html($span[0])).toBe('<span>foo</span>');
      expect(cheerio.html($span)).toBe('<span>foo</span>');
    });

    it('(<value>) : should be able to set to an empty string', () => {
      const $elem = cheerio('<span>foo</span>').html('');
      expect(cheerio.html($elem)).toBe('<span></span>');
    });

    it('(<root>) : does not render the root element', () => {
      const $ = cheerio.load('');
      expect(cheerio.html($.root())).toBe(
        '<html><head></head><body></body></html>'
      );
    });

    it('(<elem>, <root>, <elem>) : does not render the root element', () => {
      const $ = cheerio.load('<div>a div</div><span>a span</span>');
      const $collection = $('div').add($.root()).add('span');
      const expected =
        '<html><head></head><body><div>a div</div><span>a span</span></body></html><div>a div</div><span>a span</span>';
      expect(cheerio.html($collection)).toBe(expected);
    });
  });

  describe('.text', () => {
    it('(cheerio object) : should return the text contents of the specified elements', () => {
      const $ = cheerio.load('<a>This is <em>content</em>.</a>');
      expect(cheerio.text($('a'))).toBe('This is content.');
    });

    it('(cheerio object) : should omit comment nodes', () => {
      const $ = cheerio.load(
        '<a>This is <!-- a comment --> not a comment.</a>'
      );
      expect(cheerio.text($('a'))).toBe('This is  not a comment.');
    });

    it('(cheerio object) : should include text contents of children recursively', () => {
      const $ = cheerio.load(
        '<a>This is <div>a child with <span>another child and <!-- a comment --> not a comment</span> followed by <em>one last child</em> and some final</div> text.</a>'
      );
      expect(cheerio.text($('a'))).toBe(
        'This is a child with another child and  not a comment followed by one last child and some final text.'
      );
    });

    it('() : should return the rendered text content of the root', () => {
      const $ = cheerio.load(
        '<a>This is <div>a child with <span>another child and <!-- a comment --> not a comment</span> followed by <em>one last child</em> and some final</div> text.</a>'
      );
      expect(cheerio.text($.root())).toBe(
        'This is a child with another child and  not a comment followed by one last child and some final text.'
      );
    });

    it('(cheerio object) : should omit script tags', () => {
      const $ = cheerio.load('<script>console.log("test")</script>');
      expect(cheerio.text($.root())).toBe('');
    });

    it('(cheerio object) : should omit style tags', () => {
      const $ = cheerio.load(
        '<style type="text/css">.cf-hidden { display: none; } .cf-invisible { visibility: hidden; }</style>'
      );
      expect($.text()).toBe('');
    });

    it('(cheerio object) : should include text contents of children omitting style and script tags', () => {
      const $ = cheerio.load(
        '<body>Welcome <div>Hello, testing text function,<script>console.log("hello")</script></div><style type="text/css">.cf-hidden { display: none; }</style>End of messege</body>'
      );
      expect(cheerio.text($.root())).toBe(
        'Welcome Hello, testing text function,End of messege'
      );
    });
  });

  describe('.load', () => {
    it('(html) : should retain original root after creating a new node', () => {
      const $ = cheerio.load('<body><ul id="fruits"></ul></body>');
      expect($('body')).toHaveLength(1);
      $('<script>');
      expect($('body')).toHaveLength(1);
    });

    it('(html) : should handle lowercase tag options', () => {
      const $ = cheerio.load('<BODY><ul id="fruits"></ul></BODY>', {
        xml: { lowerCaseTags: true },
      });
      expect($.html()).toBe('<body><ul id="fruits"/></body>');
    });

    it('(html) : should handle the `normalizeWhitepace` option', () => {
      const $ = cheerio.load('<body><b>foo</b>  <b>bar</b></body>', {
        xml: { normalizeWhitespace: true },
      });
      expect($.html()).toBe('<body><b>foo</b> <b>bar</b></body>');
    });

    it('(html) : should handle xml tag option', () => {
      const $ = cheerio.load('<body><script><foo></script></body>', {
        xml: true,
      });
      expect($('script')[0].children[0].type).toBe('tag');
    });

    it('(buffer) : should accept a buffer', () => {
      const html = '<html><head></head><body>foo</body></html>';
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      const $html = cheerio.load(Buffer.from(html));
      expect($html.html()).toBe(html);
    });
  });

  describe('.clone', () => {
    it('() : should return a copy', () => {
      const $src = cheerio(
        '<div><span>foo</span><span>bar</span><span>baz</span></div>'
      ).children();
      const $elem = $src.clone();
      expect($elem.length).toBe(3);
      expect($elem.parent()).toHaveLength(0);
      expect($elem.text()).toBe($src.text());
      $src.text('rofl');
      expect($elem.text()).not.toBe($src.text());
    });

    it('() : should return a copy of document', () => {
      const $src = cheerio
        .load('<html><body><div>foo</div>bar</body></html>')
        .root()
        .children();
      const $elem = $src.clone();
      expect($elem.length).toBe(1);
      expect($elem.parent()).toHaveLength(0);
      expect($elem.text()).toBe($src.text());
      $src.text('rofl');
      expect($elem.text()).not.toBe($src.text());
    });

    it('() : should preserve parsing options', () => {
      const $ = cheerio.load('<div>π</div>', { decodeEntities: false });
      const $div = $('div');

      expect($div.text()).toBe($div.clone().text());
    });
  });

  describe('.parseHTML', () => {
    const $ = cheerio.load('');

    it('() : returns null', () => {
      expect($.parseHTML()).toBe(null);
    });

    it('(null) : returns null', () => {
      expect($.parseHTML(null)).toBe(null);
    });

    it('("") : returns null', () => {
      expect($.parseHTML('')).toBe(null);
    });

    it('(largeHtmlString) : parses large HTML strings', () => {
      const html = new Array(10).join('<div></div>');
      const nodes = $.parseHTML(html);

      expect(nodes.length).toBeGreaterThan(4);
      expect(nodes).toBeInstanceOf(Array);
    });

    it('("<script>") : ignores scripts by default', () => {
      const html = '<script>undefined()</script>';
      expect($.parseHTML(html)).toHaveLength(0);
    });

    it('("<script>", true) : preserves scripts when requested', () => {
      const html = '<script>undefined()</script>';
      expect($.parseHTML(html, true)[0].tagName).toMatch(/script/i);
    });

    it('("scriptAndNonScript) : preserves non-script nodes', () => {
      const html = '<script>undefined()</script><div></div>';
      expect($.parseHTML(html)[0].tagName).toMatch(/div/i);
    });

    it('(scriptAndNonScript, true) : Preserves script position', () => {
      const html = '<script>undefined()</script><div></div>';
      expect($.parseHTML(html, true)[0].tagName).toMatch(/script/i);
    });

    it('(text) : returns a text node', () => {
      expect($.parseHTML('text')[0].type).toBe('text');
    });

    it('(\\ttext) : preserves leading whitespace', () => {
      expect($.parseHTML('\t<div></div>')[0].data).toBe('\t');
    });

    it('( text) : Leading spaces are treated as text nodes', () => {
      expect($.parseHTML(' <div/> ')[0].type).toBe('text');
    });

    it('(html) : should preserve content', () => {
      const html = '<div>test div</div>';
      expect(cheerio($.parseHTML(html)[0]).html()).toBe('test div');
    });

    it('(malformedHtml) : should not break', () => {
      expect($.parseHTML('<span><span>')).toHaveLength(1);
    });

    it('(garbageInput) : should not cause an error', () => {
      expect(
        $.parseHTML('<#if><tr><p>This is a test.</p></tr><#/if>') || true
      ).toBeTruthy();
    });

    it('(text) : should return an array that is not effected by DOM manipulation methods', () => {
      const $div = cheerio.load('<div>');
      const elems = $div.parseHTML('<b></b><i></i>');

      $div('div').append(elems);

      expect(elems).toHaveLength(2);
    });
  });

  describe('.merge', () => {
    const $ = cheerio.load('');
    let arr1;
    let arr2;

    beforeEach(() => {
      arr1 = [1, 2, 3];
      arr2 = [4, 5, 6];
    });

    it('should be a function', () => {
      expect(typeof $.merge).toBe('function');
    });

    it('(arraylike, arraylike) : should return an array', () => {
      const ret = $.merge(arr1, arr2);
      expect(typeof ret).toBe('object');
      expect(Array.isArray(ret)).toBe(true);
    });

    it('(arraylike, arraylike) : should modify the first array', () => {
      $.merge(arr1, arr2);
      expect(arr1).toHaveLength(6);
    });

    it('(arraylike, arraylike) : should not modify the second array', () => {
      $.merge(arr1, arr2);
      expect(arr2).toHaveLength(3);
    });

    it('(arraylike, arraylike) : should handle objects that arent arrays, but are arraylike', () => {
      arr1 = {};
      arr2 = {};
      arr1.length = 3;
      arr1[0] = 'a';
      arr1[1] = 'b';
      arr1[2] = 'c';
      arr2.length = 3;
      arr2[0] = 'd';
      arr2[1] = 'e';
      arr2[2] = 'f';
      $.merge(arr1, arr2);
      expect(arr1).toHaveLength(6);
      expect(arr1[3]).toBe('d');
      expect(arr1[4]).toBe('e');
      expect(arr1[5]).toBe('f');
      expect(arr2).toHaveLength(3);
    });

    it('(?, ?) : should gracefully reject invalid inputs', () => {
      let ret = $.merge([4], 3);
      expect(ret).toBeFalsy();
      ret = $.merge({}, {});
      expect(ret).toBeFalsy();
      ret = $.merge([], {});
      expect(ret).toBeFalsy();
      ret = $.merge({}, []);
      expect(ret).toBeFalsy();
      let fakeArray1 = { length: 3 };
      fakeArray1[0] = 'a';
      fakeArray1[1] = 'b';
      fakeArray1[3] = 'd';
      ret = $.merge(fakeArray1, []);
      expect(ret).toBeFalsy();
      ret = $.merge([], fakeArray1);
      expect(ret).toBeFalsy();
      fakeArray1 = {};
      fakeArray1.length = '7';
      ret = $.merge(fakeArray1, []);
      expect(ret).toBeFalsy();
      fakeArray1.length = -1;
      ret = $.merge(fakeArray1, []);
      expect(ret).toBeFalsy();
    });

    it('(?, ?) : should no-op on invalid inputs', () => {
      const fakeArray1 = { length: 3 };
      fakeArray1[0] = 'a';
      fakeArray1[1] = 'b';
      fakeArray1[3] = 'd';
      $.merge(fakeArray1, []);
      expect(fakeArray1).toHaveLength(3);
      expect(fakeArray1[0]).toBe('a');
      expect(fakeArray1[1]).toBe('b');
      expect(fakeArray1[3]).toBe('d');
      $.merge([], fakeArray1);
      expect(fakeArray1).toHaveLength(3);
      expect(fakeArray1[0]).toBe('a');
      expect(fakeArray1[1]).toBe('b');
      expect(fakeArray1[3]).toBe('d');
    });
  });

  describe('.contains', () => {
    let $;

    beforeEach(() => {
      $ = cheerio.load(fixtures.food);
    });

    it('(container, contained) : should correctly detect the provided element', () => {
      const $food = $('#food');
      const $fruits = $('#fruits');
      const $apple = $('.apple');

      expect($.contains($food[0], $fruits[0])).toBe(true);
      expect($.contains($food[0], $apple[0])).toBe(true);
    });

    it('(container, other) : should not detect elements that are not contained', () => {
      const $fruits = $('#fruits');
      const $vegetables = $('#vegetables');
      const $apple = $('.apple');

      expect($.contains($vegetables[0], $apple[0])).toBe(false);
      expect($.contains($fruits[0], $vegetables[0])).toBe(false);
      expect($.contains($vegetables[0], $fruits[0])).toBe(false);
      expect($.contains($fruits[0], $fruits[0])).toBe(false);
      expect($.contains($vegetables[0], $vegetables[0])).toBe(false);
    });
  });

  describe('.root', () => {
    it('() : should return a cheerio-wrapped root object', () => {
      const $ = cheerio.load('<html><head></head><body>foo</body></html>');
      $.root().append('<div id="test"></div>');
      expect($.html()).toBe(
        '<html><head></head><body>foo</body></html><div id="test"></div>'
      );
    });
  });
});
