var cheerio = require('../..');
var fruits = require('../__fixtures__/fixtures').fruits;
var vegetables = require('../__fixtures__/fixtures').vegetables;
var food = require('../__fixtures__/fixtures').food;
var chocolates = require('../__fixtures__/fixtures').chocolates;
var inputs = require('../__fixtures__/fixtures').inputs;

describe('$(...)', function () {
  var $;

  beforeEach(function () {
    $ = cheerio.load(fruits);
  });

  describe('.attr', function () {
    it('() : should get all the attributes', function () {
      var attrs = $('ul').attr();
      expect(attrs.id).toBe('fruits');
    });

    it('(invalid key) : invalid attr should get undefined', function () {
      var attr = $('.apple').attr('lol');
      expect(attr).toBe(undefined);
    });

    it('(valid key) : valid attr should get value', function () {
      var cls = $('.apple').attr('class');
      expect(cls).toBe('apple');
    });

    it('(valid key) : valid attr should get name when boolean', function () {
      var attr = $('<input name=email autofocus>').attr('autofocus');
      expect(attr).toBe('autofocus');
    });

    it('(key, value) : should set attr', function () {
      var $pear = $('.pear').attr('id', 'pear');
      expect($('#pear')).toHaveLength(1);
      expect($pear).toBeInstanceOf($);
    });

    it('(key, value) : should set attr', function () {
      var $el = cheerio('<div></div> <div></div>').attr('class', 'pear');

      expect($el[0].attribs['class']).toBe('pear');
      expect($el[1].attribs).toBe(undefined);
      expect($el[2].attribs['class']).toBe('pear');
    });

    it('(key, value) : should return an empty object for an empty object', function () {
      var $src = $().attr('key', 'value');
      expect($src.length).toBe(0);
      expect($src[0]).toBe(undefined);
    });

    it('(map) : object map should set multiple attributes', function () {
      $('.apple').attr({
        id: 'apple',
        style: 'color:red;',
        'data-url': 'http://apple.com',
      });
      var attrs = $('.apple').attr();
      expect(attrs.id).toBe('apple');
      expect(attrs.style).toBe('color:red;');
      expect(attrs['data-url']).toBe('http://apple.com');
    });

    it('(key, function) : should call the function and update the attribute with the return value', function () {
      var $fruits = $('#fruits');
      $fruits.attr('id', function (index, value) {
        expect(index).toBe(0);
        expect(value).toBe('fruits');
        return 'ninja';
      });
      var attrs = $fruits.attr();
      expect(attrs.id).toBe('ninja');
    });

    it('(key, value) : should correctly encode then decode unsafe values', function () {
      var $apple = $('.apple');
      $apple.attr(
        'href',
        'http://github.com/"><script>alert("XSS!")</script><br'
      );
      expect($apple.attr('href')).toBe(
        'http://github.com/"><script>alert("XSS!")</script><br'
      );

      $apple.attr(
        'href',
        'http://github.com/"><script>alert("XSS!")</script><br'
      );
      expect($apple.html()).not.toContain('<script>alert("XSS!")</script>');
    });

    it('(key, value) : should coerce values to a string', function () {
      var $apple = $('.apple');
      $apple.attr('data-test', 1);
      expect($apple[0].attribs['data-test']).toBe('1');
      expect($apple.attr('data-test')).toBe('1');
    });

    it('(key, value) : handle removed boolean attributes', function () {
      var $apple = $('.apple');
      $apple.attr('autofocus', 'autofocus');
      expect($apple.attr('autofocus')).toBe('autofocus');
      $apple.removeAttr('autofocus');
      expect($apple.attr('autofocus')).toBe(undefined);
    });

    it('(key, value) : should remove non-boolean attributes with names or values similar to boolean ones', function () {
      var $apple = $('.apple');
      $apple.attr('data-autofocus', 'autofocus');
      expect($apple.attr('data-autofocus')).toBe('autofocus');
      $apple.removeAttr('data-autofocus');
      expect($apple.attr('data-autofocus')).toBe(undefined);
    });

    it('(key, value) : should remove attributes when called with null value', function () {
      var $pear = $('.pear').attr('autofocus', 'autofocus');
      expect($pear.attr('autofocus')).toBe('autofocus');
      $pear.attr('autofocus', null);
      expect($pear.attr('autofocus')).toBe(undefined);
    });

    it('(map) : should remove attributes with null values', function () {
      var $pear = $('.pear').attr({
        autofocus: 'autofocus',
        style: 'color:red',
      });
      expect($pear.attr('autofocus')).toBe('autofocus');
      expect($pear.attr('style')).toBe('color:red');
      $pear.attr({ autofocus: null, style: 'color:blue' });
      expect($pear.attr('autofocus')).toBe(undefined);
      expect($pear.attr('style')).toBe('color:blue');
    });

    it('(chaining) setting value and calling attr returns result', function () {
      var pearAttr = $('.pear').attr('foo', 'bar').attr('foo');
      expect(pearAttr).toBe('bar');
    });

    it('(chaining) setting attr to null returns a $', function () {
      var $pear = $('.pear').attr('foo', null);
      expect($pear).toBeInstanceOf($);
    });

    it('(chaining) setting attr to undefined returns a $', function () {
      var $pear = $('.pear').attr('foo', undefined);
      expect($('.pear')).toHaveLength(1);
      expect($('.pear').attr('foo')).toBe('undefined');
      expect($pear).toBeInstanceOf($);
    });
  });

  describe('.prop', function () {
    var checkbox;
    var selectMenu;

    beforeEach(function () {
      $ = cheerio.load(inputs);
      selectMenu = $('select');
      checkbox = $('input[name=checkbox_on]');
    });

    it('(valid key) : valid prop should get value', function () {
      expect(checkbox.prop('checked')).toBe(true);
      checkbox.css('display', 'none');
      expect(checkbox.prop('style').display).toBe('none');
      expect(checkbox.prop('style')).toHaveLength(1);
      expect(checkbox.prop('style')).toContain('display');
      expect(checkbox.prop('tagName')).toBe('INPUT');
      expect(checkbox.prop('nodeName')).toBe('INPUT');
    });

    it('(invalid key) : invalid prop should get undefined', function () {
      var attr = checkbox.prop('lol');
      expect(attr).toBe(undefined);
    });

    it('(key, value) : should set prop', function () {
      expect(checkbox.prop('checked')).toBe(true);
      checkbox.prop('checked', false);
      expect(checkbox.prop('checked')).toBe(false);
      checkbox.prop('checked', true);
      expect(checkbox.prop('checked')).toBe(true);
    });

    it('(key, value) : should update attribute', function () {
      expect(checkbox.prop('checked')).toBe(true);
      expect(checkbox.attr('checked')).toBe('checked');
      checkbox.prop('checked', false);
      expect(checkbox.prop('checked')).toBe(false);
      expect(checkbox.attr('checked')).toBe(undefined);
      checkbox.prop('checked', true);
      expect(checkbox.prop('checked')).toBe(true);
      expect(checkbox.attr('checked')).toBe('checked');
    });

    it('(map) : object map should set multiple props', function () {
      checkbox.prop({
        id: 'check',
        checked: false,
      });
      expect(checkbox.prop('id')).toBe('check');
      expect(checkbox.prop('checked')).toBe(false);
    });

    it('(key, function) : should call the function and update the prop with the return value', function () {
      checkbox.prop('checked', function (index, value) {
        expect(index).toBe(0);
        expect(value).toBe(true);
        return false;
      });
      expect(checkbox.prop('checked')).toBe(false);
    });

    it('(key, value) : should support chaining after setting props', function () {
      expect(checkbox.prop('checked', false)).toBe(checkbox);
    });

    it('(invalid element/tag) : prop should return undefined', function () {
      expect($(undefined).prop('prop')).toBe(undefined);
      expect($(null).prop('prop')).toBe(undefined);
    });

    it('("outerHTML") : should render properly', function () {
      var outerHtml = '<div><a></a></div>';
      var $a = $(outerHtml);

      expect($a.prop('outerHTML')).toBe(outerHtml);
    });

    it('("innerHTML") : should render properly', function () {
      var $a = $('<div><a></a></div>');

      expect($a.prop('innerHTML')).toBe('<a></a>');
    });

    it('(inherited properties) : prop should support inherited properties', function () {
      expect(selectMenu.prop('childNodes')).toBe(selectMenu[0].childNodes);
    });
  });

  describe('.data', function () {
    beforeEach(function () {
      $ = cheerio.load(chocolates);
    });

    it('() : should get all data attributes initially declared in the markup', function () {
      var data = $('.linth').data();
      expect(data).toStrictEqual({
        highlight: 'Lindor',
        origin: 'swiss',
      });
    });

    it('() : should get all data set via `data`', function () {
      var $el = cheerio('<div>');
      $el.data('a', 1);
      $el.data('b', 2);

      expect($el.data()).toStrictEqual({
        a: 1,
        b: 2,
      });
    });

    it('() : should get all data attributes initially declared in the markup merged with all data additionally set via `data`', function () {
      var $el = cheerio('<div data-a="a" data-b="b">');
      $el.data('b', 'b-modified');
      $el.data('c', 'c');

      expect($el.data()).toStrictEqual({
        a: 'a',
        b: 'b-modified',
        c: 'c',
      });
    });

    it('() : no data attribute should return an empty object', function () {
      var data = $('.cailler').data();
      expect(Object.keys(data)).toHaveLength(0);
    });

    it('(invalid key) : invalid data attribute should return `undefined` ', function () {
      var data = $('.frey').data('lol');
      expect(data).toBe(undefined);
    });

    it('(valid key) : valid data attribute should get value', function () {
      var highlight = $('.linth').data('highlight');
      var origin = $('.linth').data('origin');

      expect(highlight).toBe('Lindor');
      expect(origin).toBe('swiss');
    });

    it('(key) : should translate camel-cased key values to hyphen-separated versions', function () {
      var $el = cheerio(
        '<div data--three-word-attribute="a" data-foo-Bar_BAZ-="b">'
      );

      expect($el.data('ThreeWordAttribute')).toBe('a');
      expect($el.data('fooBar_baz-')).toBe('b');
    });

    it('(key) : should retrieve object values', function () {
      var data = {};
      var $el = cheerio('<div>');

      $el.data('test', data);

      expect($el.data('test')).toBe(data);
    });

    it('(key) : should parse JSON data derived from the markup', function () {
      var $el = cheerio('<div data-json="[1, 2, 3]">');

      expect($el.data('json')).toStrictEqual([1, 2, 3]);
    });

    it('(key) : should not parse JSON data set via the `data` API', function () {
      var $el = cheerio('<div>');
      $el.data('json', '[1, 2, 3]');

      expect($el.data('json')).toBe('[1, 2, 3]');
    });

    // See https://api.jquery.com/data/ and https://bugs.jquery.com/ticket/14523
    it('(key) : should ignore the markup value after the first access', function () {
      var $el = cheerio('<div data-test="a">');

      expect($el.data('test')).toBe('a');

      $el.attr('data-test', 'b');

      expect($el.data('test')).toBe('a');
    });

    it('(key) : should recover from malformed JSON', function () {
      var $el = cheerio('<div data-custom="{{templatevar}}">');

      expect($el.data('custom')).toBe('{{templatevar}}');
    });

    it('(hyphen key) : data addribute with hyphen should be camelized ;-)', function () {
      var data = $('.frey').data();
      expect(data).toStrictEqual({
        taste: 'sweet',
        bestCollection: 'Mahony',
      });
    });

    it('(key, value) : should set data attribute', function () {
      // Adding as object.
      var a = $('.frey').data({
        balls: 'giandor',
      });
      // Adding as string.
      var b = $('.linth').data('snack', 'chocoletti');

      expect(a.data('balls')).toStrictEqual('giandor');
      expect(b.data('snack')).toStrictEqual('chocoletti');
    });

    it('(key, value) : should set data for all elements in the selection', function () {
      $('li').data('foo', 'bar');

      expect($('li').eq(0).data('foo')).toStrictEqual('bar');
      expect($('li').eq(1).data('foo')).toStrictEqual('bar');
      expect($('li').eq(2).data('foo')).toStrictEqual('bar');
    });

    it('(map) : object map should set multiple data attributes', function () {
      var data = $('.linth').data({
        id: 'Cailler',
        flop: 'Pippilotti Rist',
        top: 'Frigor',
        url: 'http://www.cailler.ch/',
      })['0'].data;

      expect(data.id).toBe('Cailler');
      expect(data.flop).toBe('Pippilotti Rist');
      expect(data.top).toBe('Frigor');
      expect(data.url).toBe('http://www.cailler.ch/');
    });

    describe('(attr) : data-* attribute type coercion :', function () {
      it('boolean', function () {
        var $el = cheerio('<div data-bool="true">');
        expect($el.data('bool')).toBe(true);
      });

      it('number', function () {
        var $el = cheerio('<div data-number="23">');
        expect($el.data('number')).toBe(23);
      });

      it('number (scientific notation is not coerced)', function () {
        var $el = cheerio('<div data-sci="1E10">');
        expect($el.data('sci')).toBe('1E10');
      });

      it('null', function () {
        var $el = cheerio('<div data-null="null">');
        expect($el.data('null')).toBe(null);
      });

      it('object', function () {
        var $el = cheerio('<div data-obj=\'{ "a": 45 }\'>');
        expect($el.data('obj')).toStrictEqual({ a: 45 });
      });

      it('array', function () {
        var $el = cheerio('<div data-array="[1, 2, 3]">');
        expect($el.data('array')).toStrictEqual([1, 2, 3]);
      });
    });
  });

  describe('.val', function () {
    beforeEach(function () {
      $ = cheerio.load(inputs);
    });

    it('(): on select should get value', function () {
      var val = $('select#one').val();
      expect(val).toBe('option_selected');
    });
    it('(): on select with no value should get text', function () {
      var val = $('select#one-valueless').val();
      expect(val).toBe('Option selected');
    });
    it('(): on select with no value should get converted HTML', function () {
      var val = $('select#one-html-entity').val();
      expect(val).toBe('Option <selected>');
    });
    it('(): on select with no value should get text content', function () {
      var val = $('select#one-nested').val();
      expect(val).toBe('Option selected');
    });
    it('(): on option should get value', function () {
      var val = $('select#one option').eq(0).val();
      expect(val).toBe('option_not_selected');
    });
    it('(): on text input should get value', function () {
      var val = $('input[type="text"]').val();
      expect(val).toBe('input_text');
    });
    it('(): on checked checkbox should get value', function () {
      var val = $('input[name="checkbox_on"]').val();
      expect(val).toBe('on');
    });
    it('(): on unchecked checkbox should get value', function () {
      var val = $('input[name="checkbox_off"]').val();
      expect(val).toBe('off');
    });
    it('(): on valueless checkbox should get value', function () {
      var val = $('input[name="checkbox_valueless"]').val();
      expect(val).toBe('on');
    });
    it('(): on radio should get value', function () {
      var val = $('input[type="radio"]').val();
      expect(val).toBe('off');
    });
    it('(): on valueless radio should get value', function () {
      var val = $('input[name="radio_valueless"]').val();
      expect(val).toBe('on');
    });
    it('(): on multiple select should get an array of values', function () {
      var val = $('select#multi').val();
      expect(val).toStrictEqual(['2', '3']);
    });
    it('(): on multiple select with no value attribute should get an array of text content', function () {
      var val = $('select#multi-valueless').val();
      expect(val).toStrictEqual(['2', '3']);
    });
    it('(): with no selector matches should return nothing', function () {
      var val = $('.nasty').val();
      expect(val).toBe(undefined);
    });
    it('(invalid value): should only handle arrays when it has the attribute multiple', function () {
      var val = $('select#one').val([]);
      expect(val).not.toBe(undefined);
    });
    it('(value): on input text should set value', function () {
      var element = $('input[type="text"]').val('test');
      expect(element.val()).toBe('test');
    });
    it('(value): on select should set value', function () {
      var element = $('select#one').val('option_not_selected');
      expect(element.val()).toBe('option_not_selected');
    });
    it('(value): on option should set value', function () {
      var element = $('select#one option').eq(0).val('option_changed');
      expect(element.val()).toBe('option_changed');
    });
    it('(value): on radio should set value', function () {
      var element = $('input[name="radio"]').val('off');
      expect(element.val()).toBe('off');
    });
    it('(value): on radio with special characters should set value', function () {
      var element = $('input[name="radio[brackets]"]').val('off');
      expect(element.val()).toBe('off');
    });
    it('(values): on multiple select should set multiple values', function () {
      var element = $('select#multi').val(['1', '3', '4']);
      expect(element.val()).toHaveLength(3);
    });
  });

  describe('.removeAttr', function () {
    it('(key) : should remove a single attr', function () {
      var $fruits = $('#fruits');
      expect($fruits.attr('id')).not.toBe(undefined);
      $fruits.removeAttr('id');
      expect($fruits.attr('id')).toBe(undefined);
    });

    it('(key key): should remove multiple attrs', function () {
      var $apple = $('.apple');
      $apple.attr('id', 'favorite');
      $apple.attr('size', 'small');

      expect($apple.attr('id')).toBe('favorite');
      expect($apple.attr('class')).toBe('apple');
      expect($apple.attr('size')).toBe('small');
      $apple.removeAttr('id class');
      expect($apple.attr('id')).toBe(undefined);
      expect($apple.attr('class')).toBe(undefined);
      expect($apple.attr('size')).toBe('small');
    });

    it('should return cheerio object', function () {
      var obj = $('ul').removeAttr('id');
      expect(obj).toBeInstanceOf($);
    });
  });

  describe('.hasClass', function () {
    function test(attr) {
      return cheerio('<div class="' + attr + '"></div>');
    }

    it('(valid class) : should return true', function () {
      var cls = $('.apple').hasClass('apple');
      expect(cls).toBeTruthy();

      expect(test('foo').hasClass('foo')).toBeTruthy();
      expect(test('foo bar').hasClass('foo')).toBeTruthy();
      expect(test('bar foo').hasClass('foo')).toBeTruthy();
      expect(test('bar foo bar').hasClass('foo')).toBeTruthy();
    });

    it('(invalid class) : should return false', function () {
      var cls = $('#fruits').hasClass('fruits');
      expect(cls).toBeFalsy();
      expect(test('foo-bar').hasClass('foo')).toBeFalsy();
      expect(test('foo-bar').hasClass('foo')).toBeFalsy();
      expect(test('foo-bar').hasClass('foo-ba')).toBeFalsy();
    });

    it('should check multiple classes', function () {
      // Add a class
      $('.apple').addClass('red');
      expect($('.apple').hasClass('apple')).toBeTruthy();
      expect($('.apple').hasClass('red')).toBeTruthy();

      // Remove one and test again
      $('.apple').removeClass('apple');
      expect($('li').eq(0).hasClass('apple')).toBeFalsy();
    });

    it('(empty string argument) : should return false', function () {
      expect(test('foo').hasClass('')).toBeFalsy();
      expect(test('foo bar').hasClass('')).toBeFalsy();
      expect(test('foo bar').removeClass('foo').hasClass('')).toBeFalsy();
    });
  });

  describe('.addClass', function () {
    it('(first class) : should add the class to the element', function () {
      var $fruits = $('#fruits');
      $fruits.addClass('fruits');
      var cls = $fruits.hasClass('fruits');
      expect(cls).toBeTruthy();
    });

    it('(single class) : should add the class to the element', function () {
      $('.apple').addClass('fruit');
      var cls = $('.apple').hasClass('fruit');
      expect(cls).toBeTruthy();
    });

    it('(class): adds classes to many selected items', function () {
      $('li').addClass('fruit');
      expect($('.apple').hasClass('fruit')).toBeTruthy();
      expect($('.orange').hasClass('fruit')).toBeTruthy();
      expect($('.pear').hasClass('fruit')).toBeTruthy();
    });

    it('(class class class) : should add multiple classes to the element', function () {
      $('.apple').addClass('fruit red tasty');
      expect($('.apple').hasClass('apple')).toBeTruthy();
      expect($('.apple').hasClass('fruit')).toBeTruthy();
      expect($('.apple').hasClass('red')).toBeTruthy();
      expect($('.apple').hasClass('tasty')).toBeTruthy();
    });

    it('(fn) : should add classes returned from the function', function () {
      var $fruits = $('#fruits').children();
      var args = [];
      var thisVals = [];
      var toAdd = ['apple red', '', undefined];

      $fruits.addClass(function (idx) {
        args.push(Array.from(arguments));
        thisVals.push(this);
        return toAdd[idx];
      });

      expect(args).toStrictEqual([
        [0, 'apple'],
        [1, 'orange'],
        [2, 'pear'],
      ]);
      expect(thisVals).toStrictEqual([$fruits[0], $fruits[1], $fruits[2]]);
      expect($fruits.eq(0).hasClass('apple')).toBeTruthy();
      expect($fruits.eq(0).hasClass('red')).toBeTruthy();
      expect($fruits.eq(1).hasClass('orange')).toBeTruthy();
      expect($fruits.eq(2).hasClass('pear')).toBeTruthy();
    });
  });

  describe('.removeClass', function () {
    it('() : should remove all the classes', function () {
      $('.pear').addClass('fruit');
      $('.pear').removeClass();
      expect($('.pear').attr('class')).toBe(undefined);
    });

    it('("") : should not modify class list', function () {
      var $fruits = $('#fruits');
      $fruits.children().removeClass('');
      expect($('.apple')).toHaveLength(1);
    });

    it('(invalid class) : should not remove anything', function () {
      $('.pear').removeClass('fruit');
      expect($('.pear').hasClass('pear')).toBeTruthy();
    });

    it('(no class attribute) : should not throw an exception', function () {
      var $vegetables = cheerio(vegetables);

      expect(function () {
        $('li', $vegetables).removeClass('vegetable');
      }).not.toThrow();
    });

    it('(single class) : should remove a single class from the element', function () {
      $('.pear').addClass('fruit');
      expect($('.pear').hasClass('fruit')).toBeTruthy();
      $('.pear').removeClass('fruit');
      expect($('.pear').hasClass('fruit')).toBeFalsy();
      expect($('.pear').hasClass('pear')).toBeTruthy();
    });

    it('(single class) : should remove a single class from multiple classes on the element', function () {
      $('.pear').addClass('fruit green tasty');
      expect($('.pear').hasClass('fruit')).toBeTruthy();
      expect($('.pear').hasClass('green')).toBeTruthy();
      expect($('.pear').hasClass('tasty')).toBeTruthy();

      $('.pear').removeClass('green');
      expect($('.pear').hasClass('fruit')).toBeTruthy();
      expect($('.pear').hasClass('green')).toBeFalsy();
      expect($('.pear').hasClass('tasty')).toBeTruthy();
    });

    it('(class class class) : should remove multiple classes from the element', function () {
      $('.apple').addClass('fruit red tasty');
      expect($('.apple').hasClass('apple')).toBeTruthy();
      expect($('.apple').hasClass('fruit')).toBeTruthy();
      expect($('.apple').hasClass('red')).toBeTruthy();
      expect($('.apple').hasClass('tasty')).toBeTruthy();

      $('.apple').removeClass('apple red tasty');
      expect($('.fruit').hasClass('apple')).toBeFalsy();
      expect($('.fruit').hasClass('red')).toBeFalsy();
      expect($('.fruit').hasClass('tasty')).toBeFalsy();
      expect($('.fruit').hasClass('fruit')).toBeTruthy();
    });

    it('(class) : should remove all occurrences of a class name', function () {
      var $div = cheerio('<div class="x x y x z"></div>');
      expect($div.removeClass('x').hasClass('x')).toBe(false);
    });

    it('(fn) : should remove classes returned from the function', function () {
      var $fruits = $('#fruits').children();
      var args = [];
      var thisVals = [];
      var toAdd = ['apple red', '', undefined];

      $fruits.removeClass(function (idx) {
        args.push(Array.from(arguments));
        thisVals.push(this);
        return toAdd[idx];
      });

      expect(args).toStrictEqual([
        [0, 'apple'],
        [1, 'orange'],
        [2, 'pear'],
      ]);
      expect(thisVals).toStrictEqual([$fruits[0], $fruits[1], $fruits[2]]);
      expect($fruits.eq(0).hasClass('apple')).toBeFalsy();
      expect($fruits.eq(0).hasClass('red')).toBeFalsy();
      expect($fruits.eq(1).hasClass('orange')).toBeTruthy();
      expect($fruits.eq(2).hasClass('pear')).toBeTruthy();
    });

    it('(fn) : should no op elements without attributes', function () {
      var $inputs = $(inputs);
      var val = $inputs.removeClass(function () {
        return 'tasty';
      });
      expect(val).toHaveLength(15);
    });
  });

  describe('.toggleClass', function () {
    it('(class class) : should toggle multiple classes from the element', function () {
      $('.apple').addClass('fruit');
      expect($('.apple').hasClass('apple')).toBeTruthy();
      expect($('.apple').hasClass('fruit')).toBeTruthy();
      expect($('.apple').hasClass('red')).toBeFalsy();

      $('.apple').toggleClass('apple red');
      expect($('.fruit').hasClass('apple')).toBeFalsy();
      expect($('.fruit').hasClass('red')).toBeTruthy();
      expect($('.fruit').hasClass('fruit')).toBeTruthy();
    });

    it('(class class, true) : should add multiple classes to the element', function () {
      $('.apple').addClass('fruit');
      expect($('.apple').hasClass('apple')).toBeTruthy();
      expect($('.apple').hasClass('fruit')).toBeTruthy();
      expect($('.apple').hasClass('red')).toBeFalsy();

      $('.apple').toggleClass('apple red', true);
      expect($('.fruit').hasClass('apple')).toBeTruthy();
      expect($('.fruit').hasClass('red')).toBeTruthy();
      expect($('.fruit').hasClass('fruit')).toBeTruthy();
    });

    it('(class true) : should add only one instance of class', function () {
      $('.apple').toggleClass('tasty', true);
      $('.apple').toggleClass('tasty', true);
      expect($('.apple').attr('class').match(/tasty/g).length).toBe(1);
    });

    it('(class class, false) : should remove multiple classes from the element', function () {
      $('.apple').addClass('fruit');
      expect($('.apple').hasClass('apple')).toBeTruthy();
      expect($('.apple').hasClass('fruit')).toBeTruthy();
      expect($('.apple').hasClass('red')).toBeFalsy();

      $('.apple').toggleClass('apple red', false);
      expect($('.fruit').hasClass('apple')).toBeFalsy();
      expect($('.fruit').hasClass('red')).toBeFalsy();
      expect($('.fruit').hasClass('fruit')).toBeTruthy();
    });

    it('(fn) : should toggle classes returned from the function', function () {
      $ = cheerio.load(food);

      $('.apple').addClass('fruit');
      $('.carrot').addClass('vegetable');
      expect($('.apple').hasClass('fruit')).toBeTruthy();
      expect($('.apple').hasClass('vegetable')).toBeFalsy();
      expect($('.orange').hasClass('fruit')).toBeFalsy();
      expect($('.orange').hasClass('vegetable')).toBeFalsy();
      expect($('.carrot').hasClass('fruit')).toBeFalsy();
      expect($('.carrot').hasClass('vegetable')).toBeTruthy();
      expect($('.sweetcorn').hasClass('fruit')).toBeFalsy();
      expect($('.sweetcorn').hasClass('vegetable')).toBeFalsy();

      $('li').toggleClass(function () {
        return $(this).parent().is('#fruits') ? 'fruit' : 'vegetable';
      });
      expect($('.apple').hasClass('fruit')).toBeFalsy();
      expect($('.apple').hasClass('vegetable')).toBeFalsy();
      expect($('.orange').hasClass('fruit')).toBeTruthy();
      expect($('.orange').hasClass('vegetable')).toBeFalsy();
      expect($('.carrot').hasClass('fruit')).toBeFalsy();
      expect($('.carrot').hasClass('vegetable')).toBeFalsy();
      expect($('.sweetcorn').hasClass('fruit')).toBeFalsy();
      expect($('.sweetcorn').hasClass('vegetable')).toBeTruthy();
    });

    it('(fn) : should work with no initial class attribute', function () {
      var $inputs = cheerio.load(inputs);
      $inputs('input, select').toggleClass(function () {
        return $inputs(this).get(0).tagName === 'select'
          ? 'selectable'
          : 'inputable';
      });
      expect($inputs('.selectable')).toHaveLength(6);
      expect($inputs('.inputable')).toHaveLength(9);
    });

    it('(invalid) : should be a no-op for invalid inputs', function () {
      var original = $('.apple');
      var testAgainst = original.attr('class');
      expect(original.toggleClass().attr('class')).toStrictEqual(testAgainst);
      expect(original.toggleClass(true).attr('class')).toStrictEqual(
        testAgainst
      );
      expect(original.toggleClass(false).attr('class')).toStrictEqual(
        testAgainst
      );
      expect(original.toggleClass(null).attr('class')).toStrictEqual(
        testAgainst
      );
      expect(original.toggleClass(0).attr('class')).toStrictEqual(testAgainst);
      expect(original.toggleClass(1).attr('class')).toStrictEqual(testAgainst);
      expect(original.toggleClass({}).attr('class')).toStrictEqual(testAgainst);
    });
  });

  describe('.is', function () {
    it('() : should return false', function () {
      expect($('li.apple').is()).toBe(false);
    });

    it('(true selector) : should return true', function () {
      expect(cheerio('#vegetables', vegetables).is('ul')).toBe(true);
    });

    it('(false selector) : should return false', function () {
      expect(cheerio('#vegetables', vegetables).is('div')).toBe(false);
    });

    it('(true selection) : should return true', function () {
      var $vegetables = cheerio('li', vegetables);
      expect($vegetables.is($vegetables.eq(1))).toBe(true);
    });

    it('(false selection) : should return false', function () {
      var $vegetableList = cheerio(vegetables);
      var $vegetables = $vegetableList.find('li');
      expect($vegetables.is($vegetableList)).toBe(false);
    });

    it('(true element) : should return true', function () {
      var $vegetables = cheerio('li', vegetables);
      expect($vegetables.is($vegetables[0])).toBe(true);
    });

    it('(false element) : should return false', function () {
      var $vegetableList = cheerio(vegetables);
      var $vegetables = $vegetableList.find('li');
      expect($vegetables.is($vegetableList[0])).toBe(false);
    });

    it('(true predicate) : should return true', function () {
      var result = $('li').is(function () {
        return this.tagName === 'li' && $(this).hasClass('pear');
      });
      expect(result).toBe(true);
    });

    it('(false predicate) : should return false', function () {
      var result = $('li')
        .last()
        .is(function () {
          return this.tagName === 'ul';
        });
      expect(result).toBe(false);
    });
  });
});
