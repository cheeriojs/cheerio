var expect = require('expect.js'),
    htmlparser2 = require('htmlparser2'),
    cheerio = require('../'),
    fixtures = require('./fixtures'),
    fruits = fixtures.fruits,
    food = fixtures.food,
    _ = {
      filter: require('lodash/filter')
    };

// HTML
var script = '<script src="script.js" type="text/javascript"></script>',
    multiclass = '<p><a class="btn primary" href="#">Save</a></p>';

describe('cheerio', function() {
  it('should get the version', function() {
    expect(/\d+\.\d+\.\d+/.test(cheerio.version)).to.be.ok();
  });

  it('cheerio(null) should return be empty', function() {
    expect(cheerio(null)).to.be.empty();
  });

  it('cheerio(undefined) should be empty', function() {
    expect(cheerio(undefined)).to.be.empty();
  });

  it('cheerio(null) should be empty', function() {
    expect(cheerio('')).to.be.empty();
  });

  it('cheerio(selector) with no context or root should be empty', function() {
    expect(cheerio('.h2')).to.be.empty();
    expect(cheerio('#fruits')).to.be.empty();
  });

  it('cheerio(node) : should override previously-loaded nodes', function() {
    var $ = cheerio.load('<div><span></span></div>');
    var spanNode = $('span')[0];
    var $span = $(spanNode);
    expect($span[0]).to.equal(spanNode);
  });

  it('should be able to create html without a root or context', function() {
    var $h2 = cheerio('<h2>');
    expect($h2).to.not.be.empty();
    expect($h2).to.have.length(1);
    expect($h2[0].tagName).to.equal('h2');
  });

  it('should be able to create complicated html', function() {
    var $script = cheerio(script);
    expect($script).to.not.be.empty();
    expect($script).to.have.length(1);
    expect($script[0].attribs.src).to.equal('script.js');
    expect($script[0].attribs.type).to.equal('text/javascript');
    expect($script[0].childNodes).to.be.empty();
  });

  var testAppleSelect = function($apple) {
    expect($apple).to.have.length(1);
    $apple = $apple[0];
    expect($apple.parentNode.tagName).to.equal('ul');
    expect($apple.prev).to.be(null);
    expect($apple.next.attribs['class']).to.equal('orange');
    expect($apple.childNodes).to.have.length(1);
    expect($apple.childNodes[0].data).to.equal('Apple');
  };

  it('should be able to select .apple with only a context', function() {
    var $apple = cheerio('.apple', fruits);
    testAppleSelect($apple);
  });

  it('should be able to select .apple with a node as context', function() {
    var $apple = cheerio('.apple', cheerio(fruits)[0]);
    testAppleSelect($apple);
  });

  it('should be able to select .apple with only a root', function() {
    var $apple = cheerio('.apple', null, fruits);
    testAppleSelect($apple);
  });

  it('should be able to select an id', function() {
    var $fruits = cheerio('#fruits', null, fruits);
    expect($fruits).to.have.length(1);
    expect($fruits[0].attribs.id).to.equal('fruits');
  });

  it('should be able to select a tag', function() {
    var $ul = cheerio('ul', fruits);
    expect($ul).to.have.length(1);
    expect($ul[0].tagName).to.equal('ul');
  });

  it('should accept a node reference as a context', function() {
    var $elems = cheerio('<div><span></span></div>');
    expect(cheerio('span', $elems[0])).to.have.length(1);
  });

  it('should accept an array of node references as a context', function() {
    var $elems = cheerio('<div><span></span></div>');
    expect(cheerio('span', $elems.toArray())).to.have.length(1);
  });

  it('should select only elements inside given context (Issue #193)', function() {
    var $ = cheerio.load(food),
        $fruits = $('#fruits'),
        fruitElements = $('li', $fruits);

    expect(fruitElements).to.have.length(3);
  });

  it('should be able to select multiple tags', function() {
    var $fruits = cheerio('li', null, fruits);
    expect($fruits).to.have.length(3);
    var classes = ['apple', 'orange', 'pear'];
    $fruits.each(function(idx, $fruit) {
      expect($fruit.attribs['class']).to.equal(classes[idx]);
    });
  });

  it('should be able to do: cheerio("#fruits .apple")', function() {
    var $apple = cheerio('#fruits .apple', fruits);
    testAppleSelect($apple);
  });

  it('should be able to do: cheerio("li.apple")', function() {
    var $apple = cheerio('li.apple', fruits);
    testAppleSelect($apple);
  });

  it('should be able to select by attributes', function() {
    var $apple = cheerio('li[class=apple]', fruits);
    testAppleSelect($apple);
  });

  it('should be able to select multiple classes: cheerio(".btn.primary")', function() {
    var $a = cheerio('.btn.primary', multiclass);
    expect($a).to.have.length(1);
    expect($a[0].childNodes[0].data).to.equal('Save');
  });

  it('should not create a top-level node', function() {
    var $elem = cheerio('* div', '<div>');
    expect($elem).to.have.length(0);
  });

  it('should be able to select multiple elements: cheerio(".apple, #fruits")', function() {
    var $elems = cheerio('.apple, #fruits', fruits);
    expect($elems).to.have.length(2);

    var $apple = _.filter($elems, function(elem) {
      return elem.attribs['class'] === 'apple';
    });
    var $fruits = _.filter($elems, function(elem) {
      return elem.attribs.id === 'fruits';
    });
    testAppleSelect($apple);
    expect($fruits[0].attribs.id).to.equal('fruits');
  });

  it('should select first element cheerio(:first)');
  // var $elem = cheerio(':first', fruits);
  // var $h2 = cheerio('<h2>fruits</h2>');
  // console.log($elem.before('hi'));
  // console.log($elem.before($h2));

  it('should be able to select immediate children: cheerio("#fruits > .pear")', function() {
    var $food = cheerio(food);
    cheerio('.pear', $food).append('<li class="pear">Another Pear!</li>');
    expect(cheerio('#fruits .pear', $food)).to.have.length(2);
    var $elem = cheerio('#fruits > .pear', $food);
    expect($elem).to.have.length(1);
    expect($elem.attr('class')).to.equal('pear');
  });

  it('should be able to select immediate children: cheerio(".apple + .pear")', function() {
    var $elem = cheerio('.apple + li', fruits);
    expect($elem).to.have.length(1);
    $elem = cheerio('.apple + .pear', fruits);
    expect($elem).to.have.length(0);
    $elem = cheerio('.apple + .orange', fruits);
    expect($elem).to.have.length(1);
    expect($elem.attr('class')).to.equal('orange');
  });

  it('should be able to select immediate children: cheerio(".apple ~ .pear")', function() {
    var $elem = cheerio('.apple ~ li', fruits);
    expect($elem).to.have.length(2);
    $elem = cheerio('.apple ~ .pear', fruits);
    expect($elem.attr('class')).to.equal('pear');
  });

  it('should handle wildcards on attributes: cheerio("li[class*=r]")', function() {
    var $elem = cheerio('li[class*=r]', fruits);
    expect($elem).to.have.length(2);
    expect($elem.eq(0).attr('class')).to.equal('orange');
    expect($elem.eq(1).attr('class')).to.equal('pear');
  });

  it('should handle beginning of attr selectors: cheerio("li[class^=o]")', function() {
    var $elem = cheerio('li[class^=o]', fruits);
    expect($elem).to.have.length(1);
    expect($elem.eq(0).attr('class')).to.equal('orange');
  });

  it('should handle beginning of attr selectors: cheerio("li[class$=e]")', function() {
    var $elem = cheerio('li[class$=e]', fruits);
    expect($elem).to.have.length(2);
    expect($elem.eq(0).attr('class')).to.equal('apple');
    expect($elem.eq(1).attr('class')).to.equal('orange');
  });

  it('should gracefully degrade on complex, unmatched queries', function() {
    var $elem = cheerio('Eastern States Cup #8-fin&nbsp;<br>Downhill&nbsp;');
    expect($elem).to.have.length(0); // []
  });

  it('(extended Array) should not interfere with prototype methods (issue #119)', function() {
    var extended = [];
    extended.find = extended.children = extended.each = function() {};
    var $empty = cheerio(extended);

    expect($empty.find).to.be(cheerio.prototype.find);
    expect($empty.children).to.be(cheerio.prototype.children);
    expect($empty.each).to.be(cheerio.prototype.each);
  });

  it('should set html(number) as a string', function() {
    var $elem = cheerio('<div>');
    $elem.html(123);
    expect(typeof $elem.text()).to.equal('string');
  });

  it('should set text(number) as a string', function() {
    var $elem = cheerio('<div>');
    $elem.text(123);
    expect(typeof $elem.text()).to.equal('string');
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
  describe('.merge - deprecated API', function() {
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
      var $ = cheerio.load('<a>This is <!-- a comment --> not a comment.</a>');
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

  describe('.load', function() {
    it('should generate selections as proper instances', function() {
      var $ = cheerio.load(fruits);

      expect($('.apple')).to.be.a($);
    });

    it('should be able to filter down using the context', function() {
      var $ = cheerio.load(fruits),
          apple = $('.apple', 'ul'),
          lis = $('li', 'ul');

      expect(apple).to.have.length(1);
      expect(lis).to.have.length(3);
    });

    /**
     * The `.load` static method defined on the "loaded" Cheerio factory
     * function is deprecated. Users are encouraged to instead use the `load`
     * function exported by the Cheerio module. For example:
     *
     *     var $ = cheerio.load('<h1>Hello, <span>world</span>.</h1>');
     */
    it('should be available as a static method on the "loaded" factory function (deprecated API)', function() {
      var $1 = cheerio.load(fruits);
      var $2 = $1.load('<div><p>Some <a>text</a>.</p></div>');

      expect($2('a')).to.have.length(1);
    });

    it('should allow loading a pre-parsed DOM', function() {
      var dom = htmlparser2.parseDOM(food),
          $ = cheerio.load(dom);

      expect($('ul')).to.have.length(3);
    });

    it('should render xml in html() when options.xml = true', function() {
      var str = '<MixedCaseTag UPPERCASEATTRIBUTE=""></MixedCaseTag>',
          expected = '<MixedCaseTag UPPERCASEATTRIBUTE=""/>',
          $ = cheerio.load(str, { xml: true });

      expect($('MixedCaseTag').get(0).tagName).to.equal('MixedCaseTag');
      expect($.html()).to.be(expected);
    });

    it('should render xml in html() when options.xml = true passed to html()', function() {
      var str = '<MixedCaseTag UPPERCASEATTRIBUTE=""></MixedCaseTag>',
          // since parsing done without xml flag, all tags converted to lowercase
          expectedXml =
          '<html><head/><body><mixedcasetag uppercaseattribute=""/></body></html>',
          expectedNoXml =
          '<html><head></head><body><mixedcasetag uppercaseattribute=""></mixedcasetag></body></html>',
          $ = cheerio.load(str);

      expect($('MixedCaseTag').get(0).tagName).to.equal('mixedcasetag');
      expect($.html()).to.be(expectedNoXml);
      expect($.html({ xml: true })).to.be(expectedXml);
    });

    it('should respect options on the element level', function() {
      var str =
          '<!doctype html><html><head><title>Some test</title></head><body><footer><p>Copyright &copy; 2003-2014</p></footer></body></html>',
          expectedHtml = '<p>Copyright &copy; 2003-2014</p>',
          expectedXml = '<p>Copyright © 2003-2014</p>',
          domNotEncoded = cheerio.load(str, { xml: { decodeEntities: false } }),
          domEncoded = cheerio.load(str);

      expect(domNotEncoded('footer').html()).to.be(expectedHtml);
      // TODO: Make it more html friendly, maybe with custom encode tables
      expect(domEncoded('footer').html()).to.be(expectedXml);
    });

    it('should return a fully-qualified Function', function() {
      var $ = cheerio.load('<div>');

      expect($).to.be.a(Function);
    });

    describe('prototype extensions', function() {
      it('should honor extensions defined on `prototype` property', function() {
        var $ = cheerio.load('<div>');
        var $div;
        $.prototype.myPlugin = function() {
          return {
            context: this,
            args: arguments
          };
        };

        $div = $('div');

        expect($div.myPlugin).to.be.a('function');
        expect($div.myPlugin().context).to.be($div);
        expect(Array.prototype.slice.call($div.myPlugin(1, 2, 3).args)).to.eql([
          1,
          2,
          3
        ]);
      });

      it('should honor extensions defined on `fn` property', function() {
        var $ = cheerio.load('<div>');
        var $div;
        $.fn.myPlugin = function() {
          return {
            context: this,
            args: arguments
          };
        };

        $div = $('div');

        expect($div.myPlugin).to.be.a('function');
        expect($div.myPlugin().context).to.be($div);
        expect(Array.prototype.slice.call($div.myPlugin(1, 2, 3).args)).to.eql([
          1,
          2,
          3
        ]);
      });

      it('should isolate extensions between loaded functions', function() {
        var $a = cheerio.load('<div>');
        var $b = cheerio.load('<div>');

        $a.prototype.foo = function() {};

        expect($b('div').foo).to.be(undefined);
      });
    });
  });
});
