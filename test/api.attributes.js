var expect = require('expect.js');

var cheerio = require('..');
var fruits = require('./fixtures').fruits;
var vegetables = require('./fixtures').vegetables;
var food = require('./fixtures').food;
var chocolates = require('./fixtures').chocolates;
var inputs = require('./fixtures').inputs;
var toArray = Function.call.bind(Array.prototype.slice);

describe('$(...)', function() {
  var $;

  beforeEach(function() {
    $ = cheerio.load(fruits);
  });

  describe('.attr', function() {

    it('() : should get all the attributes', function() {
      var attrs = $('ul').attr();
      expect(attrs.id).to.equal('fruits');
    });

    it('(invalid key) : invalid attr should get undefined', function() {
      var attr = $('.apple').attr('lol');
      expect(attr).to.be(undefined);
    });

    it('(valid key) : valid attr should get value', function() {
      var cls = $('.apple').attr('class');
      expect(cls).to.equal('apple');
    });

    it('(valid key) : valid attr should get name when boolean', function() {
      var attr = $('<input name=email autofocus>').attr('autofocus');
      expect(attr).to.equal('autofocus');
    });

    it('(key, value) : should set attr', function() {
      var $pear = $('.pear').attr('id', 'pear');
      expect($('#pear')).to.have.length(1);
      expect($pear).to.be.a($);
    });

    it('(key, value) : should set attr', function() {
      var $el = cheerio('<div></div> <div></div>').attr('class', 'pear');

      expect($el[0].attribs['class']).to.equal('pear');
      expect($el[1].attribs).to.equal(undefined);
      expect($el[2].attribs['class']).to.equal('pear');
    });

    it('(key, value) : should return an empty object for an empty object', function() {
      var $src = $().attr('key', 'value');
      expect($src.length).to.equal(0);
      expect($src[0]).to.be(undefined);
    });

    it('(map) : object map should set multiple attributes', function() {
      $('.apple').attr({
        id: 'apple',
        style: 'color:red;',
        'data-url': 'http://apple.com'
      });
      var attrs = $('.apple').attr();
      expect(attrs.id).to.equal('apple');
      expect(attrs.style).to.equal('color:red;');
      expect(attrs['data-url']).to.equal('http://apple.com');
    });

    it('(key, function) : should call the function and update the attribute with the return value', function() {
      var $fruits = $('#fruits');
      $fruits.attr('id', function(index, value) {
        expect(index).to.equal(0);
        expect(value).to.equal('fruits');
        return 'ninja';
      });
      var attrs = $fruits.attr();
      expect(attrs.id).to.equal('ninja');
    });

    it('(key, value) : should correctly encode then decode unsafe values', function() {
      var $apple = $('.apple');
      $apple.attr('href', 'http://github.com/"><script>alert("XSS!")</script><br');
      expect($apple.attr('href')).to.equal('http://github.com/"><script>alert("XSS!")</script><br');

      $apple.attr('href', 'http://github.com/"><script>alert("XSS!")</script><br');
      expect($apple.html()).to.not.contain('<script>alert("XSS!")</script>');
    });

    it('(key, value) : should coerce values to a string', function() {
      var $apple = $('.apple');
      $apple.attr('data-test', 1);
      expect($apple[0].attribs['data-test']).to.equal('1');
      expect($apple.attr('data-test')).to.equal('1');
    });

    it('(key, value) : handle removed boolean attributes', function() {
      var $apple = $('.apple');
      $apple.attr('autofocus', 'autofocus');
      expect($apple.attr('autofocus')).to.equal('autofocus');
      $apple.removeAttr('autofocus');
      expect($apple.attr('autofocus')).to.be(undefined);
    });

    it('(key, value) : should remove non-boolean attributes with names or values similar to boolean ones', function() {
      var $apple = $('.apple');
      $apple.attr('data-autofocus', 'autofocus');
      expect($apple.attr('data-autofocus')).to.equal('autofocus');
      $apple.removeAttr('data-autofocus');
      expect($apple.attr('data-autofocus')).to.be(undefined);
    });
  });

  describe('.data', function() {

    beforeEach(function() {
      $ = cheerio.load(chocolates);
    });

    it('() : should get all data attributes initially declared in the markup', function() {
      var data = $('.linth').data();
      expect(data).to.eql({
        highlight: 'Lindor',
        origin: 'swiss'
      });
    });

    it('() : should get all data set via `data`', function() {
      var $el = cheerio('<div>');
      $el.data('a', 1);
      $el.data('b', 2);

      expect($el.data()).to.eql({
        a: 1,
        b: 2
      });
    });

    it('() : should get all data attributes initially declared in the markup merged with all data additionally set via `data`', function() {
      var $el = cheerio('<div data-a="a">');
      $el.data('b', 'b');

      expect($el.data()).to.eql({
        a: 'a',
        b: 'b'
      });
    });

    it('() : no data attribute should return an empty object', function() {
      var data = $('.cailler').data();
      expect(data).to.be.empty();
    });

    it('(invalid key) : invalid data attribute should return `undefined` ', function() {
      var data = $('.frey').data('lol');
      expect(data).to.be(undefined);
    });

    it('(valid key) : valid data attribute should get value', function() {
      var highlight = $('.linth').data('highlight');
      var origin = $('.linth').data('origin');

      expect(highlight).to.equal('Lindor');
      expect(origin).to.equal('swiss');
    });

    it('(key) : should translate camel-cased key values to hyphen-separated versions', function() {
      var $el = cheerio('<div data--three-word-attribute="a" data-foo-Bar_BAZ-="b">');

      expect($el.data('ThreeWordAttribute')).to.be('a');
      expect($el.data('fooBar_baz-')).to.be('b');
    });

    it('(key) : should retrieve object values', function() {
      var data = {};
      var $el = cheerio('<div>');

      $el.data('test', data);

      expect($el.data('test')).to.be(data);
    });

    it('(key) : should parse JSON data derived from the markup', function() {
      var $el = cheerio('<div data-json="[1, 2, 3]">');

      expect($el.data('json')).to.eql([1,2,3]);
    });

    it('(key) : should not parse JSON data set via the `data` API', function() {
      var $el = cheerio('<div>');
      $el.data('json', '[1, 2, 3]');

      expect($el.data('json')).to.be('[1, 2, 3]');
    });

    // See http://api.jquery.com/data/ and http://bugs.jquery.com/ticket/14523
    it('(key) : should ignore the markup value after the first access', function() {
      var $el = cheerio('<div data-test="a">');

      expect($el.data('test')).to.be('a');

      $el.attr('data-test', 'b');

      expect($el.data('test')).to.be('a');
    });

    it('(hyphen key) : data addribute with hyphen should be camelized ;-)', function() {
      var data = $('.frey').data();
      expect(data).to.eql({
        taste: 'sweet',
        bestCollection: 'Mahony'
      });
    });

    it('(key, value) : should set data attribute', function() {
      // Adding as object.
      var a = $('.frey').data({
        balls: 'giandor'
      });
      // Adding as string.
      var b = $('.linth').data('snack', 'chocoletti');

      expect(a.data('balls')).to.eql('giandor');
      expect(b.data('snack')).to.eql('chocoletti');
    });

    it('(map) : object map should set multiple data attributes', function() {
      var data = $('.linth').data({
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
        var $el = cheerio('<div data-bool="true">');
        expect($el.data('bool')).to.be(true);
      });

      it('number', function() {
        var $el = cheerio('<div data-number="23">');
        expect($el.data('number')).to.be(23);
      });

      it('number (scientific notation is not coerced)', function() {
        var $el = cheerio('<div data-sci="1E10">');
        expect($el.data('sci')).to.be('1E10');
      });

      it('null', function() {
        var $el = cheerio('<div data-null="null">');
        expect($el.data('null')).to.be(null);
      });

      it('object', function() {
        var $el = cheerio('<div data-obj=\'{ "a": 45 }\'>');
        expect($el.data('obj')).to.eql({ a: 45 });
      });

      it('array', function() {
        var $el = cheerio('<div data-array="[1, 2, 3]">');
        expect($el.data('array')).to.eql([1, 2, 3]);
      });

    });

  });


  describe('.val', function() {

    beforeEach(function() {
      $ = cheerio.load(inputs);
    });

    it('.val(): on select should get value', function() {
      var val = $('select#one').val();
      expect(val).to.equal('option_selected');
    });
    it('.val(): on option should get value', function() {
      var val = $('select#one option').eq(0).val();
      expect(val).to.equal('option_not_selected');
    });
    it('.val(): on text input should get value', function() {
      var val = $('input[type="text"]').val();
      expect(val).to.equal('input_text');
    });
    it('.val(): on checked checkbox should get value', function() {
      var val = $('input[name="checkbox_on"]').val();
      expect(val).to.equal('on');
    });
    it('.val(): on unchecked checkbox should get value', function() {
      var val = $('input[name="checkbox_off"]').val();
      expect(val).to.equal('off');
    });
    it('.val(): on radio should get value', function() {
      var val = $('input[type="radio"]').val();
      expect(val).to.equal('on');
    });
    it('.val(): on multiple select should get an array of values', function() {
      var val = $('select#multi').val();
      expect(val).to.have.length(2);
    });
    it('.val(value): on input text should set value', function() {
      var element = $('input[type="text"]').val('test');
      expect(element.val()).to.equal('test');
    });
    it('.val(value): on select should set value', function() {
      var element = $('select#one').val('option_not_selected');
      expect(element.val()).to.equal('option_not_selected');
    });
    it('.val(value): on option should set value', function() {
      var element = $('select#one option').eq(0).val('option_changed');
      expect(element.val()).to.equal('option_changed');
    });
    it('.val(value): on radio should set value', function() {
      var element = $('input[name="radio"]').val('off');
      expect(element.val()).to.equal('off');
    });
    it('.val(value): on radio with special characters should set value', function() {
      var element = $('input[name="radio[brackets]"]').val('off');
      expect(element.val()).to.equal('off');
    });
    it('.val(values): on multiple select should set multiple values', function() {
      var element = $('select#multi').val(['1', '3', '4']);
      expect(element.val()).to.have.length(3);
    });
  });

  describe('.removeAttr', function() {

    it('(key) : should remove a single attr', function() {
      var $fruits = $('#fruits');
      expect($fruits.attr('id')).to.not.be(undefined);
      $fruits.removeAttr('id');
      expect($fruits.attr('id')).to.be(undefined);
    });

    it('should return cheerio object', function() {
      var obj = $('ul').removeAttr('id');
      expect(obj).to.be.a($);
    });

  });

  describe('.hasClass', function() {
    function test(attr) {
      return cheerio('<div class="' + attr + '"></div>');
    }

    it('(valid class) : should return true', function() {
      var cls = $('.apple').hasClass('apple');
      expect(cls).to.be.ok();

      expect(test('foo').hasClass('foo')).to.be.ok();
      expect(test('foo bar').hasClass('foo')).to.be.ok();
      expect(test('bar foo').hasClass('foo')).to.be.ok();
      expect(test('bar foo bar').hasClass('foo')).to.be.ok();
    });

    it('(invalid class) : should return false', function() {
      var cls = $('#fruits').hasClass('fruits');
      expect(cls).to.not.be.ok();
      expect(test('foo-bar').hasClass('foo')).to.not.be.ok();
      expect(test('foo-bar').hasClass('foo')).to.not.be.ok();
      expect(test('foo-bar').hasClass('foo-ba')).to.not.be.ok();
    });

    it('should check multiple classes', function() {
      // Add a class
      $('.apple').addClass('red');
      expect($('.apple').hasClass('apple')).to.be.ok();
      expect($('.apple').hasClass('red')).to.be.ok();

      // Remove one and test again
      $('.apple').removeClass('apple');
      expect($('li').eq(0).hasClass('apple')).to.not.be.ok();
      // expect($('li', $fruits).eq(0).hasClass('red')).to.be.ok();
    });
  });

  describe('.addClass', function() {

    it('(first class) : should add the class to the element', function() {
      var $fruits = $('#fruits');
      $fruits.addClass('fruits');
      var cls = $fruits.hasClass('fruits');
      expect(cls).to.be.ok();
    });

    it('(single class) : should add the class to the element', function() {
      $('.apple').addClass('fruit');
      var cls = $('.apple').hasClass('fruit');
      expect(cls).to.be.ok();
    });

    it('(class): adds classes to many selected items', function() {
      $('li').addClass('fruit');
      expect($('.apple').hasClass('fruit')).to.be.ok();
      expect($('.orange').hasClass('fruit')).to.be.ok();
      expect($('.pear').hasClass('fruit')).to.be.ok();
    });

    it('(class class class) : should add multiple classes to the element', function() {
      $('.apple').addClass('fruit red tasty');
      expect($('.apple').hasClass('apple')).to.be.ok();
      expect($('.apple').hasClass('fruit')).to.be.ok();
      expect($('.apple').hasClass('red')).to.be.ok();
      expect($('.apple').hasClass('tasty')).to.be.ok();
    });

    it('(fn) : should add classes returned from the function', function() {
      var $fruits = $('#fruits').children();
      var args = [];
      var thisVals = [];
      var toAdd = ['apple red', '', undefined];

      $fruits.addClass(function(idx) {
        args.push(toArray(arguments));
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
      $('.pear').addClass('fruit');
      $('.pear').removeClass();
      expect($('.pear').attr('class')).to.be(undefined);
    });

    it('("") : should not modify class list', function() {
      var $fruits = $('#fruits');
      $fruits.children().removeClass('');
      expect($('.apple')).to.have.length(1);
    });

    it('(invalid class) : should not remove anything', function() {
      $('.pear').removeClass('fruit');
      expect($('.pear').hasClass('pear')).to.be.ok();
    });

    it('(no class attribute) : should not throw an exception', function() {
      var $vegetables = cheerio(vegetables);

      expect(function() {
        $('li', $vegetables).removeClass('vegetable');
      })
      .to.not.throwException();
    });

    it('(single class) : should remove a single class from the element', function() {
      $('.pear').addClass('fruit');
      expect($('.pear').hasClass('fruit')).to.be.ok();
      $('.pear').removeClass('fruit');
      expect($('.pear').hasClass('fruit')).to.not.be.ok();
      expect($('.pear').hasClass('pear')).to.be.ok();
    });

    it('(single class) : should remove a single class from multiple classes on the element', function() {
      $('.pear').addClass('fruit green tasty');
      expect($('.pear').hasClass('fruit')).to.be.ok();
      expect($('.pear').hasClass('green')).to.be.ok();
      expect($('.pear').hasClass('tasty')).to.be.ok();

      $('.pear').removeClass('green');
      expect($('.pear').hasClass('fruit')).to.be.ok();
      expect($('.pear').hasClass('green')).to.not.be.ok();
      expect($('.pear').hasClass('tasty')).to.be.ok();
    });

    it('(class class class) : should remove multiple classes from the element', function() {
      $('.apple').addClass('fruit red tasty');
      expect($('.apple').hasClass('apple')).to.be.ok();
      expect($('.apple').hasClass('fruit')).to.be.ok();
      expect($('.apple').hasClass('red')).to.be.ok();
      expect($('.apple').hasClass('tasty')).to.be.ok();

      $('.apple').removeClass('apple red tasty');
      expect($('.fruit').hasClass('apple')).to.not.be.ok();
      expect($('.fruit').hasClass('red')).to.not.be.ok();
      expect($('.fruit').hasClass('tasty')).to.not.be.ok();
      expect($('.fruit').hasClass('fruit')).to.be.ok();
    });

    it('(class) : should remove all occurrences of a class name', function() {
      var $div = cheerio('<div class="x x y x z"></div>');
      expect($div.removeClass('x').hasClass('x')).to.be(false);
    });

    it('(fn) : should remove classes returned from the function', function() {
      var $fruits = $('#fruits').children();
      var args = [];
      var thisVals = [];
      var toAdd = ['apple red', '', undefined];

      $fruits.removeClass(function(idx) {
        args.push(toArray(arguments));
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
      $('.apple').addClass('fruit');
      expect($('.apple').hasClass('apple')).to.be.ok();
      expect($('.apple').hasClass('fruit')).to.be.ok();
      expect($('.apple').hasClass('red')).to.not.be.ok();

      $('.apple').toggleClass('apple red');
      expect($('.fruit').hasClass('apple')).to.not.be.ok();
      expect($('.fruit').hasClass('red')).to.be.ok();
      expect($('.fruit').hasClass('fruit')).to.be.ok();
    });

    it('(class class, true) : should add multiple classes to the element', function() {
      $('.apple').addClass('fruit');
      expect($('.apple').hasClass('apple')).to.be.ok();
      expect($('.apple').hasClass('fruit')).to.be.ok();
      expect($('.apple').hasClass('red')).to.not.be.ok();

      $('.apple').toggleClass('apple red', true);
      expect($('.fruit').hasClass('apple')).to.be.ok();
      expect($('.fruit').hasClass('red')).to.be.ok();
      expect($('.fruit').hasClass('fruit')).to.be.ok();
    });

    it('(class true) : should add only one instance of class', function () {
      $('.apple').toggleClass('tasty', true);
      $('.apple').toggleClass('tasty', true);
      expect($('.apple').attr('class').match(/tasty/g).length).to.equal(1);
    });

    it('(class class, false) : should remove multiple classes from the element', function() {
      $('.apple').addClass('fruit');
      expect($('.apple').hasClass('apple')).to.be.ok();
      expect($('.apple').hasClass('fruit')).to.be.ok();
      expect($('.apple').hasClass('red')).to.not.be.ok();

      $('.apple').toggleClass('apple red', false);
      expect($('.fruit').hasClass('apple')).to.not.be.ok();
      expect($('.fruit').hasClass('red')).to.not.be.ok();
      expect($('.fruit').hasClass('fruit')).to.be.ok();
    });

    it('(fn) : should toggle classes returned from the function', function() {
      $ = cheerio.load(food);

      $('.apple').addClass('fruit');
      $('.carrot').addClass('vegetable');
      expect($('.apple').hasClass('fruit')).to.be.ok();
      expect($('.apple').hasClass('vegetable')).to.not.be.ok();
      expect($('.orange').hasClass('fruit')).to.not.be.ok();
      expect($('.orange').hasClass('vegetable')).to.not.be.ok();
      expect($('.carrot').hasClass('fruit')).to.not.be.ok();
      expect($('.carrot').hasClass('vegetable')).to.be.ok();
      expect($('.sweetcorn').hasClass('fruit')).to.not.be.ok();
      expect($('.sweetcorn').hasClass('vegetable')).to.not.be.ok();

      $('li').toggleClass(function() {
        return $(this).parent().is('#fruits') ? 'fruit' : 'vegetable';
      });
      expect($('.apple').hasClass('fruit')).to.not.be.ok();
      expect($('.apple').hasClass('vegetable')).to.not.be.ok();
      expect($('.orange').hasClass('fruit')).to.be.ok();
      expect($('.orange').hasClass('vegetable')).to.not.be.ok();
      expect($('.carrot').hasClass('fruit')).to.not.be.ok();
      expect($('.carrot').hasClass('vegetable')).to.not.be.ok();
      expect($('.sweetcorn').hasClass('fruit')).to.not.be.ok();
      expect($('.sweetcorn').hasClass('vegetable')).to.be.ok();
    });

  });

  describe('.is', function () {
    it('() : should return false', function() {
      expect($('li.apple').is()).to.be(false);
    });

    it('(true selector) : should return true', function() {
      expect(cheerio('#vegetables', vegetables).is('ul')).to.be(true);
    });

    it('(false selector) : should return false', function() {
      expect(cheerio('#vegetables', vegetables).is('div')).to.be(false);
    });

    it('(true selection) : should return true', function() {
      var $vegetables = cheerio('li', vegetables);
      expect($vegetables.is($vegetables.eq(1))).to.be(true);
    });

    it('(false selection) : should return false', function() {
      var $vegetableList = cheerio(vegetables);
      var $vegetables = $vegetableList.find('li');
      expect($vegetables.is($vegetableList)).to.be(false);
    });

    it('(true element) : should return true', function() {
      var $vegetables = cheerio('li', vegetables);
      expect($vegetables.is($vegetables[0])).to.be(true);
    });

    it('(false element) : should return false', function() {
      var $vegetableList = cheerio(vegetables);
      var $vegetables = $vegetableList.find('li');
      expect($vegetables.is($vegetableList[0])).to.be(false);
    });

    it('(true predicate) : should return true', function() {
      var result = $('li').is(function() {
        return this.tagName === 'li' && $(this).hasClass('pear');
      });
      expect(result).to.be(true);
    });

    it('(false predicate) : should return false', function () {
      var result = $('li').last().is(function() {
        return this.tagName === 'ul';
      });
      expect(result).to.be(false);
    });
  });

});
