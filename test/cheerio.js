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
