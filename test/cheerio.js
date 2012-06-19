var expect = require('expect.js'),
    _ = require('underscore'),
    $ = require('../'),
    fruits = require('./fixtures').fruits;


// HTML
var script = '<script src="script.js" type="text/javascript"></script>',
    multiclass = '<p><a class="btn primary" href="#">Save</a></p>';

describe('cheerio', function() {

  it('should get the version', function() {
    expect(/\d\.\d\.\d/.test($.version)).to.be.ok();
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

  it('should be able to create html without a root or context', function() {
    var $h2 = $('<h2>');
    expect($h2).to.not.be.empty();
    expect($h2).to.have.length(1);
    expect($h2[0].name).to.equal('h2');
  });

  it('should be able to create complicated html', function() {
    var $script = $(script);
    expect($script).to.not.be.empty();
    expect($script).to.have.length(1);
    expect($script[0].attribs.src).to.equal('script.js');
    expect($script[0].attribs.type).to.equal('text/javascript');
    expect($script[0].children).to.be.empty();
  });

  var testAppleSelect = function($apple) {
    expect($apple).to.have.length(1);
    $apple = $apple[0];
    expect($apple.parent.name).to.equal('ul');
    expect($apple.prev).to.be(null);
    expect($apple.next.attribs['class']).to.equal('orange');
    expect($apple.children).to.have.length(1);
    expect($apple.children[0].data).to.equal('Apple');
  };

  it('should be able to select .apple with only a context', function() {
    var $apple = $('.apple', fruits);
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
    expect($ul[0].name).to.equal('ul');
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
    expect($a[0].children[0].data).to.equal('Save');
  });

  it('should be able to select multiple elements: $(".apple, #fruits")', function() {
    var $elems = $('.apple, #fruits', fruits);
    expect($elems).to.have.length(2);

    var $apple = _($elems).filter(function(elem) {
      return elem.attribs['class'] === 'apple';
    });
    var $fruits = _($elems).filter(function(elem) {
      return elem.attribs.id === 'fruits';
    });
    testAppleSelect($($apple));
    expect($fruits[0].attribs.id).to.equal('fruits');
  });

  it('should select first element $(:first)');
    // var $elem = $(':first', fruits);
    // var $h2 = $('<h2>fruits</h2>');
    // console.log($elem.before('hi'));
    // console.log($elem.before($h2));

  it('should be able to select immediate children: $("#fruits > .pear")', function() {
    var $fruitsWithMorePear = $('.pear', fruits).append('<li class="pear">Another Pear!</li>');
    expect($('#fruits .pear', $fruitsWithMorePear)).to.have.length(2);
    var $elem = $('#fruits > .pear', $fruitsWithMorePear);
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
    expect($elem).to.be.an(Array);
    expect($elem).to.have.length(0); // []
  });

});
