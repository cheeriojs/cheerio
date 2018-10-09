/**
 * This file includes tests for deprecated APIs. The methods are expected to be
 * removed in the next major release of Cheerio, but their stability should be
 * maintained until that time.
 */
var expect = require('expect.js'),
    fixtures = require('../fixtures'),
    cheerio = require('../..');

describe('deprecated APIs', function() {
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
  describe('cheerio module', function() {
    describe('.parseHTML', function() {
      it('(html) : should preserve content', function() {
        var html = '<div>test div</div>';
        expect(cheerio(cheerio.parseHTML(html)[0]).html()).to.equal('test div');
      });
    });

    /**
     * The `.merge` method exported by the Cheerio module is deprecated.
     *
     * In order to promote consistency with the jQuery library, users are
     * encouraged to instead use the static method of the same name. For example:
     *
     *     var $ = cheerio.load('');
     *     $.merge([1, 2], [3, 4]) // [1, 2, 3, 4]
     */
    describe('.merge', function() {
      var arr1, arr2;
      beforeEach(function() {
        arr1 = [1, 2, 3];
        arr2 = [4, 5, 6];
      });

      it('should be a function', function() {
        expect(typeof cheerio.merge).to.equal('function');
      });

      it('(arraylike, arraylike) : should return an array', function() {
        var ret = cheerio.merge(arr1, arr2);
        expect(typeof ret).to.equal('object');
        expect(ret instanceof Array).to.be.ok();
      });

      it('(arraylike, arraylike) : should modify the first array', function() {
        cheerio.merge(arr1, arr2);
        expect(arr1).to.have.length(6);
      });

      it('(arraylike, arraylike) : should not modify the second array', function() {
        cheerio.merge(arr1, arr2);
        expect(arr2).to.have.length(3);
      });

      it('(arraylike, arraylike) : should handle objects that arent arrays, but are arraylike', function() {
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
        cheerio.merge(arr1, arr2);
        expect(arr1).to.have.length(6);
        expect(arr1[3]).to.equal('d');
        expect(arr1[4]).to.equal('e');
        expect(arr1[5]).to.equal('f');
        expect(arr2).to.have.length(3);
      });

      it('(?, ?) : should gracefully reject invalid inputs', function() {
        var ret = cheerio.merge([4], 3);
        expect(ret).to.not.be.ok();
        ret = cheerio.merge({}, {});
        expect(ret).to.not.be.ok();
        ret = cheerio.merge([], {});
        expect(ret).to.not.be.ok();
        ret = cheerio.merge({}, []);
        expect(ret).to.not.be.ok();
        var fakeArray1 = { length: 3 };
        fakeArray1[0] = 'a';
        fakeArray1[1] = 'b';
        fakeArray1[3] = 'd';
        ret = cheerio.merge(fakeArray1, []);
        expect(ret).to.not.be.ok();
        ret = cheerio.merge([], fakeArray1);
        expect(ret).to.not.be.ok();
        fakeArray1 = {};
        fakeArray1.length = '7';
        ret = cheerio.merge(fakeArray1, []);
        expect(ret).to.not.be.ok();
        fakeArray1.length = -1;
        ret = cheerio.merge(fakeArray1, []);
        expect(ret).to.not.be.ok();
      });

      it('(?, ?) : should no-op on invalid inputs', function() {
        var fakeArray1 = { length: 3 };
        fakeArray1[0] = 'a';
        fakeArray1[1] = 'b';
        fakeArray1[3] = 'd';
        cheerio.merge(fakeArray1, []);
        expect(fakeArray1).to.have.length(3);
        expect(fakeArray1[0]).to.equal('a');
        expect(fakeArray1[1]).to.equal('b');
        expect(fakeArray1[3]).to.equal('d');
        cheerio.merge([], fakeArray1);
        expect(fakeArray1).to.have.length(3);
        expect(fakeArray1[0]).to.equal('a');
        expect(fakeArray1[1]).to.equal('b');
        expect(fakeArray1[3]).to.equal('d');
      });
    });

    /**
     * The `.contains` method exported by the Cheerio module is deprecated.
     *
     * In order to promote consistency with the jQuery library, users are
     * encouraged to instead use the static method of the same name. For example:
     *
     *     var $ = cheerio.load('<div><p></p></div>');
     *     $.contains($('div').get(0), $('p').get(0)); // true
     *     $.contains($('p').get(0), $('div').get(0)); // false
     */
    describe('.contains', function() {
      var $;

      beforeEach(function() {
        $ = cheerio.load(fixtures.food);
      });

      it('(container, contained) : should correctly detect the provided element', function() {
        var $food = $('#food');
        var $fruits = $('#fruits');
        var $apple = $('.apple');

        expect(cheerio.contains($food[0], $fruits[0])).to.equal(true);
        expect(cheerio.contains($food[0], $apple[0])).to.equal(true);
      });

      it('(container, other) : should not detect elements that are not contained', function() {
        var $fruits = $('#fruits');
        var $vegetables = $('#vegetables');
        var $apple = $('.apple');

        expect(cheerio.contains($vegetables[0], $apple[0])).to.equal(false);
        expect(cheerio.contains($fruits[0], $vegetables[0])).to.equal(false);
        expect(cheerio.contains($vegetables[0], $fruits[0])).to.equal(false);
        expect(cheerio.contains($fruits[0], $fruits[0])).to.equal(false);
        expect(cheerio.contains($vegetables[0], $vegetables[0])).to.equal(
          false
        );
      });
    });

    /**
     * The `.root` method exported by the Cheerio module is deprecated.
     *
     * Users seeking to access the top-level element of a parsed document should
     * instead use the `root` static method of a "loaded" Cheerio function. For
     * example:
     *
     *     var $ = cheerio.load('');
     *     $.root();
     */
    describe('.root', function() {
      it('returns an empty selection', function() {
        var $empty = cheerio.root();
        expect($empty).to.have.length(0);
      });
    });
  });

  describe('Cheerio function', function() {
    /**
     * The `.load` static method defined on the "loaded" Cheerio factory
     * function is deprecated. Users are encouraged to instead use the `load`
     * function exported by the Cheerio module. For example:
     *
     *     var $ = cheerio.load('<h1>Hello, <span>world</span>.</h1>');
     */
    it('.load', function() {
      var $1 = cheerio.load(fixtures.fruits);
      var $2 = $1.load('<div><p>Some <a>text</a>.</p></div>');

      expect($2('a')).to.have.length(1);
    });

    /**
     * The `.html` static method defined on the "loaded" Cheerio factory function
     * is deprecated.
     *
     * In order to promote consistency with the jQuery library, users are
     * encouraged to instead use the instance method of the same name. For
     * example:
     *
     *     var $ = cheerio.load('<h1>Hello, <span>world</span>.</h1>');
     *     $('h1').html(); // '<h1>Hello, <span>world</span>.'
     *
     * To render the markup of an entire document, invoke the `html` function
     * exported by the Cheerio module with a "root" selection, e.g.
     *
     *     cheerio.html($.root()); // '<html><head></head><body><h1>Hello, <span>world</span>.</h1></body></html>'
     */
    describe('.html - deprecated API', function() {
      it('() : of empty cheerio object should return null', function() {
        // Note: the direct invocation of the Cheerio constructor function is
        // also deprecated.
        var $ = cheerio();
        expect($.html()).to.be(null);
      });

      it('(selector) : should return the outerHTML of the selected element', function() {
        var $ = cheerio.load(fixtures.fruits);
        expect($.html('.pear')).to.equal('<li class="pear">Pear</li>');
      });
    });

    /**
     * The `.xml` static method defined on the "loaded" Cheerio factory function
     * is deprecated. Users are encouraged to instead use the `xml` function
     * exported by the Cheerio module. For example:
     *
     *     cheerio.xml($.root());
     */
    describe('.xml  - deprecated API', function() {
      it('() :  renders XML', function() {
        var $ = cheerio.load('<foo></foo>', { xmlMode: true });
        expect($.xml()).to.equal('<foo/>');
      });
    });

    /**
     * The `.text` static method defined on the "loaded" Cheerio factory function
     * is deprecated.
     *
     * In order to promote consistency with the jQuery library, users are
     * encouraged to instead use the instance method of the same name. For
     * example:
     *
     *     var $ = cheerio.load('<h1>Hello, <span>world</span>.</h1>');
     *     $('h1').text(); // 'Hello, world.'
     *
     * To render the text content of an entire document, invoke the `text`
     * function exported by the Cheerio module with a "root" selection, e.g.
     *
     *     cheerio.text($.root()); // 'Hello, world.'
     */
    describe('.text  - deprecated API', function() {
      it('(cheerio object) : should return the text contents of the specified elements', function() {
        var $ = cheerio.load('<a>This is <em>content</em>.</a>');
        expect($.text($('a'))).to.equal('This is content.');
      });

      it('(cheerio object) : should omit comment nodes', function() {
        var $ = cheerio.load(
          '<a>This is <!-- a comment --> not a comment.</a>'
        );
        expect($.text($('a'))).to.equal('This is  not a comment.');
      });

      it('(cheerio object) : should include text contents of children recursively', function() {
        var $ = cheerio.load(
          '<a>This is <div>a child with <span>another child and <!-- a comment --> not a comment</span> followed by <em>one last child</em> and some final</div> text.</a>'
        );
        expect($.text($('a'))).to.equal(
          'This is a child with another child and  not a comment followed by one last child and some final text.'
        );
      });

      it('() : should return the rendered text content of the root', function() {
        var $ = cheerio.load(
          '<a>This is <div>a child with <span>another child and <!-- a comment --> not a comment</span> followed by <em>one last child</em> and some final</div> text.</a>'
        );
        expect($.text()).to.equal(
          'This is a child with another child and  not a comment followed by one last child and some final text.'
        );
      });

      it('(cheerio object) : should omit script tags', function() {
        var $ = cheerio.load('<script>console.log("test")</script>');
        expect($.text()).to.equal('');
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
        expect($.text()).to.equal(
          'Welcome Hello, testing text function,End of messege'
        );
      });
    });
  });
});
