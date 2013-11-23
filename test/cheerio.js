var expect = require('expect.js'),
    _ = require('lodash'),
    htmlparser2 = require('htmlparser2'),
    $ = require('../'),
    fixtures = require('./fixtures'),
    fruits = fixtures.fruits,
    food = fixtures.food;

// HTML
var script = '<script src="script.js" type="text/javascript"></script>',
    multiclass = '<p><a class="btn primary" href="#">Save</a></p>';

describe('cheerio', function() {

  it('should get the version', function() {
    expect(/\d+\.\d+\.\d+/.test($.version)).to.be.ok();
  });

  it('$(null) should return be empty', function() {
    expect($(null)).to.be.empty();
  });

  it('$(undefined) should be empty', function() {
    expect($(undefined)).to.be.empty();
  });

  it('$(null) should be empty', function() {
    expect($('')).to.be.empty();
  });

  it('$(selector) with no context or root should be empty', function() {
    expect($('.h2')).to.be.empty();
    expect($('#fruits')).to.be.empty();
  });

  it('$(node) : should override previously-loaded nodes', function() {
    var C = $.load('<div><span></span></div>');
    var spanNode = C('span')[0];
    var $span = C(spanNode);
    expect($span[0]).to.equal(spanNode);
  });

  it('should be able to create html without a root or context', function() {
    var $h2 = $('<h2>');
    expect($h2).to.not.be.empty();
    expect($h2).to.have.length(1);
    expect($h2[0].tagName).to.equal('h2');
  });

  it('should be able to create complicated html', function() {
    var $script = $(script);
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
    var $apple = $('.apple', fruits);
    testAppleSelect($apple);
  });

  it('should be able to select .apple with a node as context', function() {
    var $apple = $('.apple', $(fruits)[0]);
    testAppleSelect($apple);
  });

  it('should be able to select .apple with only a root', function() {
    var $apple = $('.apple', null, fruits);
    testAppleSelect($apple);
  });

  it('should be able to select an id', function() {
    var $fruits = $('#fruits', null, fruits);
    expect($fruits).to.have.length(1);
    expect($fruits[0].attribs.id).to.equal('fruits');
  });

  it('should be able to select a tag', function() {
    var $ul = $('ul', fruits);
    expect($ul).to.have.length(1);
    expect($ul[0].tagName).to.equal('ul');
  });

  it('should accept a node reference as a context', function() {
    var $elems = $('<div><span></span></div>');
    expect($('span', $elems[0])).to.have.length(1);
  });

  it('should accept an array of node references as a context', function() {
    var $elems = $('<div><span></span></div>');
    expect($('span', $elems.toArray())).to.have.length(1);
  });

  it('should select only elements inside given context (Issue #193)', function() {
    var q = $.load(food),
        fruits = q('#fruits'),
        fruitElements = q('li', fruits);

    expect(fruitElements).to.have.length(3);
  });

  it('should be able to select multiple tags', function() {
    var $fruits = $('li', null, fruits);
    expect($fruits).to.have.length(3);
    var classes = ['apple', 'orange', 'pear'];
    $fruits.each(function(idx, $fruit) {
      expect($fruit.attribs['class']).to.equal(classes[idx]);
    });
  });

  it('should be able to do: $("#fruits .apple")', function() {
    var $apple = $('#fruits .apple', fruits);
    testAppleSelect($apple);
  });

  it('should be able to do: $("li.apple")', function() {
    var $apple = $('li.apple', fruits);
    testAppleSelect($apple);
  });

  it('should be able to select by attributes', function() {
    var $apple = $('li[class=apple]', fruits);
    testAppleSelect($apple);
  });

  it('should be able to select multiple classes: $(".btn.primary")', function() {
    var $a = $('.btn.primary', multiclass);
    expect($a).to.have.length(1);
    expect($a[0].childNodes[0].data).to.equal('Save');
  });

  it('should not create a top-level node', function() {
    var $elem = $('* div', '<div>');
    expect($elem).to.have.length(0);
  });

  it('should be able to select multiple elements: $(".apple, #fruits")', function() {
    var $elems = $('.apple, #fruits', fruits);
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

  it('should select first element $(:first)');
    // var $elem = $(':first', fruits);
    // var $h2 = $('<h2>fruits</h2>');
    // console.log($elem.before('hi'));
    // console.log($elem.before($h2));

  it('should be able to select immediate children: $("#fruits > .pear")', function() {
    var $food = $(food);
    $('.pear', $food).append('<li class="pear">Another Pear!</li>');
    expect($('#fruits .pear', $food)).to.have.length(2);
    var $elem = $('#fruits > .pear', $food);
    expect($elem).to.have.length(1);
    expect($elem.attr('class')).to.equal('pear');
  });

  it('should be able to select immediate children: $(".apple + .pear")', function() {
    var $elem = $('.apple + li', fruits);
    expect($elem).to.have.length(1);
    $elem = $('.apple + .pear', fruits);
    expect($elem).to.have.length(0);
    $elem = $('.apple + .orange', fruits);
    expect($elem).to.have.length(1);
    expect($elem.attr('class')).to.equal('orange');
  });

  it('should be able to select immediate children: $(".apple ~ .pear")', function() {
    var $elem = $('.apple ~ li', fruits);
    expect($elem).to.have.length(2);
    $elem = $('.apple ~ .pear', fruits);
    expect($elem.attr('class')).to.equal('pear');
  });

  it('should handle wildcards on attributes: $("li[class*=r]")', function() {
    var $elem = $('li[class*=r]', fruits);
    expect($elem).to.have.length(2);
    expect($elem.eq(0).attr('class')).to.equal('orange');
    expect($elem.eq(1).attr('class')).to.equal('pear');
  });

  it('should handle beginning of attr selectors: $("li[class^=o]")', function() {
    var $elem = $('li[class^=o]', fruits);
    expect($elem).to.have.length(1);
    expect($elem.eq(0).attr('class')).to.equal('orange');
  });

  it('should handle beginning of attr selectors: $("li[class$=e]")', function() {
    var $elem = $('li[class$=e]', fruits);
    expect($elem).to.have.length(2);
    expect($elem.eq(0).attr('class')).to.equal('apple');
    expect($elem.eq(1).attr('class')).to.equal('orange');
  });

  it('should gracefully degrade on complex, unmatched queries', function() {
    var $elem = $('Eastern States Cup #8-fin&nbsp;<br>Downhill&nbsp;');
    expect($elem).to.have.length(0); // []
  });

  it('(extended Array) should not interfere with prototype methods (issue #119)', function() {
    var extended = [];
    extended.find = extended.children = extended.each = function() {};
    var $empty = $(extended);

    expect($empty.find).to.be($.prototype.find);
    expect($empty.children).to.be($.prototype.children);
    expect($empty.each).to.be($.prototype.each);
  });

  describe('.load', function() {

    it('should generate selections as proper instances', function() {
      var q = $.load(fruits);

      expect(q('.apple')).to.be.a(q);
    });

    it('should be able to filter down using the context', function() {
      var q = $.load(fruits),
          apple = q('.apple', 'ul'),
          lis = q('li', 'ul');

      expect(apple).to.have.length(1);
      expect(lis).to.have.length(3);
    });

    it('should allow loading a pre-parsed DOM', function() {
      var dom = htmlparser2.parseDOM(food),
          q = $.load(dom);

      expect(q('ul')).to.have.length(3);
    });

    it('should render xml in html() when options.xmlMode = true', function() {
      var str = '<MixedCaseTag UPPERCASEATTRIBUTE=""></MixedCaseTag>',
          expected = '<MixedCaseTag UPPERCASEATTRIBUTE=""/>',
          dom = $.load(str, {xmlMode: true});

      expect(dom('MixedCaseTag').get(0).tagName).to.equal('MixedCaseTag');
      expect(dom.html()).to.be(expected);
    });

    it('should render xml in html() when options.xmlMode = true passed to html()', function() {
      var str = '<MixedCaseTag UPPERCASEATTRIBUTE=""></MixedCaseTag>',
          // since parsing done without xmlMode flag, all tags converted to lowercase
          expectedXml = '<mixedcasetag uppercaseattribute=""/>',
          expectedNoXml = '<mixedcasetag uppercaseattribute=""></mixedcasetag>',
          dom = $.load(str);

      expect(dom('MixedCaseTag').get(0).tagName).to.equal('mixedcasetag');
      expect(dom.html()).to.be(expectedNoXml);
      expect(dom.html({xmlMode: true})).to.be(expectedXml);
    });

    it('should respect options on the element level', function() {
      var str = '<!doctype html><html><head><title>Some test</title></head><body><footer><p>Copyright &copy; 2003-2014</p></footer></body></html>',
          expectedHtml = '<p>Copyright &copy; 2003-2014</p>',
          expectedXml = '<p>Copyright &#xA9; 2003-2014</p>',
          domNotEncoded = $.load(str, {decodeEntities: false}),
          domEncoded = $.load(str);

      expect(domNotEncoded('footer').html()).to.be(expectedHtml);
      // TODO: Make it more html friendly, maybe with custom encode tables
      expect(domEncoded('footer').html()).to.be(expectedXml);
    });

    it('should return a fully-qualified Function', function() {
      var $c = $.load('<div>');

      expect($c).to.be.a(Function);
    });

  });
});
