var expect = require('expect.js');

var $ = require('../');
var fruits = require('./fixtures').fruits;
var vegetables = require('./fixtures').vegetables;
var food = require('./fixtures').food;
var chocolates = require('./fixtures').chocolates;
var inputs = require('./fixtures').inputs;

describe('$(...)', function() {

  describe('.attr', function() {

    it('() : should get all the attributes', function() {
      var attrs = $('ul', fruits).attr();
      expect(attrs.id).to.equal('fruits');
    });

    it('(invalid key) : invalid attr should get undefined', function() {
      var attr = $('.apple', fruits).attr('lol');
      expect(attr).to.be(undefined);
    });

    it('(valid key) : valid attr should get value', function() {
      var cls = $('.apple', fruits).attr('class');
      expect(cls).to.equal('apple');
    });

    it('(key, value) : should set attr', function() {
      var $fruits = $(fruits);
      var $pear = $('.pear', $fruits).attr('id', 'pear');
      expect($('#pear', $fruits)).to.have.length(1);
      expect($pear.cheerio).to.not.be(undefined);
    });

    it('(key, value) : should return an empty object for an empty object', function() {
      var $src = $().attr('key', 'value');
      expect($src.length).to.equal(0);
      expect($src[0]).to.be(undefined);
    });

    it('(map) : object map should set multiple attributes', function() {
      var $fruits = $(fruits);
      $('.apple', $fruits).attr({
        id: 'apple',
        style: 'color:red;',
        'data-url': 'http://apple.com'
      });
      var attrs = $('.apple', $fruits).attr();
      expect(attrs.id).to.equal('apple');
      expect(attrs.style).to.equal('color:red;');
      expect(attrs['data-url']).to.equal('http://apple.com');
    });

    it('(key, function) : should call the function and update the attribute with the return value', function() {
      var $fruits = $(fruits);
      $fruits.attr('id', function(index, value) {
        expect(index).to.equal(0);
        expect(value).to.equal('fruits');
        return 'ninja';
      });
      var attrs = $fruits.attr();
      expect(attrs.id).to.equal('ninja');
    });

    it('(key, value) : should correctly encode then decode unsafe values', function() {
      var $apple = $('.apple', fruits);
      $apple.attr('href', 'http://github.com/"><script>alert("XSS!")</script><br');
      expect($apple[0].attribs.href).to.equal('http://github.com/&quot;&gt;&lt;script&gt;alert(&quot;XSS!&quot;)&lt;/script&gt;&lt;br');
      expect($apple.attr('href')).to.equal('http://github.com/"><script>alert("XSS!")</script><br');

      $apple.attr('href', 'http://github.com/"><script>alert("XSS!")</script><br');
      expect($apple.html()).to.not.contain('<script>alert("XSS!")</script>');
    });

    it('(key, value) : should coerce values to a string', function() {
      var $apple = $('.apple', fruits);
      $apple.attr('data-test', 1);
      expect($apple[0].attribs['data-test']).to.equal('1');
      expect($apple.attr('data-test')).to.equal('1');
    });
  });

  describe('.data', function() {

    it('() : should get all data attributes', function() {
      var data = $('.linth', chocolates).data();
      expect(data).to.eql({
        highlight: 'Lindor',
        origin: 'swiss'
      });
    });

    it('() : no data attribute should return an empty object', function() {
      var data = $('.cailler', chocolates).data();
      expect(data).to.be.empty();
    });

    it('(invalid key) : invalid data attribute should return `undefined` ', function() {
      var data = $('.frey', chocolates).data('lol');
      expect(data).to.be(undefined);
    });

    it('(valid key) : valid data attribute should get value', function() {
      var highlight = $('.linth', chocolates).data('highlight');
      var origin = $('.linth', chocolates).data('origin');

      expect(highlight).to.equal('Lindor');
      expect(origin).to.equal('swiss');
    });

    it('(hyphen key) : data addribute with hyphen should be camelized ;-)', function() {
      var data = $('.frey', chocolates).data();
      expect(data).to.eql({
        taste: 'sweet',
        bestCollection: 'Mahony'
      });
    });

    it('(key, value) : should set data attribute', function() {
      // Adding as object.
      var a = $('.frey', chocolates).data({
        balls: 'giandor'
      });
      // Adding as string.
      var b = $('.linth', chocolates).data('snack', 'chocoletti');

      expect(a.data('balls')).to.eql('giandor');
      expect(b.data('snack')).to.eql('chocoletti');
    });

    it('(map) : object map should set multiple data attributes', function() {
      var data = $('.linth', chocolates).data({
        id: 'Cailler',
        flop: 'Pippilotti Rist',
        top: 'Frigor',
        url: 'http://www.cailler.ch/'
      })['0'].data;

      expect(data.id).to.equal('Cailler');
      expect(data.flop).to.equal('Pippilotti Rist');
      expect(data.top).to.equal('Frigor');
      expect(data.url).to.equal('http://www.cailler.ch/');
    });

    describe('(attr) : data-* attribute type coercion :', function() {
      it('boolean', function() {
        var $el = $('<div data-bool="true">');
        expect($el.data('bool')).to.be(true);
      });

      it('number', function() {
        var $el = $('<div data-number="23">');
        expect($el.data('number')).to.be(23);
      });

      it('number (scientific notation is not coerced)', function() {
        var $el = $('<div data-sci="1E10">');
        expect($el.data('sci')).to.be('1E10');
      });

      it('null', function() {
        var $el = $('<div data-null="null">');
        expect($el.data('null')).to.be(null);
      });

      it('object', function() {
        var $el = $('<div data-obj=\'{ "a": 45 }\'>');
        expect($el.data('obj')).to.eql({ a: 45 });
      });

      it('array', function() {
        var $el = $('<div data-array="[1, 2, 3]">');
        expect($el.data('array')).to.eql([1, 2, 3]);
      });

    });

  });


  describe('.val', function() {
    it('.val(): on select should get value', function() {
      var val = $('select#one', inputs).val();
      expect(val).to.equal('option_selected');
    });
    it('.val(): on option should get value', function() {
      var val = $('select#one option', inputs).eq(0).val();
      expect(val).to.equal('option_not_selected');
    });
    it('.val(): on text input should get value', function() {
      var val = $('input[type="text"]', inputs).val();
      expect(val).to.equal('input_text');
    });
    it('.val(): on checked checkbox should get value', function() {
      var val = $('input[name="checkbox_on"]', inputs).val();
      expect(val).to.equal('on');
    });
    it('.val(): on unchecked checkbox should get value', function() {
      var val = $('input[name="checkbox_off"]', inputs).val();
      expect(val).to.equal('off');
    });
    it('.val(): on radio should get value', function() {
      var val = $('input[type="radio"]', inputs).val();
      expect(val).to.equal('on');
    });
    it('.val(): on multiple select should get an array of values', function() {
      var val = $('select#multi', inputs).val();
      expect(val).to.have.length(2);
    });
    it('.val(value): on input text should set value', function() {
      var element = $('input[type="text"]', inputs).val('test');
      expect(element.val()).to.equal('test');
    });
    it('.val(value): on select should set value', function() {
      var element = $('select#one', inputs).val('option_not_selected');
      expect(element.val()).to.equal('option_not_selected');
    });
    it('.val(value): on option should set value', function() {
      var element = $('select#one option', inputs).eq(0).val('option_changed');
      expect(element.val()).to.equal('option_changed');
    });
    it('.val(value): on radio should set value', function() {
      var element = $('input[name="radio"]', inputs).val('off');
      expect(element.val()).to.equal('off');
    });
    it('.val(values): on multiple select should set multiple values', function() {
      var element = $('select#multi', inputs).val(['1', '3', '4']);
      expect(element.val()).to.have.length(3);
    });
  });

  describe('.removeAttr', function() {

    it('(key) : should remove a single attr', function() {
      var $fruits = $(fruits);
      expect($fruits.attr('id')).to.not.be(undefined);
      $fruits.removeAttr('id');
      expect($fruits.attr('id')).to.be(undefined);
    });

    it('should return cheerio object', function() {
      var obj = $('ul', fruits).removeAttr('id').cheerio;
      expect(obj).to.be.ok();
    });

  });

  describe('.hasClass', function() {

    it('(valid class) : should return true', function() {
      var $fruits = $(fruits);
      var cls = $('.apple', $fruits).hasClass('apple');
      expect(cls).to.be.ok();
    });

    it('(invalid class) : should return false', function() {
      var cls = $('#fruits', fruits).hasClass('fruits');
      expect(cls).to.not.be.ok();
    });

    it('should check multiple classes', function() {
      var $fruits = $(fruits);

      // Add a class
      $('.apple', $fruits).addClass('red');
      expect($('.apple', $fruits).hasClass('apple')).to.be.ok();
      expect($('.apple', $fruits).hasClass('red')).to.be.ok();

      // Remove one and test again
      $('.apple', $fruits).removeClass('apple');
      expect($('li', $fruits).eq(0).hasClass('apple')).to.not.be.ok();
      // expect($('li', $fruits).eq(0).hasClass('red')).to.be.ok();
    });
  });

  describe('.addClass', function() {

    it('(first class) : should add the class to the element', function() {
      var $fruits = $(fruits);
      $fruits.addClass('fruits');
      var cls = $fruits.hasClass('fruits');
      expect(cls).to.be.ok();
    });

    it('(single class) : should add the class to the element', function() {
      var $fruits = $(fruits);
      $('.apple', $fruits).addClass('fruit');
      var cls = $('.apple', $fruits).hasClass('fruit');
      expect(cls).to.be.ok();
    });

    it('(class): adds classes to many selected items', function() {
      var $fruits = $(fruits);
      $('li', $fruits).addClass('fruit');
      expect($('.apple', $fruits).hasClass('fruit')).to.be.ok();
      expect($('.orange', $fruits).hasClass('fruit')).to.be.ok();
      expect($('.pear', $fruits).hasClass('fruit')).to.be.ok();
    });

    it('(class class class) : should add multiple classes to the element', function() {
      var $fruits = $(fruits);
      $('.apple', $fruits).addClass('fruit red tasty');
      expect($('.apple', $fruits).hasClass('apple')).to.be.ok();
      expect($('.apple', $fruits).hasClass('fruit')).to.be.ok();
      expect($('.apple', $fruits).hasClass('red')).to.be.ok();
      expect($('.apple', $fruits).hasClass('tasty')).to.be.ok();
    });

    it('(fn) : should add classes returned from the function', function() {
      var $fruits = $(fruits).children();
      var args = [];
      var thisVals = [];
      var toAdd = ['apple red', '', undefined];

      $fruits.addClass(function(idx, currentClass) {
        args.push(arguments);
        thisVals.push(this);
        return toAdd[idx];
      });

      expect(args).to.eql([
        [0, 'apple'],
        [1, 'orange'],
        [2, 'pear']
      ]);
      expect(thisVals).to.eql([
        $fruits[0],
        $fruits[1],
        $fruits[2]
      ]);
      expect($fruits.eq(0).hasClass('apple')).to.be.ok();
      expect($fruits.eq(0).hasClass('red')).to.be.ok();
      expect($fruits.eq(1).hasClass('orange')).to.be.ok();
      expect($fruits.eq(2).hasClass('pear')).to.be.ok();
    });

  });

  describe('.removeClass', function() {

    it('() : should remove all the classes', function() {
      var $fruits = $(fruits);
      $('.pear', $fruits).addClass('fruit');
      $('.pear', $fruits).removeClass();
      expect($('.pear', $fruits).attr('class')).to.be(undefined);
    });

    it('("") : should not modify class list', function() {
      var $fruits = $(fruits);
      $fruits.children().removeClass('');
      expect($('.apple', $fruits)).to.have.length(1);
    });

    it('(invalid class) : should not remove anything', function() {
      var $fruits = $(fruits);
      $('.pear', $fruits).removeClass('fruit');
      expect($('.pear', $fruits).hasClass('pear')).to.be.ok();
    });

    it('(no class attribute) : should not throw an exception', function() {
      var $vegetables = $(vegetables);
      var thrown = null;
      expect(function() {
        $('li', $vegetables).removeClass('vegetable');
      })
      .to.not.throwException();
    });

    it('(single class) : should remove a single class from the element', function() {
      var $fruits = $(fruits);
      $('.pear', $fruits).addClass('fruit');
      expect($('.pear', $fruits).hasClass('fruit')).to.be.ok();
      $('.pear', $fruits).removeClass('fruit');
      expect($('.pear', $fruits).hasClass('fruit')).to.not.be.ok();
      expect($('.pear', $fruits).hasClass('pear')).to.be.ok();
    });

    it('(single class) : should remove a single class from multiple classes on the element', function() {
      var $fruits = $(fruits);
      $('.pear', $fruits).addClass('fruit green tasty');
      expect($('.pear', $fruits).hasClass('fruit')).to.be.ok();
      expect($('.pear', $fruits).hasClass('green')).to.be.ok();
      expect($('.pear', $fruits).hasClass('tasty')).to.be.ok();

      $('.pear', $fruits).removeClass('green');
      expect($('.pear', $fruits).hasClass('fruit')).to.be.ok();
      expect($('.pear', $fruits).hasClass('green')).to.not.be.ok();
      expect($('.pear', $fruits).hasClass('tasty')).to.be.ok();
    });

    it('(class class class) : should remove multiple classes from the element', function() {
      var $fruits = $(fruits);

      $('.apple', $fruits).addClass('fruit red tasty');
      expect($('.apple', $fruits).hasClass('apple')).to.be.ok();
      expect($('.apple', $fruits).hasClass('fruit')).to.be.ok();
      expect($('.apple', $fruits).hasClass('red')).to.be.ok();
      expect($('.apple', $fruits).hasClass('tasty')).to.be.ok();

      $('.apple', $fruits).removeClass('apple red tasty');
      expect($('.fruit', $fruits).hasClass('apple')).to.not.be.ok();
      expect($('.fruit', $fruits).hasClass('red')).to.not.be.ok();
      expect($('.fruit', $fruits).hasClass('tasty')).to.not.be.ok();
      expect($('.fruit', $fruits).hasClass('fruit')).to.be.ok();
    });

    it('(class) : should remove all occurrences of a class name', function() {
      var $div = $('<div class="x x y x z"></div>');
      expect($div.removeClass('x').hasClass('x')).to.be(false);
    });

    it('(fn) : should remove classes returned from the function', function() {
      var $fruits = $(fruits).children();
      var args = [];
      var thisVals = [];
      var toAdd = ['apple red', '', undefined];

      $fruits.removeClass(function(idx, currentClass) {
        args.push(arguments);
        thisVals.push(this);
        return toAdd[idx];
      });

      expect(args).to.eql([
        [0, 'apple'],
        [1, 'orange'],
        [2, 'pear']
      ]);
      expect(thisVals).to.eql([
        $fruits[0],
        $fruits[1],
        $fruits[2]
      ]);
      expect($fruits.eq(0).hasClass('apple')).to.not.be.ok();
      expect($fruits.eq(0).hasClass('red')).to.not.be.ok();
      expect($fruits.eq(1).hasClass('orange')).to.be.ok();
      expect($fruits.eq(2).hasClass('pear')).to.be.ok();
    });

  });

  describe('.toggleClass', function() {

    it('(class class) : should toggle multiple classes from the element', function() {
      var $fruits = $(fruits);

      $('.apple', $fruits).addClass('fruit');
      expect($('.apple', $fruits).hasClass('apple')).to.be.ok();
      expect($('.apple', $fruits).hasClass('fruit')).to.be.ok();
      expect($('.apple', $fruits).hasClass('red')).to.not.be.ok();

      $('.apple', $fruits).toggleClass('apple red');
      expect($('.fruit', $fruits).hasClass('apple')).to.not.be.ok();
      expect($('.fruit', $fruits).hasClass('red')).to.be.ok();
      expect($('.fruit', $fruits).hasClass('fruit')).to.be.ok();
    });

    it('(class class, true) : should add multiple classes to the element', function() {
      var $fruits = $(fruits);

      $('.apple', $fruits).addClass('fruit');
      expect($('.apple', $fruits).hasClass('apple')).to.be.ok();
      expect($('.apple', $fruits).hasClass('fruit')).to.be.ok();
      expect($('.apple', $fruits).hasClass('red')).to.not.be.ok();

      $('.apple', $fruits).toggleClass('apple red', true);
      expect($('.fruit', $fruits).hasClass('apple')).to.be.ok();
      expect($('.fruit', $fruits).hasClass('red')).to.be.ok();
      expect($('.fruit', $fruits).hasClass('fruit')).to.be.ok();
    });

    it('(class class, false) : should remove multiple classes from the element', function() {
      var $fruits = $(fruits);

      $('.apple', $fruits).addClass('fruit');
      expect($('.apple', $fruits).hasClass('apple')).to.be.ok();
      expect($('.apple', $fruits).hasClass('fruit')).to.be.ok();
      expect($('.apple', $fruits).hasClass('red')).to.not.be.ok();

      $('.apple', $fruits).toggleClass('apple red', false);
      expect($('.fruit', $fruits).hasClass('apple')).to.not.be.ok();
      expect($('.fruit', $fruits).hasClass('red')).to.not.be.ok();
      expect($('.fruit', $fruits).hasClass('fruit')).to.be.ok();
    });

    it('(fn) : should toggle classes returned from the function', function() {
      var $food = $(food);

      $('.apple', $food).addClass('fruit');
      $('.carrot', $food).addClass('vegetable');
      expect($('.apple', $food).hasClass('fruit')).to.be.ok();
      expect($('.apple', $food).hasClass('vegetable')).to.not.be.ok();
      expect($('.orange', $food).hasClass('fruit')).to.not.be.ok();
      expect($('.orange', $food).hasClass('vegetable')).to.not.be.ok();
      expect($('.carrot', $food).hasClass('fruit')).to.not.be.ok();
      expect($('.carrot', $food).hasClass('vegetable')).to.be.ok();
      expect($('.sweetcorn', $food).hasClass('fruit')).to.not.be.ok();
      expect($('.sweetcorn', $food).hasClass('vegetable')).to.not.be.ok();

      $('li', $food).toggleClass(function(index, className, switchVal) {
        return $(this).parent().is('#fruits') ? 'fruit' : 'vegetable';
      });
      expect($('.apple', $food).hasClass('fruit')).to.not.be.ok();
      expect($('.apple', $food).hasClass('vegetable')).to.not.be.ok();
      expect($('.orange', $food).hasClass('fruit')).to.be.ok();
      expect($('.orange', $food).hasClass('vegetable')).to.not.be.ok();
      expect($('.carrot', $food).hasClass('fruit')).to.not.be.ok();
      expect($('.carrot', $food).hasClass('vegetable')).to.not.be.ok();
      expect($('.sweetcorn', $food).hasClass('fruit')).to.not.be.ok();
      expect($('.sweetcorn', $food).hasClass('vegetable')).to.be.ok();
    });

  });

  describe('.is', function () {
    it('() : should return false', function() {
      expect($('li.apple', fruits).is()).to.be(false);
    });

    it('(true selector) : should return true', function() {
      expect($('#vegetables', vegetables).is('ul')).to.be(true);
    });

    it('(false selector) : should return false', function() {
      expect($('#vegetables', vegetables).is('div')).to.be(false);
    });

    it('(true selection) : should return true', function() {
      var $vegetables = $('li', vegetables);
      expect($vegetables.is($vegetables.eq(1))).to.be(true);
    });

    it('(false selection) : should return false', function() {
      var $vegetableList = $(vegetables);
      var $vegetables = $vegetableList.find('li');
      expect($vegetables.is($vegetableList)).to.be(false);
    });

    it('(true element) : should return true', function() {
      var $vegetables = $('li', vegetables);
      expect($vegetables.is($vegetables[0])).to.be(true);
    });

    it('(false element) : should return false', function() {
      var $vegetableList = $(vegetables);
      var $vegetables = $vegetableList.find('li');
      expect($vegetables.is($vegetableList[0])).to.be(false);
    });

    it('(true predicate) : should return true', function() {
      var result = $('li', fruits).is(function() {
        return this.hasClass('pear');
      });
      expect(result).to.be(true);
    });

    it('(false predicate) : should return false', function () {
      var result = $('li', fruits).last().is(function() {
        return this.name === 'ul';
      });
      expect(result).to.be(false);
    });
  });

});
