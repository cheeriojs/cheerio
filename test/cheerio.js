'use strict';
var htmlparser2 = require('htmlparser2');
var cheerio = require('..');
var utils = require('../lib/utils');
var fixtures = require('./__fixtures__/fixtures');
var fruits = fixtures.fruits;
var food = fixtures.food;

// HTML
var script = '<script src="script.js" type="text/javascript"></script>';
var multiclass = '<p><a class="btn primary" href="#">Save</a></p>';

describe('cheerio', function () {
  it('should get the version', function () {
    expect(cheerio.version).toMatch(/\d+\.\d+\.\d+/);
  });

  it('cheerio(null) should return be empty', function () {
    expect(cheerio(null)).toHaveLength(0);
  });

  it('cheerio(undefined) should be empty', function () {
    expect(cheerio(undefined)).toHaveLength(0);
  });

  it('cheerio(null) should be empty', function () {
    expect(cheerio('')).toHaveLength(0);
  });

  it('cheerio(selector) with no context or root should be empty', function () {
    expect(cheerio('.h2')).toHaveLength(0);
    expect(cheerio('#fruits')).toHaveLength(0);
  });

  it('cheerio(node) : should override previously-loaded nodes', function () {
    var $ = cheerio.load('<div><span></span></div>');
    var spanNode = $('span')[0];
    var $span = $(spanNode);
    expect($span[0]).toBe(spanNode);
  });

  it('should be able to create html without a root or context', function () {
    var $h2 = cheerio('<h2>');
    expect($h2).not.toHaveLength(0);
    expect($h2).toHaveLength(1);
    expect($h2[0].tagName).toBe('h2');
  });

  it('should be able to create complicated html', function () {
    var $script = cheerio(script);
    expect($script).not.toHaveLength(0);
    expect($script).toHaveLength(1);
    expect($script[0].attribs.src).toBe('script.js');
    expect($script[0].attribs.type).toBe('text/javascript');
    expect($script[0].childNodes).toHaveLength(0);
  });

  function testAppleSelect($apple) {
    expect($apple).toHaveLength(1);
    $apple = $apple[0];
    expect($apple.parentNode.tagName).toBe('ul');
    expect($apple.prev).toBe(null);
    expect($apple.next.attribs['class']).toBe('orange');
    expect($apple.childNodes).toHaveLength(1);
    expect($apple.childNodes[0].data).toBe('Apple');
  }

  // eslint-disable-next-line jest/expect-expect
  it('should be able to select .apple with only a context', function () {
    var $apple = cheerio('.apple', fruits);
    testAppleSelect($apple);
  });

  // eslint-disable-next-line jest/expect-expect
  it('should be able to select .apple with a node as context', function () {
    var $apple = cheerio('.apple', cheerio(fruits)[0]);
    testAppleSelect($apple);
  });

  // eslint-disable-next-line jest/expect-expect
  it('should be able to select .apple with only a root', function () {
    var $apple = cheerio('.apple', null, fruits);
    testAppleSelect($apple);
  });

  it('should be able to select an id', function () {
    var $fruits = cheerio('#fruits', null, fruits);
    expect($fruits).toHaveLength(1);
    expect($fruits[0].attribs.id).toBe('fruits');
  });

  it('should be able to select a tag', function () {
    var $ul = cheerio('ul', fruits);
    expect($ul).toHaveLength(1);
    expect($ul[0].tagName).toBe('ul');
  });

  it('should accept a node reference as a context', function () {
    var $elems = cheerio('<div><span></span></div>');
    expect(cheerio('span', $elems[0])).toHaveLength(1);
  });

  it('should accept an array of node references as a context', function () {
    var $elems = cheerio('<div><span></span></div>');
    expect(cheerio('span', $elems.toArray())).toHaveLength(1);
  });

  it('should select only elements inside given context (Issue #193)', function () {
    var $ = cheerio.load(food);
    var $fruits = $('#fruits');
    var fruitElements = $('li', $fruits);

    expect(fruitElements).toHaveLength(3);
  });

  it('should be able to select multiple tags', function () {
    var $fruits = cheerio('li', null, fruits);
    expect($fruits).toHaveLength(3);
    var classes = ['apple', 'orange', 'pear'];
    $fruits.each(function (idx, $fruit) {
      expect($fruit.attribs['class']).toBe(classes[idx]);
    });
  });

  // eslint-disable-next-line jest/expect-expect
  it('should be able to do: cheerio("#fruits .apple")', function () {
    var $apple = cheerio('#fruits .apple', fruits);
    testAppleSelect($apple);
  });

  // eslint-disable-next-line jest/expect-expect
  it('should be able to do: cheerio("li.apple")', function () {
    var $apple = cheerio('li.apple', fruits);
    testAppleSelect($apple);
  });

  // eslint-disable-next-line jest/expect-expect
  it('should be able to select by attributes', function () {
    var $apple = cheerio('li[class=apple]', fruits);
    testAppleSelect($apple);
  });

  it('should be able to select multiple classes: cheerio(".btn.primary")', function () {
    var $a = cheerio('.btn.primary', multiclass);
    expect($a).toHaveLength(1);
    expect($a[0].childNodes[0].data).toBe('Save');
  });

  it('should not create a top-level node', function () {
    var $elem = cheerio('* div', '<div>');
    expect($elem).toHaveLength(0);
  });

  it('should be able to select multiple elements: cheerio(".apple, #fruits")', function () {
    var $elems = cheerio('.apple, #fruits', fruits);
    expect($elems).toHaveLength(2);

    var $apple = $elems.toArray().filter(function (elem) {
      return elem.attribs['class'] === 'apple';
    });
    var $fruits = $elems.toArray().filter(function (elem) {
      return elem.attribs.id === 'fruits';
    });
    testAppleSelect($apple);
    expect($fruits[0].attribs.id).toBe('fruits');
  });

  it('should select first element cheerio(:first)', function () {
    var $elem = cheerio('li:first', fruits);
    expect($elem.attr('class')).toBe('apple');

    var $filtered = cheerio('li', fruits).filter(':even');
    expect($filtered).toHaveLength(2);
  });

  it('should be able to select immediate children: cheerio("#fruits > .pear")', function () {
    var $food = cheerio(food);
    cheerio('.pear', $food).append('<li class="pear">Another Pear!</li>');
    expect(cheerio('#fruits .pear', $food)).toHaveLength(2);
    var $elem = cheerio('#fruits > .pear', $food);
    expect($elem).toHaveLength(1);
    expect($elem.attr('class')).toBe('pear');
  });

  it('should be able to select immediate children: cheerio(".apple + .pear")', function () {
    var $elem = cheerio('.apple + li', fruits);
    expect($elem).toHaveLength(1);
    $elem = cheerio('.apple + .pear', fruits);
    expect($elem).toHaveLength(0);
    $elem = cheerio('.apple + .orange', fruits);
    expect($elem).toHaveLength(1);
    expect($elem.attr('class')).toBe('orange');
  });

  it('should be able to select immediate children: cheerio(".apple ~ .pear")', function () {
    var $elem = cheerio('.apple ~ li', fruits);
    expect($elem).toHaveLength(2);
    $elem = cheerio('.apple ~ .pear', fruits);
    expect($elem.attr('class')).toBe('pear');
  });

  it('should handle wildcards on attributes: cheerio("li[class*=r]")', function () {
    var $elem = cheerio('li[class*=r]', fruits);
    expect($elem).toHaveLength(2);
    expect($elem.eq(0).attr('class')).toBe('orange');
    expect($elem.eq(1).attr('class')).toBe('pear');
  });

  it('should handle beginning of attr selectors: cheerio("li[class^=o]")', function () {
    var $elem = cheerio('li[class^=o]', fruits);
    expect($elem).toHaveLength(1);
    expect($elem.eq(0).attr('class')).toBe('orange');
  });

  it('should handle beginning of attr selectors: cheerio("li[class$=e]")', function () {
    var $elem = cheerio('li[class$=e]', fruits);
    expect($elem).toHaveLength(2);
    expect($elem.eq(0).attr('class')).toBe('apple');
    expect($elem.eq(1).attr('class')).toBe('orange');
  });

  it('should gracefully degrade on complex, unmatched queries', function () {
    var $elem = cheerio('Eastern States Cup #8-fin&nbsp;<br>Downhill&nbsp;');
    expect($elem).toHaveLength(0);
  });

  it('(extended Array) should not interfere with prototype methods (issue #119)', function () {
    var extended = [];
    extended.find = extended.children = extended.each = function () {};
    var $empty = cheerio(extended);

    expect($empty.find).toBe(cheerio.prototype.find);
    expect($empty.children).toBe(cheerio.prototype.children);
    expect($empty.each).toBe(cheerio.prototype.each);
  });

  it('cheerio.html(null) should return a "" string', function () {
    expect(cheerio.html(null)).toBe('');
  });

  it('should set html(number) as a string', function () {
    var $elem = cheerio('<div>');
    $elem.html(123);
    expect(typeof $elem.text()).toBe('string');
  });

  it('should set text(number) as a string', function () {
    var $elem = cheerio('<div>');
    $elem.text(123);
    expect(typeof $elem.text()).toBe('string');
  });

  describe('.load', function () {
    it('should generate selections as proper instances', function () {
      var $ = cheerio.load(fruits);

      expect($('.apple')).toBeInstanceOf($);
    });

    it('should be able to filter down using the context', function () {
      var $ = cheerio.load(fruits);
      var apple = $('.apple', 'ul');
      var lis = $('li', 'ul');

      expect(apple).toHaveLength(1);
      expect(lis).toHaveLength(3);
    });

    it('should allow loading a pre-parsed DOM', function () {
      var dom = htmlparser2.parseDOM(food);
      var $ = cheerio.load(dom);

      expect($('ul')).toHaveLength(3);
    });

    it('should allow loading a single element', function () {
      var el = htmlparser2.parseDOM(food)[0];
      var $ = cheerio.load(el);

      expect($('ul')).toHaveLength(3);
    });

    it('should render xml in html() when options.xml = true', function () {
      var str = '<MixedCaseTag UPPERCASEATTRIBUTE=""></MixedCaseTag>';
      var expected = '<MixedCaseTag UPPERCASEATTRIBUTE=""/>';
      var $ = cheerio.load(str, { xml: true });

      expect($('MixedCaseTag').get(0).tagName).toBe('MixedCaseTag');
      expect($.html()).toBe(expected);
    });

    it('should render xml in html() when options.xml = true passed to html()', function () {
      var str = '<MixedCaseTag UPPERCASEATTRIBUTE=""></MixedCaseTag>';
      // since parsing done without xml flag, all tags converted to lowercase
      var expectedXml =
        '<html><head/><body><mixedcasetag uppercaseattribute=""/></body></html>';
      var expectedNoXml =
        '<html><head></head><body><mixedcasetag uppercaseattribute=""></mixedcasetag></body></html>';
      var $ = cheerio.load(str);

      expect($('MixedCaseTag').get(0).tagName).toBe('mixedcasetag');
      expect($.html()).toBe(expectedNoXml);
      expect($.html({ xml: true })).toBe(expectedXml);
    });

    it('should respect options on the element level', function () {
      var str =
        '<!doctype html><html><head><title>Some test</title></head><body><footer><p>Copyright &copy; 2003-2014</p></footer></body></html>';
      var expectedHtml = '<p>Copyright &copy; 2003-2014</p>';
      var expectedXml = '<p>Copyright © 2003-2014</p>';
      var domNotEncoded = cheerio.load(str, {
        xml: { decodeEntities: false },
      });
      var domEncoded = cheerio.load(str);

      expect(domNotEncoded('footer').html()).toBe(expectedHtml);
      expect(domEncoded('footer').html()).toBe(expectedXml);
    });

    it('should use htmlparser2 if xml option is used', function () {
      var str = '<div></div>';
      var dom = cheerio.load(str, null, false);
      expect(dom.html()).toBe(str);
    });

    it('should return a fully-qualified Function', function () {
      var $ = cheerio.load('<div>');

      expect($).toBeInstanceOf(Function);
    });

    describe('prototype extensions', function () {
      it('should honor extensions defined on `prototype` property', function () {
        var $ = cheerio.load('<div>');
        $.prototype.myPlugin = function () {
          return {
            context: this,
            args: arguments,
          };
        };

        var $div = $('div');

        expect(typeof $div.myPlugin).toBe('function');
        expect($div.myPlugin().context).toBe($div);
        expect(
          Array.prototype.slice.call($div.myPlugin(1, 2, 3).args)
        ).toStrictEqual([1, 2, 3]);
      });

      it('should honor extensions defined on `fn` property', function () {
        var $ = cheerio.load('<div>');
        $.fn.myPlugin = function () {
          return {
            context: this,
            args: arguments,
          };
        };

        var $div = $('div');

        expect(typeof $div.myPlugin).toBe('function');
        expect($div.myPlugin().context).toBe($div);
        expect(
          Array.prototype.slice.call($div.myPlugin(1, 2, 3).args)
        ).toStrictEqual([1, 2, 3]);
      });

      it('should isolate extensions between loaded functions', function () {
        var $a = cheerio.load('<div>');
        var $b = cheerio.load('<div>');

        $a.prototype.foo = function () {};

        expect($b('div').foo).toBeUndefined();
      });
    });
  });
  describe('util functions', function () {
    it('camelCase function test', function () {
      expect(utils.camelCase('cheerio.js')).toBe('cheerioJs');
      expect(utils.camelCase('camel-case-')).toBe('camelCase');
      expect(utils.camelCase('__directory__')).toBe('_directory_');
      expect(utils.camelCase('_one-two.three')).toBe('OneTwoThree');
    });

    it('cssCase function test', function () {
      expect(utils.cssCase('camelCase')).toBe('camel-case');
      expect(utils.cssCase('jQuery')).toBe('j-query');
      expect(utils.cssCase('neverSayNever')).toBe('never-say-never');
      expect(utils.cssCase('CSSCase')).toBe('-c-s-s-case');
    });

    it('cloneDom : should be able clone single Elements', function () {
      var main = cheerio('<p>Cheerio</p>');
      var result = [];
      utils.domEach(main, function (i, el) {
        result = result.concat(utils.cloneDom(el));
      });
      expect(result).toHaveLength(1);
      expect(result[0]).not.toBe(main[0]);
      expect(main[0].children.length).toBe(result[0].children.length);
      expect(cheerio(result).text()).toBe(main.text());
    });

    it('isHtml function test', function () {
      expect(utils.isHtml('<html>')).toBe(true);
      expect(utils.isHtml('\n<html>\n')).toBe(true);
      expect(utils.isHtml('#main')).toBe(false);
      expect(utils.isHtml('\n<p>foo<p>bar\n')).toBe(true);
      expect(utils.isHtml('dog<p>fox<p>cat')).toBe(false);
      expect(utils.isHtml('<p>fox<p>cat')).toBe(true);
      expect(utils.isHtml('\n<p>fox<p>cat\n')).toBe(true);
    });
  });
});
