import cheerio from '..';
import type { Cheerio } from '../cheerio';
import type { Element } from 'domhandler';
import {
  script,
  fruits,
  vegetables,
  food,
  chocolates,
  inputs,
  mixedText,
} from '../__fixtures__/fixtures';

describe('$(...)', () => {
  let $: typeof cheerio;

  beforeEach(() => {
    $ = cheerio.load(fruits);
  });

  describe('.attr', () => {
    it('() : should get all the attributes', () => {
      const attrs = $('ul').attr();
      expect(attrs.id).toBe('fruits');
    });

    it('(invalid key) : invalid attr should get undefined', () => {
      const attr = $('.apple').attr('lol');
      expect(attr).toBeUndefined();
    });

    it('(valid key) : valid attr should get value', () => {
      const cls = $('.apple').attr('class');
      expect(cls).toBe('apple');
    });

    it('(valid key) : valid attr should get name when boolean', () => {
      const attr = $('<input name=email autofocus>').attr('autofocus');
      expect(attr).toBe('autofocus');
    });

    it('(key, value) : should set one attr', () => {
      const $pear = $('.pear').attr('id', 'pear');
      expect($('#pear')).toHaveLength(1);
      expect($pear).toBeInstanceOf($);
    });

    it('(key, value) : should set multiple attr', () => {
      const $el = cheerio('<div></div> <div></div>').attr(
        'class',
        'pear'
      ) as Cheerio<Element>;

      expect($el[0].attribs.class).toBe('pear');
      expect($el[1].attribs).toBeUndefined();
      expect($el[2].attribs.class).toBe('pear');
    });

    it('(key, value) : should return an empty object for an empty object', () => {
      const $src = $().attr('key', 'value');
      expect($src.length).toBe(0);
      expect($src[0]).toBeUndefined();
    });

    it('(map) : object map should set multiple attributes', () => {
      $('.apple').attr({
        id: 'apple',
        style: 'color:red;',
        'data-url': 'http://apple.com',
      });
      const attrs = $('.apple').attr();
      expect(attrs.id).toBe('apple');
      expect(attrs.style).toBe('color:red;');
      expect(attrs['data-url']).toBe('http://apple.com');
    });

    it('(map, val) : should throw with wrong combination of arguments', () => {
      expect(() =>
        $('.apple').attr(
          {
            id: 'apple',
            style: 'color:red;',
            'data-url': 'http://apple.com',
          } as any,
          () => ''
        )
      ).toThrow('Bad combination of arguments.');
    });

    it('(key, function) : should call the function and update the attribute with the return value', () => {
      const $fruits = $('#fruits');
      $fruits.attr('id', (index, value) => {
        expect(index).toBe(0);
        expect(value).toBe('fruits');
        return 'ninja';
      });
      const attrs = $fruits.attr();
      expect(attrs.id).toBe('ninja');
    });

    it('(key, function) : should ignore text nodes', () => {
      const $text = $(mixedText);
      $text.attr('class', () => 'ninja');
      const className = $text.attr('class');
      expect(className).toBe('ninja');
    });

    it('(key, value) : should correctly encode then decode unsafe values', () => {
      const $apple = $('.apple');
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

    it('(key, value) : should coerce values to a string', () => {
      const $apple = $('.apple');
      $apple.attr('data-test', 1 as any);
      expect($apple[0].attribs['data-test']).toBe('1');
      expect($apple.attr('data-test')).toBe('1');
    });

    it('(key, value) : handle removed boolean attributes', () => {
      const $apple = $('.apple');
      $apple.attr('autofocus', 'autofocus');
      expect($apple.attr('autofocus')).toBe('autofocus');
      $apple.removeAttr('autofocus');
      expect($apple.attr('autofocus')).toBeUndefined();
    });

    it('(key, value) : should remove non-boolean attributes with names or values similar to boolean ones', () => {
      const $apple = $('.apple');
      $apple.attr('data-autofocus', 'autofocus');
      expect($apple.attr('data-autofocus')).toBe('autofocus');
      $apple.removeAttr('data-autofocus');
      expect($apple.attr('data-autofocus')).toBeUndefined();
    });

    it('(key, value) : should remove attributes when called with null value', () => {
      const $pear = $('.pear').attr('autofocus', 'autofocus');
      expect($pear.attr('autofocus')).toBe('autofocus');
      $pear.attr('autofocus', null);
      expect($pear.attr('autofocus')).toBeUndefined();
    });

    it('(map) : should remove attributes with null values', () => {
      const $pear = $('.pear').attr({
        autofocus: 'autofocus',
        style: 'color:red',
      });
      expect($pear.attr('autofocus')).toBe('autofocus');
      expect($pear.attr('style')).toBe('color:red');
      $pear.attr({ autofocus: null, style: 'color:blue' });
      expect($pear.attr('autofocus')).toBeUndefined();
      expect($pear.attr('style')).toBe('color:blue');
    });

    it('(chaining) setting value and calling attr returns result', () => {
      const pearAttr = $('.pear').attr('foo', 'bar').attr('foo');
      expect(pearAttr).toBe('bar');
    });

    it('(chaining) setting attr to null returns a $', () => {
      const $pear = $('.pear').attr('foo', null);
      expect($pear).toBeInstanceOf($);
    });

    it('(chaining) setting attr to undefined returns a $', () => {
      const $pear = $('.pear').attr('foo', undefined);
      expect($('.pear')).toHaveLength(1);
      expect($('.pear').attr('foo')).toBeUndefined();
      expect($pear).toBeInstanceOf($);
    });

    it("(bool) shouldn't treat boolean attributes differently in XML mode", () => {
      const $xml = $.load(`<input checked=checked disabled=yes />`, {
        xml: true,
      })('input');

      expect($xml.attr('checked')).toBe('checked');
      expect($xml.attr('disabled')).toBe('yes');
    });
  });

  describe('.prop', () => {
    let checkbox: Cheerio<Element>;
    let selectMenu: Cheerio<Element>;

    beforeEach(() => {
      $ = cheerio.load(inputs);
      selectMenu = $('select');
      checkbox = $('input[name=checkbox_on]');
    });

    it('(valid key) : valid prop should get value', () => {
      expect(checkbox.prop('checked')).toBe(true);
      checkbox.css('display', 'none');
      expect(checkbox.prop('style').display).toBe('none');
      expect(checkbox.prop('style')).toHaveLength(1);
      expect(checkbox.prop('style')).toContain('display');
      expect(checkbox.prop('tagName')).toBe('INPUT');
      expect(checkbox.prop('nodeName')).toBe('INPUT');
    });

    it('(invalid key) : invalid prop should get undefined', () => {
      expect(checkbox.prop('lol')).toBeUndefined();
      expect(checkbox.prop(4 as any)).toBeUndefined();
      expect(checkbox.prop(true as any)).toBeUndefined();
    });

    it('(key, value) : should set prop', () => {
      expect(checkbox.prop('checked')).toBe(true);
      checkbox.prop('checked', false);
      expect(checkbox.prop('checked')).toBe(false);
      checkbox.prop('checked', true);
      expect(checkbox.prop('checked')).toBe(true);
    });

    it('(key, value) : should update attribute', () => {
      expect(checkbox.prop('checked')).toBe(true);
      expect(checkbox.attr('checked')).toBe('checked');
      checkbox.prop('checked', false);
      expect(checkbox.prop('checked')).toBe(false);
      expect(checkbox.attr('checked')).toBeUndefined();
      checkbox.prop('checked', true);
      expect(checkbox.prop('checked')).toBe(true);
      expect(checkbox.attr('checked')).toBe('checked');
    });

    it('(key, value) : should update namespace', () => {
      const imgs = $('<img>\n\n<img>\n\n<img>');
      const nsHtml = 'http://www.w3.org/1999/xhtml';
      imgs.prop('src', '#').prop('namespace', nsHtml);
      expect(imgs.prop('namespace')).toBe(nsHtml);
      imgs.prop('attribs', null);
      expect(imgs.prop('src')).toBeUndefined();
    });

    it('(map) : object map should set multiple props', () => {
      checkbox.prop({
        id: 'check',
        checked: false,
      });
      expect(checkbox.prop('id')).toBe('check');
      expect(checkbox.prop('checked')).toBe(false);
    });

    it('(map, val) : should throw with wrong combination of arguments', () => {
      expect(() =>
        $('.apple').prop(
          {
            id: 'check',
            checked: false,
          } as any,
          () => ''
        )
      ).toThrow('Bad combination of arguments.');
    });

    it('(key, function) : should call the function and update the prop with the return value', () => {
      checkbox.prop('checked', (index, value) => {
        expect(index).toBe(0);
        expect(value).toBe(true);
        return false;
      });
      expect(checkbox.prop('checked')).toBe(false);
    });

    it('(key, value) : should support chaining after setting props', () => {
      expect(checkbox.prop('checked', false)).toBe(checkbox);
    });

    it('(invalid element/tag) : prop should return undefined', () => {
      expect($(undefined).prop('prop')).toBeUndefined();
      expect($(null as any).prop('prop')).toBeUndefined();
    });

    it('("outerHTML") : should render properly', () => {
      const outerHtml = '<div><a></a></div>';
      const $a = $(outerHtml);

      expect($a.prop('outerHTML')).toBe(outerHtml);
    });

    it('("innerHTML") : should render properly', () => {
      const $a = $('<div><a></a></div>');

      expect($a.prop('innerHTML')).toBe('<a></a>');
    });

    it('("textContent") : should render properly', () => {
      expect(selectMenu.children().prop('textContent')).toBe(
        'Option not selected'
      );

      expect($(script).prop('textContent')).toBe('A  var foo = "bar";B');
    });

    it('("innerText") : should render properly', () => {
      expect(selectMenu.children().prop('innerText')).toBe(
        'Option not selected'
      );

      expect($(script).prop('innerText')).toBe('AB');
    });

    it('(inherited properties) : prop should support inherited properties', () => {
      expect(selectMenu.prop('childNodes')).toBe(selectMenu[0].childNodes);
    });

    it('(key) : should skip text nodes', () => {
      const $text = cheerio.load(mixedText);
      const $body = $text($text('body')[0].children);

      expect($text($body[1]).prop('tagName')).toBeUndefined();

      $body.prop('test-name', () => 'tester');
      expect($text('body').html()).toBe(
        '<a test-name="tester">1</a>TEXT<b test-name="tester">2</b>'
      );
    });

    it("(bool) shouldn't treat boolean attributes differently in XML mode", () => {
      const $xml = $.load(`<input checked=checked disabled=yes />`, {
        xml: true,
      })('input');

      expect($xml.prop('checked')).toBe('checked');
      expect($xml.prop('disabled')).toBe('yes');
    });
  });

  describe('.data', () => {
    beforeEach(() => {
      $ = cheerio.load(chocolates);
    });

    it('() : should get all data attributes initially declared in the markup', () => {
      const data = $('.linth').data();
      expect(data).toStrictEqual({
        highlight: 'Lindor',
        origin: 'swiss',
      });
    });

    it('() : should get all data set via `data`', () => {
      const $el = cheerio('<div>');
      $el.data('a', 1);
      $el.data('b', 2);

      expect($el.data()).toStrictEqual({
        a: 1,
        b: 2,
      });
    });

    it('() : should get all data attributes initially declared in the markup merged with all data additionally set via `data`', () => {
      const $el = cheerio('<div data-a="a" data-b="b">');
      $el.data('b', 'b-modified');
      $el.data('c', 'c');

      expect($el.data()).toStrictEqual({
        a: 'a',
        b: 'b-modified',
        c: 'c',
      });
    });

    it('() : no data attribute should return an empty object', () => {
      const data = $('.cailler').data();
      expect(Object.keys(data)).toHaveLength(0);
      expect($('.free').data()).toBeUndefined();
    });

    it('(invalid key) : invalid data attribute should return `undefined`', () => {
      const data = $('.frey').data('lol');
      expect(data).toBeUndefined();
    });

    it('(valid key) : valid data attribute should get value', () => {
      const highlight = $('.linth').data('highlight');
      const origin = $('.linth').data('origin');

      expect(highlight).toBe('Lindor');
      expect(origin).toBe('swiss');
    });

    it('(key) : should translate camel-cased key values to hyphen-separated versions', () => {
      const $el = cheerio(
        '<div data--three-word-attribute="a" data-foo-Bar_BAZ-="b">'
      );

      expect($el.data('ThreeWordAttribute')).toBe('a');
      expect($el.data('fooBar_baz-')).toBe('b');
    });

    it('(key) : should retrieve object values', () => {
      const data = {};
      const $el = cheerio('<div>');

      $el.data('test', data);

      expect($el.data('test')).toBe(data);
    });

    it('(key) : should parse JSON data derived from the markup', () => {
      const $el = cheerio('<div data-json="[1, 2, 3]">');

      expect($el.data('json')).toStrictEqual([1, 2, 3]);
    });

    it('(key) : should not parse JSON data set via the `data` API', () => {
      const $el = cheerio('<div>');
      $el.data('json', '[1, 2, 3]');

      expect($el.data('json')).toBe('[1, 2, 3]');
    });

    // See https://api.jquery.com/data/ and https://bugs.jquery.com/ticket/14523
    it('(key) : should ignore the markup value after the first access', () => {
      const $el = cheerio('<div data-test="a">');

      expect($el.data('test')).toBe('a');

      $el.attr('data-test', 'b');

      expect($el.data('test')).toBe('a');
    });

    it('(key) : should recover from malformed JSON', () => {
      const $el = cheerio('<div data-custom="{{templatevar}}">');

      expect($el.data('custom')).toBe('{{templatevar}}');
    });

    it('(hyphen key) : data addribute with hyphen should be camelized ;-)', () => {
      const data = $('.frey').data();
      expect(data).toStrictEqual({
        taste: 'sweet',
        bestCollection: 'Mahony',
      });
    });

    it('(key, value) : should set data attribute', () => {
      // Adding as object.
      const a = $('.frey').data({
        balls: 'giandor',
      });
      // Adding as string.
      const b = $('.linth').data('snack', 'chocoletti');

      expect(() => {
        a.data(4 as any, 'throw');
      }).not.toThrow();
      expect(a.data('balls')).toStrictEqual('giandor');
      expect(b.data('snack')).toStrictEqual('chocoletti');
    });

    it('(key, value) : should set data for all elements in the selection', () => {
      $('li').data('foo', 'bar');

      expect($('li').eq(0).data('foo')).toStrictEqual('bar');
      expect($('li').eq(1).data('foo')).toStrictEqual('bar');
      expect($('li').eq(2).data('foo')).toStrictEqual('bar');
    });

    it('(map) : object map should set multiple data attributes', () => {
      const { data } = $('.linth').data({
        id: 'Cailler',
        flop: 'Pippilotti Rist',
        top: 'Frigor',
        url: 'http://www.cailler.ch/',
      })['0' as any] as any;

      expect(data.id).toBe('Cailler');
      expect(data.flop).toBe('Pippilotti Rist');
      expect(data.top).toBe('Frigor');
      expect(data.url).toBe('http://www.cailler.ch/');
    });

    describe('(attr) : data-* attribute type coercion :', () => {
      it('boolean', () => {
        const $el = cheerio('<div data-bool="true">');
        expect($el.data('bool')).toBe(true);
      });

      it('number', () => {
        const $el = cheerio('<div data-number="23">');
        expect($el.data('number')).toBe(23);
      });

      it('number (scientific notation is not coerced)', () => {
        const $el = cheerio('<div data-sci="1E10">');
        expect($el.data('sci')).toBe('1E10');
      });

      it('null', () => {
        const $el = cheerio('<div data-null="null">');
        expect($el.data('null')).toBe(null);
      });

      it('object', () => {
        const $el = cheerio('<div data-obj=\'{ "a": 45 }\'>');
        expect($el.data('obj')).toStrictEqual({ a: 45 });
      });

      it('array', () => {
        const $el = cheerio('<div data-array="[1, 2, 3]">');
        expect($el.data('array')).toStrictEqual([1, 2, 3]);
      });
    });

    it('(key, value) : should skip text nodes', () => {
      const $text = cheerio.load(mixedText);
      const $body = $text($text('body')[0].children);

      $body.data('snack', 'chocoletti');

      expect($text('b').data('snack')).toBe('chocoletti');
    });
  });

  describe('.val', () => {
    beforeEach(() => {
      $ = cheerio.load(inputs);
    });

    it('(): on div should get undefined', () => {
      expect($('<div>').val()).toBeUndefined();
    });

    it('(): on select should get value', () => {
      const val = $('select#one').val();
      expect(val).toBe('option_selected');
    });
    it('(): on select with no value should get text', () => {
      const val = $('select#one-valueless').val();
      expect(val).toBe('Option selected');
    });
    it('(): on select with no value should get converted HTML', () => {
      const val = $('select#one-html-entity').val();
      expect(val).toBe('Option <selected>');
    });
    it('(): on select with no value should get text content', () => {
      const val = $('select#one-nested').val();
      expect(val).toBe('Option selected');
    });
    it('(): on option should get value', () => {
      const val = $('select#one option').eq(0).val();
      expect(val).toBe('option_not_selected');
    });
    it('(): on text input should get value', () => {
      const val = $('input[type="text"]').val();
      expect(val).toBe('input_text');
    });
    it('(): on checked checkbox should get value', () => {
      const val = $('input[name="checkbox_on"]').val();
      expect(val).toBe('on');
    });
    it('(): on unchecked checkbox should get value', () => {
      const val = $('input[name="checkbox_off"]').val();
      expect(val).toBe('off');
    });
    it('(): on valueless checkbox should get value', () => {
      const val = $('input[name="checkbox_valueless"]').val();
      expect(val).toBe('on');
    });
    it('(): on radio should get value', () => {
      const val = $('input[type="radio"]').val();
      expect(val).toBe('off');
    });
    it('(): on valueless radio should get value', () => {
      const val = $('input[name="radio_valueless"]').val();
      expect(val).toBe('on');
    });
    it('(): on multiple select should get an array of values', () => {
      const val = $('select#multi').val();
      expect(val).toStrictEqual(['2', '3']);
    });
    it('(): on multiple select with no value attribute should get an array of text content', () => {
      const val = $('select#multi-valueless').val();
      expect(val).toStrictEqual(['2', '3']);
    });
    it('(): with no selector matches should return nothing', () => {
      const val = $('.nasty').val();
      expect(val).toBeUndefined();
    });
    it('(invalid value): should only handle arrays when it has the attribute multiple', () => {
      const val = $('select#one').val([]);
      expect(val).not.toBeUndefined();
    });
    it('(value): on empty set should get `this`', () => {
      const $empty = $([]);
      expect($empty.val('test')).toBe($empty);
    });
    it('(value): on input text should set value', () => {
      const element = $('input[type="text"]').val('test');
      expect(element.val()).toBe('test');
    });
    it('(value): on select should set value', () => {
      const element = $('select#one').val('option_not_selected');
      expect(element.val()).toBe('option_not_selected');
    });
    it('(value): on option should set value', () => {
      const element = $('select#one option').eq(0).val('option_changed');
      expect(element.val()).toBe('option_changed');
    });
    it('(value): on radio should set value', () => {
      const element = $('input[name="radio"]').val('off');
      expect(element.val()).toBe('off');
    });
    it('(value): on radio with special characters should set value', () => {
      const element = $('input[name="radio[brackets]"]').val('off');
      expect(element.val()).toBe('off');
    });
    it('(values): on multiple select should set multiple values', () => {
      const element = $('select#multi').val(['1', '3', '4']);
      expect(element.val()).toHaveLength(3);
    });
  });

  describe('.removeAttr', () => {
    it('(key) : should remove a single attr', () => {
      const $fruits = $('#fruits');
      expect($fruits.attr('id')).not.toBeUndefined();
      $fruits.removeAttr('id');
      expect($fruits.attr('id')).toBeUndefined();
    });

    it('(key key) : should remove multiple attrs', () => {
      const $apple = $('.apple');
      $apple.attr('id', 'favorite');
      $apple.attr('size', 'small');

      expect($apple.attr('id')).toBe('favorite');
      expect($apple.attr('class')).toBe('apple');
      expect($apple.attr('size')).toBe('small');
      $apple.removeAttr('id class');
      expect($apple.attr('id')).toBeUndefined();
      expect($apple.attr('class')).toBeUndefined();
      expect($apple.attr('size')).toBe('small');
    });

    it('(key) : should return cheerio object', () => {
      const obj = $('ul').removeAttr('id');
      expect(obj).toBeInstanceOf($);
    });

    it('(key) : should skip text nodes', () => {
      const $text = cheerio.load(mixedText);
      const $body = $text($text('body')[0].children);

      $body.addClass(() => 'test');

      expect($text('body').html()).toBe(
        '<a class="test">1</a>TEXT<b class="test">2</b>'
      );

      $body.removeAttr('class');

      expect($text('body').html()).toBe(mixedText);
    });
  });

  describe('.hasClass', () => {
    function withClass(attr: string) {
      return cheerio(`<div class="${attr}"></div>`);
    }

    it('(valid class) : should return true', () => {
      const cls = $('.apple').hasClass('apple');
      expect(cls).toBe(true);

      expect(withClass('foo').hasClass('foo')).toBe(true);
      expect(withClass('foo bar').hasClass('foo')).toBe(true);
      expect(withClass('bar foo').hasClass('foo')).toBe(true);
      expect(withClass('bar foo bar').hasClass('foo')).toBe(true);
    });

    it('(invalid class) : should return false', () => {
      const cls = $('#fruits').hasClass('fruits');
      expect(cls).toBe(false);
      expect(withClass('foo-bar').hasClass('foo')).toBe(false);
      expect(withClass('foo-bar').hasClass('foo')).toBe(false);
      expect(withClass('foo-bar').hasClass('foo-ba')).toBe(false);
    });

    it('should check multiple classes', () => {
      // Add a class
      $('.apple').addClass('red');
      expect($('.apple').hasClass('apple')).toBe(true);
      expect($('.apple').hasClass('red')).toBe(true);

      // Remove one and test again
      $('.apple').removeClass('apple');
      expect($('li').eq(0).hasClass('apple')).toBe(false);
    });

    it('(empty string argument) : should return false', () => {
      expect(withClass('foo').hasClass('')).toBe(false);
      expect(withClass('foo bar').hasClass('')).toBe(false);
      expect(withClass('foo bar').removeClass('foo').hasClass('')).toBe(false);
    });
  });

  describe('.addClass', () => {
    it('(first class) : should add the class to the element', () => {
      const $fruits = $('#fruits');
      $fruits.addClass('fruits');
      const cls = $fruits.hasClass('fruits');
      expect(cls).toBe(true);
    });

    it('(single class) : should add the class to the element', () => {
      $('.apple').addClass('fruit');
      const cls = $('.apple').hasClass('fruit');
      expect(cls).toBe(true);
    });

    it('(class): adds classes to many selected items', () => {
      $('li').addClass('fruit');
      expect($('.apple').hasClass('fruit')).toBe(true);
      expect($('.orange').hasClass('fruit')).toBe(true);
      expect($('.pear').hasClass('fruit')).toBe(true);

      // Mixed with text nodes
      const $red = $('<html>\n<ul id=one>\n</ul>\t</html>').addClass('red');
      expect($red).toHaveLength(3);
      expect($red[0].type).toBe('text');
      expect($red[1].type).toBe('tag');
      expect($red[2].type).toBe('text');
      expect($red.hasClass('red')).toBe(true);
    });

    it('(class class class) : should add multiple classes to the element', () => {
      $('.apple').addClass('fruit red tasty');
      expect($('.apple').hasClass('apple')).toBe(true);
      expect($('.apple').hasClass('fruit')).toBe(true);
      expect($('.apple').hasClass('red')).toBe(true);
      expect($('.apple').hasClass('tasty')).toBe(true);
    });

    it('(fn) : should add classes returned from the function', () => {
      const $fruits = $('#fruits').children().add($('#fruits'));
      const args: [i: number, className: string][] = [];
      const thisVals: Element[] = [];
      const toAdd = ['main', 'apple red', '', undefined];

      $fruits.addClass(function (...myArgs) {
        args.push(myArgs);
        thisVals.push(this);
        return toAdd[myArgs[0]];
      });

      expect(args).toStrictEqual([
        [0, ''],
        [1, 'apple'],
        [2, 'orange'],
        [3, 'pear'],
      ]);
      expect(thisVals).toStrictEqual([
        $fruits[0],
        $fruits[1],
        $fruits[2],
        $fruits[3],
      ]);
      expect($fruits.eq(0).hasClass('main')).toBe(true);
      expect($fruits.eq(0).hasClass('apple')).toBe(false);
      expect($fruits.eq(1).hasClass('apple')).toBe(true);
      expect($fruits.eq(1).hasClass('red')).toBe(true);
      expect($fruits.eq(2).hasClass('orange')).toBe(true);
      expect($fruits.eq(3).hasClass('pear')).toBe(true);
    });
  });

  describe('.removeClass', () => {
    it('() : should remove all the classes', () => {
      $('.pear').addClass('fruit');
      $('.pear').removeClass();
      expect($('.pear').attr('class')).toBeUndefined();
    });

    it('("") : should not modify class list', () => {
      const $fruits = $('#fruits');
      $fruits.children().removeClass('');
      expect($('.apple')).toHaveLength(1);
    });

    it('(invalid class) : should not remove anything', () => {
      $('.pear').removeClass('fruit');
      expect($('.pear').hasClass('pear')).toBe(true);
    });

    it('(no class attribute) : should not throw an exception', () => {
      const $vegetables = cheerio(vegetables);

      expect(() => {
        $('li', $vegetables).removeClass('vegetable');
      }).not.toThrow();
    });

    it('(single class) : should remove a single class from the element', () => {
      $('.pear').addClass('fruit');
      expect($('.pear').hasClass('fruit')).toBe(true);
      $('.pear').removeClass('fruit');
      expect($('.pear').hasClass('fruit')).toBe(false);
      expect($('.pear').hasClass('pear')).toBe(true);

      // Remove one class from set
      const $li = $('li').removeClass('orange');
      expect($li.eq(0).attr('class')).toBe('apple');
      expect($li.eq(1).attr('class')).toBe('');
      expect($li.eq(2).attr('class')).toBe('pear');

      // Mixed with text nodes
      const $red = $('<html>\n<ul class=one>\n</ul>\t</html>').removeClass(
        'one'
      );
      expect($red).toHaveLength(3);
      expect($red[0].type).toBe('text');
      expect($red[1].type).toBe('tag');
      expect($red[2].type).toBe('text');
      expect($red.eq(1).attr('class')).toBe('');
      expect($red.eq(1).prop('tagName')).toBe('UL');
    });

    it('(single class) : should remove a single class from multiple classes on the element', () => {
      $('.pear').addClass('fruit green tasty');
      expect($('.pear').hasClass('fruit')).toBe(true);
      expect($('.pear').hasClass('green')).toBe(true);
      expect($('.pear').hasClass('tasty')).toBe(true);

      $('.pear').removeClass('green');
      expect($('.pear').hasClass('fruit')).toBe(true);
      expect($('.pear').hasClass('green')).toBe(false);
      expect($('.pear').hasClass('tasty')).toBe(true);
    });

    it('(class class class) : should remove multiple classes from the element', () => {
      $('.apple').addClass('fruit red tasty');
      expect($('.apple').hasClass('apple')).toBe(true);
      expect($('.apple').hasClass('fruit')).toBe(true);
      expect($('.apple').hasClass('red')).toBe(true);
      expect($('.apple').hasClass('tasty')).toBe(true);

      $('.apple').removeClass('apple red tasty');
      expect($('.fruit').hasClass('apple')).toBe(false);
      expect($('.fruit').hasClass('red')).toBe(false);
      expect($('.fruit').hasClass('tasty')).toBe(false);
      expect($('.fruit').hasClass('fruit')).toBe(true);
    });

    it('(class) : should remove all occurrences of a class name', () => {
      const $div = cheerio('<div class="x x y x z"></div>');
      expect($div.removeClass('x').hasClass('x')).toBe(false);
    });

    it('(fn) : should remove classes returned from the function', () => {
      const $fruits = $('#fruits').children();
      const args: [number, string][] = [];
      const thisVals: Element[] = [];
      const toAdd = ['apple red', '', undefined];

      $fruits.removeClass(function (...myArgs) {
        args.push(myArgs);
        thisVals.push(this);
        return toAdd[myArgs[0]];
      });

      expect(args).toStrictEqual([
        [0, 'apple'],
        [1, 'orange'],
        [2, 'pear'],
      ]);
      expect(thisVals).toStrictEqual([$fruits[0], $fruits[1], $fruits[2]]);
      expect($fruits.eq(0).hasClass('apple')).toBe(false);
      expect($fruits.eq(0).hasClass('red')).toBe(false);
      expect($fruits.eq(1).hasClass('orange')).toBe(true);
      expect($fruits.eq(2).hasClass('pear')).toBe(true);
    });

    it('(fn) : should no op elements without attributes', () => {
      const $inputs = $(inputs);
      const val = $inputs.removeClass(() => 'tasty');
      expect(val).toHaveLength(15);
    });

    it('(fn) : should skip text nodes', () => {
      const $text = cheerio.load(mixedText);
      const $body = $text($text('body')[0].children);

      $body.addClass(() => 'test');

      expect($text('body').html()).toBe(
        '<a class="test">1</a>TEXT<b class="test">2</b>'
      );

      $body.removeClass(() => 'test');

      expect($text('body').html()).toBe(
        '<a class="">1</a>TEXT<b class="">2</b>'
      );
    });
  });

  describe('.toggleClass', () => {
    it('(class class) : should toggle multiple classes from the element', () => {
      $('.apple').addClass('fruit');
      expect($('.apple').hasClass('apple')).toBe(true);
      expect($('.apple').hasClass('fruit')).toBe(true);
      expect($('.apple').hasClass('red')).toBe(false);

      $('.apple').toggleClass('apple red');
      expect($('.fruit').hasClass('apple')).toBe(false);
      expect($('.fruit').hasClass('red')).toBe(true);
      expect($('.fruit').hasClass('fruit')).toBe(true);

      // Mixed with text nodes
      const $red = $('<html>\n<ul class=one>\n</ul>\t</html>').toggleClass(
        'red'
      );
      expect($red).toHaveLength(3);
      expect($red.hasClass('red')).toBe(true);
      expect($red.hasClass('one')).toBe(true);
      $red.toggleClass('one');
      expect($red.hasClass('red')).toBe(true);
      expect($red.hasClass('one')).toBe(false);
    });

    it('(class class, true) : should add multiple classes to the element', () => {
      $('.apple').addClass('fruit');
      expect($('.apple').hasClass('apple')).toBe(true);
      expect($('.apple').hasClass('fruit')).toBe(true);
      expect($('.apple').hasClass('red')).toBe(false);

      $('.apple').toggleClass('apple red', true);
      expect($('.fruit').hasClass('apple')).toBe(true);
      expect($('.fruit').hasClass('red')).toBe(true);
      expect($('.fruit').hasClass('fruit')).toBe(true);
    });

    it('(class true) : should add only one instance of class', () => {
      $('.apple').toggleClass('tasty', true);
      $('.apple').toggleClass('tasty', true);
      expect($('.apple').attr('class')).toMatch(/tasty/g);
    });

    it('(class class, false) : should remove multiple classes from the element', () => {
      $('.apple').addClass('fruit');
      expect($('.apple').hasClass('apple')).toBe(true);
      expect($('.apple').hasClass('fruit')).toBe(true);
      expect($('.apple').hasClass('red')).toBe(false);

      $('.apple').toggleClass('apple red', false);
      expect($('.fruit').hasClass('apple')).toBe(false);
      expect($('.fruit').hasClass('red')).toBe(false);
      expect($('.fruit').hasClass('fruit')).toBe(true);
    });

    it('(fn) : should toggle classes returned from the function', () => {
      $ = cheerio.load(food);

      $('.apple').addClass('fruit');
      $('.carrot').addClass('vegetable');
      expect($('.apple').hasClass('fruit')).toBe(true);
      expect($('.apple').hasClass('vegetable')).toBe(false);
      expect($('.orange').hasClass('fruit')).toBe(false);
      expect($('.orange').hasClass('vegetable')).toBe(false);
      expect($('.carrot').hasClass('fruit')).toBe(false);
      expect($('.carrot').hasClass('vegetable')).toBe(true);
      expect($('.sweetcorn').hasClass('fruit')).toBe(false);
      expect($('.sweetcorn').hasClass('vegetable')).toBe(false);

      $('li').toggleClass(function () {
        return $(this).parent().is('#fruits') ? 'fruit' : 'vegetable';
      });
      expect($('.apple').hasClass('fruit')).toBe(false);
      expect($('.apple').hasClass('vegetable')).toBe(false);
      expect($('.orange').hasClass('fruit')).toBe(true);
      expect($('.orange').hasClass('vegetable')).toBe(false);
      expect($('.carrot').hasClass('fruit')).toBe(false);
      expect($('.carrot').hasClass('vegetable')).toBe(false);
      expect($('.sweetcorn').hasClass('fruit')).toBe(false);
      expect($('.sweetcorn').hasClass('vegetable')).toBe(true);
    });

    it('(fn) : should work with no initial class attribute', () => {
      const $inputs = cheerio.load(inputs);
      $inputs('input, select').toggleClass(function () {
        return $inputs(this).get(0).tagName === 'select'
          ? 'selectable'
          : 'inputable';
      });
      expect($inputs('.selectable')).toHaveLength(6);
      expect($inputs('.inputable')).toHaveLength(9);
    });

    it('(fn) : should skip text nodes', () => {
      const $text = cheerio.load(mixedText);
      const $body = $text($text('body')[0].children);

      $body.toggleClass(() => 'test');

      expect($text('body').html()).toBe(
        '<a class="test">1</a>TEXT<b class="test">2</b>'
      );

      $body.toggleClass(() => 'test');

      expect($text('body').html()).toBe(
        '<a class="">1</a>TEXT<b class="">2</b>'
      );
    });

    it('(invalid) : should be a no-op for invalid inputs', () => {
      const original = $('.apple');
      const testAgainst = original.attr('class');
      expect(original.toggleClass().attr('class')).toStrictEqual(testAgainst);
      expect(original.toggleClass(true as any).attr('class')).toStrictEqual(
        testAgainst
      );
      expect(original.toggleClass(false as any).attr('class')).toStrictEqual(
        testAgainst
      );
      expect(original.toggleClass(null as any).attr('class')).toStrictEqual(
        testAgainst
      );
      expect(original.toggleClass(0 as any).attr('class')).toStrictEqual(
        testAgainst
      );
      expect(original.toggleClass(1 as any).attr('class')).toStrictEqual(
        testAgainst
      );
      expect(original.toggleClass({} as any).attr('class')).toStrictEqual(
        testAgainst
      );
    });
  });
});
