'use strict';
var cheerio = require('../..');
var fruits = require('../__fixtures__/fixtures').fruits;
var divcontainers = require('../__fixtures__/fixtures').divcontainers;

describe('$(...)', function () {
  var $;
  var $fruits;

  beforeEach(function () {
    $ = cheerio.load(fruits);
    $fruits = $('#fruits');
  });

  describe('.wrap', function () {
    it('(Cheerio object) : should insert the element and add selected element(s) as its child', function () {
      var $redFruits = $('<div class="red-fruits"></div>');
      $('.apple').wrap($redFruits);

      expect($fruits.children().eq(0).hasClass('red-fruits')).toBe(true);
      expect($('.red-fruits').children().eq(0).hasClass('apple')).toBe(true);
      expect($fruits.children().eq(1).hasClass('orange')).toBe(true);
      expect($redFruits.children()).toHaveLength(1);
    });

    it('(element) : should wrap the base element correctly', function () {
      $('ul').wrap('<a></a>');
      expect($('body').children()[0].tagName).toBe('a');
    });

    it('(element) : should insert the element and add selected element(s) as its child', function () {
      var $redFruits = $('<div class="red-fruits"></div>');
      $('.apple').wrap($redFruits[0]);

      expect($fruits.children()[0]).toBe($redFruits[0]);
      expect($redFruits.children()).toHaveLength(1);
      expect($redFruits.children()[0]).toBe($('.apple')[0]);
      expect($fruits.children()[1]).toBe($('.orange')[0]);
    });

    it('(html) : should insert the markup and add selected element(s) as its child', function () {
      $('.apple').wrap('<div class="red-fruits"> </div>');
      expect($fruits.children().eq(0).hasClass('red-fruits')).toBe(true);
      expect($('.red-fruits').children().eq(0).hasClass('apple')).toBe(true);
      expect($fruits.children().eq(1).hasClass('orange')).toBe(true);
      expect($('.red-fruits').children()).toHaveLength(1);
    });

    it('(html) : discards extraneous markup', function () {
      $('.apple').wrap('<div></div><p></p>');
      expect($('div')).toHaveLength(1);
      expect($('p')).toHaveLength(0);
    });

    it('(html) : wraps with nested elements', function () {
      var $orangeFruits = $(
        '<div class="orange-fruits"><div class="and-stuff"></div></div>'
      );
      $('.orange').wrap($orangeFruits);

      expect($fruits.children().eq(1).hasClass('orange-fruits')).toBe(true);
      expect($('.orange-fruits').children().eq(0).hasClass('and-stuff')).toBe(
        true
      );
      expect($fruits.children().eq(2).hasClass('pear')).toBe(true);
      expect($('.orange-fruits').children()).toHaveLength(1);
    });

    it('(html) : should only worry about the first tag children', function () {
      var delicious = '<span> This guy is delicious: <b></b></span>';
      $('.apple').wrap(delicious);
      expect($('b>.apple')).toHaveLength(1);
    });

    it('(selector) : wraps the content with a copy of the first matched element', function () {
      $('.apple').wrap('.orange, .pear');

      var $oranges = $('.orange');
      expect($('.pear')).toHaveLength(1);
      expect($oranges).toHaveLength(2);
      expect($oranges.eq(0).parent()[0]).toBe($fruits[0]);
      expect($oranges.eq(0).children()).toHaveLength(1);
      expect($oranges.eq(0).children()[0]).toBe($('.apple')[0]);
      expect($('.apple').parent()[0]).toBe($oranges[0]);
      expect($oranges.eq(1).children()).toHaveLength(0);
    });

    it('(fn) : should invoke the provided function with the correct arguments and context', function () {
      var $children = $fruits.children();
      var args = [];
      var thisValues = [];

      $children.wrap(function () {
        args.push(Array.from(arguments));
        thisValues.push(this);
      });

      expect(args).toStrictEqual([[0], [1], [2]]);
      expect(thisValues).toStrictEqual([
        $children[0],
        $children[1],
        $children[2],
      ]);
    });

    it('(fn) : should use the returned HTML to wrap each element', function () {
      var $children = $fruits.children();
      var tagNames = ['div', 'span', 'p'];

      $children.wrap(function () {
        return '<' + tagNames.shift() + '>';
      });

      expect($fruits.find('div')).toHaveLength(1);
      expect($fruits.find('div')[0]).toBe($fruits.children()[0]);
      expect($fruits.find('.apple')).toHaveLength(1);
      expect($fruits.find('.apple').parent()[0]).toBe($fruits.find('div')[0]);

      expect($fruits.find('span')).toHaveLength(1);
      expect($fruits.find('span')[0]).toBe($fruits.children()[1]);
      expect($fruits.find('.orange')).toHaveLength(1);
      expect($fruits.find('.orange').parent()[0]).toBe($fruits.find('span')[0]);

      expect($fruits.find('p')).toHaveLength(1);
      expect($fruits.find('p')[0]).toBe($fruits.children()[2]);
      expect($fruits.find('.pear')).toHaveLength(1);
      expect($fruits.find('.pear').parent()[0]).toBe($fruits.find('p')[0]);
    });

    it('(fn) : should use the returned Cheerio object to wrap each element', function () {
      var $children = $fruits.children();
      var tagNames = ['span', 'p', 'div'];

      $children.wrap(function () {
        return $('<' + tagNames.shift() + '>');
      });

      expect($fruits.find('span')).toHaveLength(1);
      expect($fruits.find('span')[0]).toBe($fruits.children()[0]);
      expect($fruits.find('.apple')).toHaveLength(1);
      expect($fruits.find('.apple').parent()[0]).toBe($fruits.find('span')[0]);

      expect($fruits.find('p')).toHaveLength(1);
      expect($fruits.find('p')[0]).toBe($fruits.children()[1]);
      expect($fruits.find('.orange')).toHaveLength(1);
      expect($fruits.find('.orange').parent()[0]).toBe($fruits.find('p')[0]);

      expect($fruits.find('div')).toHaveLength(1);
      expect($fruits.find('div')[0]).toBe($fruits.children()[2]);
      expect($fruits.find('.pear')).toHaveLength(1);
      expect($fruits.find('.pear').parent()[0]).toBe($fruits.find('div')[0]);
    });

    it('($(...)) : for each element it should add a wrapper elment and add the selected element as its child', function () {
      var $fruitDecorator = $('<div class="fruit-decorator"></div>');
      $('li').wrap($fruitDecorator);
      expect($fruits.children().eq(0).hasClass('fruit-decorator')).toBe(true);
      expect($fruits.children().eq(0).children().eq(0).hasClass('apple')).toBe(
        true
      );
      expect($fruits.children().eq(1).hasClass('fruit-decorator')).toBe(true);
      expect($fruits.children().eq(1).children().eq(0).hasClass('orange')).toBe(
        true
      );
      expect($fruits.children().eq(2).hasClass('fruit-decorator')).toBe(true);
      expect($fruits.children().eq(2).children().eq(0).hasClass('pear')).toBe(
        true
      );
    });
  });

  describe('.wrapInner', function () {
    it('(Cheerio object) : should insert the element and add selected element(s) as its parent', function () {
      var $container = $('<div class="container"></div>');
      $fruits.wrapInner($container);

      expect($fruits.children()[0]).toBe($container[0]);
      expect($container[0].parent).toBe($fruits[0]);
      expect($container[0].children[0]).toBe($('.apple')[0]);
      expect($container[0].children[1]).toBe($('.orange')[0]);
      expect($('.apple')[0].parent).toBe($container[0]);
      expect($fruits.children()).toHaveLength(1);
      expect($container.children()).toHaveLength(3);
    });

    it('(element) : should insert the element and add selected element(s) as its parent', function () {
      var $container = $('<div class="container"></div>');
      $fruits.wrapInner($container[0]);

      expect($fruits.children()[0]).toBe($container[0]);
      expect($container[0].parent).toBe($fruits[0]);
      expect($container[0].children[0]).toBe($('.apple')[0]);
      expect($container[0].children[1]).toBe($('.orange')[0]);
      expect($('.apple')[0].parent).toBe($container[0]);
      expect($fruits.children()).toHaveLength(1);
      expect($container.children()).toHaveLength(3);
    });

    it('(html) : should insert the element and add selected element(s) as its parent', function () {
      $fruits.wrapInner('<div class="container"></div>');

      expect($fruits.children()[0]).toBe($('.container')[0]);
      expect($('.container')[0].parent).toBe($fruits[0]);
      expect($('.container')[0].children[0]).toBe($('.apple')[0]);
      expect($('.container')[0].children[1]).toBe($('.orange')[0]);
      expect($('.apple')[0].parent).toBe($('.container')[0]);
      expect($fruits.children()).toHaveLength(1);
      expect($('.container').children()).toHaveLength(3);
    });

    it("(selector) : should wrap the html of the element with the selector's first match", function () {
      $('.apple').wrapInner('.orange, .pear');
      var $oranges = $('.orange');
      expect($('.pear')).toHaveLength(1);
      expect($oranges).toHaveLength(2);
      expect($oranges.eq(0).parent()[0]).toBe($('.apple')[0]);
      expect($oranges.eq(0).text()).toBe('Apple');
      expect($('.apple').eq(0).children()[0]).toBe($oranges[0]);
      expect($oranges.eq(1).parent()[0]).toBe($fruits[0]);
      expect($oranges.eq(1).text()).toBe('Orange');
    });

    it('(fn) : should invoke the provided function with the correct arguments and context', function () {
      var $children = $fruits.children();
      var args = [];
      var thisValues = [];

      $children.wrapInner(function () {
        args.push(Array.from(arguments));
        thisValues.push(this);
      });

      expect(args).toStrictEqual([[0], [1], [2]]);
      expect(thisValues).toStrictEqual([
        $children[0],
        $children[1],
        $children[2],
      ]);
    });

    it("(fn) : should use the returned HTML to wrap each element's contents", function () {
      var $children = $fruits.children();
      var tagNames = ['div', 'span', 'p'];

      $children.wrapInner(function () {
        return '<' + tagNames.shift() + '>';
      });

      expect($fruits.find('div')).toHaveLength(1);
      expect($fruits.find('div')[0]).toBe($('.apple').children()[0]);
      expect($fruits.find('.apple')).toHaveLength(1);

      expect($fruits.find('span')).toHaveLength(1);
      expect($fruits.find('span')[0]).toBe($('.orange').children()[0]);
      expect($fruits.find('.orange')).toHaveLength(1);

      expect($fruits.find('p')).toHaveLength(1);
      expect($fruits.find('p')[0]).toBe($('.pear').children()[0]);
      expect($fruits.find('.pear')).toHaveLength(1);
    });

    it("(fn) : should use the returned Cheerio object to wrap each element's contents", function () {
      var $children = $fruits.children();
      var tags = [$('<div></div>'), $('<span></span>'), $('<p></p>')];

      $children.wrapInner(function () {
        return tags.shift();
      });

      expect($fruits.find('div')).toHaveLength(1);
      expect($fruits.find('div')[0]).toBe($('.apple').children()[0]);
      expect($fruits.find('.apple')).toHaveLength(1);

      expect($fruits.find('span')).toHaveLength(1);
      expect($fruits.find('span')[0]).toBe($('.orange').children()[0]);
      expect($fruits.find('.orange')).toHaveLength(1);

      expect($fruits.find('p')).toHaveLength(1);
      expect($fruits.find('p')[0]).toBe($('.pear').children()[0]);
      expect($fruits.find('.pear')).toHaveLength(1);
    });

    it('($(...)) : for each element it should add a wrapper elment and add the selected element as its child', function () {
      var $fruitDecorator = $('<div class="fruit-decorator"></div>');
      var $children = $fruits.children();
      $('li').wrapInner($fruitDecorator);

      expect($('.fruit-decorator')).toHaveLength(3);
      expect($children.eq(0).children().eq(0).hasClass('fruit-decorator')).toBe(
        true
      );
      expect($children.eq(0).hasClass('apple')).toBe(true);
      expect($children.eq(1).children().eq(0).hasClass('fruit-decorator')).toBe(
        true
      );
      expect($children.eq(1).hasClass('orange')).toBe(true);
      expect($children.eq(2).children().eq(0).hasClass('fruit-decorator')).toBe(
        true
      );
      expect($children.eq(2).hasClass('pear')).toBe(true);
    });

    it('(html) : wraps with nested elements', function () {
      var $badOrangeJoke = $(
        '<div class="orange-you-glad"><div class="i-didnt-say-apple"></div></div>'
      );
      $('.orange').wrapInner($badOrangeJoke);

      expect($('.orange').children().eq(0).hasClass('orange-you-glad')).toBe(
        true
      );
      expect(
        $('.orange-you-glad').children().eq(0).hasClass('i-didnt-say-apple')
      ).toBe(true);
      expect($fruits.children().eq(2).hasClass('pear')).toBe(true);
      expect($('.orange-you-glad').children()).toHaveLength(1);
    });

    it('(html) : should only worry about the first tag children', function () {
      var delicious = '<span> This guy is delicious: <b></b></span>';
      $('.apple').wrapInner(delicious);
      expect($('.apple>span>b')).toHaveLength(1);
      expect($('.apple>span>b').text()).toBe('Apple');
    });
  });

  describe('.unwrap', function () {
    var $elem;
    var unwrapspans = [
      '<div id=unwrap style="display: none;">',
      '<div id=unwrap1><span class=unwrap>a</span><span class=unwrap>b</span></div>',
      '<div id=unwrap2><span class=unwrap>c</span><span class=unwrap>d</span></div>',
      '<div id=unwrap3><b><span class="unwrap unwrap3">e</span></b><b><span class="unwrap unwrap3">f</span></b></div>',
      '</div>',
    ].join('');

    beforeEach(function () {
      $elem = cheerio.load(unwrapspans);
    });

    it('() : should be unwrap span elements', function () {
      var abcd = $elem('#unwrap1 > span, #unwrap2 > span').get();
      var abcdef = $elem('#unwrap span').get();

      // make #unwrap1 and #unwrap2 go away
      expect(
        $elem('#unwrap1 span').add('#unwrap2 span:first-child').unwrap()
      ).toHaveLength(3);

      //.toEqual
      // all four spans should still exist
      expect($elem('#unwrap > span').get()).toEqual(abcd);

      // make all b elements in #unwrap3 go away
      expect($elem('#unwrap3 span').unwrap().get()).toEqual(
        $elem('#unwrap3 > span').get()
      );

      // make #unwrap3 go away
      expect($elem('#unwrap3 span').unwrap().get()).toEqual(
        $elem('#unwrap > span.unwrap3').get()
      );

      // #unwrap only contains 6 child spans
      expect($elem('#unwrap').children().get()).toEqual(abcdef);

      // make the 6 spans become children of body
      expect($elem('#unwrap > span').unwrap().get()).toEqual(
        $elem('body > span.unwrap').get()
      );

      // can't unwrap children of body
      expect($elem('body > span.unwrap').unwrap().get()).toEqual(
        $elem('body > span.unwrap').get()
      );

      // can't unwrap children of body
      expect($elem('body > span.unwrap').unwrap().get()).toEqual(abcdef);

      // can't unwrap children of body
      expect($elem('body > span.unwrap').get()).toEqual(abcdef);
    });

    it('(selector) : should only unwrap element parent what specified', function () {
      var abcd = $elem('#unwrap1 > span, #unwrap2 > span').get();
      // var abcdef = $elem('#unwrap span').get();

      // Shouldn't unwrap, no match
      $elem('#unwrap1 span').unwrap('#unwrap2');
      expect($elem('#unwrap1')).toHaveLength(1);

      // Shouldn't unwrap, no match
      $elem('#unwrap1 span').unwrap('span');
      expect($elem('#unwrap1')).toHaveLength(1);

      // Unwraps
      $elem('#unwrap1 span').unwrap('#unwrap1');
      expect($elem('#unwrap1')).toHaveLength(0);

      // Should not unwrap - unmatched unwrap
      $elem('#unwrap2 span').unwrap('quote');
      expect($elem('#unwrap > span')).toHaveLength(2);

      // Check return values - matched unwrap
      $elem('#unwrap2 span').unwrap('#unwrap2');
      expect($elem('#unwrap > span').get()).toEqual(abcd);
    });
  });

  describe('.wrapAll', function () {
    var doc;
    var $inner;

    beforeEach(function () {
      doc = cheerio.load(divcontainers);
      $inner = doc('.inner');
    });

    it('(Cheerio object) : should insert the element and wrap elements with it', function () {
      $inner.wrapAll(doc('#new'));
      var $container = doc('.container');
      var $wrap = doc('b');

      expect($container).toHaveLength(2);
      expect($container[0].children).toHaveLength(1);
      expect($container[1].children).toHaveLength(0);
      expect($container[0].children[0]).toBe(doc('#new')[0]);

      expect($inner).toHaveLength(4);
      expect($wrap[0].children).toHaveLength(4);
      expect($inner[0].parent).toBe($wrap[0]);
      expect($inner[1].parent).toBe($wrap[0]);
      expect($inner[2].parent).toBe($wrap[0]);
      expect($inner[3].parent).toBe($wrap[0]);
    });

    it('(html) : should wrap elements with it', function () {
      $inner.wrapAll('<div class="wrap"></div>');
      var $container = doc('.container');
      var $wrap = doc('.wrap');

      expect($inner).toHaveLength(4);
      expect($container).toHaveLength(2);
      expect($wrap).toHaveLength(1);
      expect($wrap[0].children).toHaveLength(4);
      expect($container[0].children).toHaveLength(1);
      expect($container[1].children).toHaveLength(0);
      expect($inner[0].parent).toBe($wrap[0]);
      expect($inner[1].parent).toBe($wrap[0]);
      expect($inner[2].parent).toBe($wrap[0]);
      expect($inner[3].parent).toBe($wrap[0]);
      expect($wrap[0].parent).toBe($container[0]);
      expect($container[0].children[0]).toBe($wrap[0]);
    });

    it('(html) : should wrap single element with it', function () {
      var parent = doc('<p>').wrapAll('<div></div>').parent();
      expect(parent).toHaveLength(1);
      expect(parent.is('div')).toBe(true);
    });

    it('(selector) : should find element from dom, wrap elements with it', function () {
      $inner.wrapAll('#new');
      var $container = doc('.container');
      var $wrap = doc('b');
      var $new = doc('#new');

      expect($inner).toHaveLength(4);
      expect($container).toHaveLength(2);
      expect($container[0].children).toHaveLength(1);
      expect($container[1].children).toHaveLength(0);
      expect($wrap[0].children).toHaveLength(4);
      expect($inner[0].parent).toBe($wrap[0]);
      expect($inner[1].parent).toBe($wrap[0]);
      expect($inner[2].parent).toBe($wrap[0]);
      expect($inner[3].parent).toBe($wrap[0]);
      expect($new[0].parent).toBe($container[0]);
      expect($container[0].children[0]).toBe($new[0]);
    });

    it('(function) : check execution', function () {
      var $container = doc('.container');
      var p = $container[0].parent;

      var result = $container.wrapAll(function () {
        return "<div class='red'><div class='tmp'></div></div>";
      });

      expect(result.parent()).toHaveLength(1);
      expect($container.eq(0).parent().parent().is('.red')).toBe(true);
      expect($container.eq(1).parent().parent().is('.red')).toBe(true);
      expect($container.eq(0).parent().parent().parent().is(p)).toBe(true);
    });

    it('(function) : check execution characteristics', function () {
      var $new = doc('#new');
      var i = 0;

      doc('no-result').wrapAll(function () {
        i++;
        return '';
      });
      expect(i).toBeFalsy();

      $new.wrapAll(function (index) {
        expect(this).toBe($new[0]);
        expect(index).toBeUndefined();
      });
    });
  });

  describe('.append', function () {
    it('() : should do nothing', function () {
      expect($('#fruits').append()[0].tagName).toBe('ul');
    });

    it('(html) : should add element as last child', function () {
      $fruits.append('<li class="plum">Plum</li>');
      expect($fruits.children().eq(3).hasClass('plum')).toBe(true);
    });

    it('($(...)) : should add element as last child', function () {
      var $plum = $('<li class="plum">Plum</li>');
      $fruits.append($plum);
      expect($fruits.children().eq(3).hasClass('plum')).toBe(true);
    });

    it('(Node) : should add element as last child', function () {
      var plum = $('<li class="plum">Plum</li>')[0];
      $fruits.append(plum);
      expect($fruits.children().eq(3).hasClass('plum')).toBe(true);
    });

    it('(existing Node) : should remove node from previous location', function () {
      var apple = $fruits.children()[0];

      expect($fruits.children()).toHaveLength(3);
      $fruits.append(apple);
      var $children = $fruits.children();

      expect($children).toHaveLength(3);
      expect($children[0]).not.toBe(apple);
      expect($children[2]).toBe(apple);
    });

    it('(existing Node) : should remove existing node from previous location', function () {
      var apple = $fruits.children()[0];
      var $dest = $('<div></div>');

      expect($fruits.children()).toHaveLength(3);
      $dest.append(apple);
      var $children = $fruits.children();

      expect($children).toHaveLength(2);
      expect($children[0]).not.toBe(apple);

      expect($dest.children()).toHaveLength(1);
      expect($dest.children()[0]).toBe(apple);
    });

    it('(existing Node) : should update original direct siblings', function () {
      $('.pear').append($('.orange'));
      expect($('.apple').next()[0]).toBe($('.pear')[0]);
      expect($('.pear').prev()[0]).toBe($('.apple')[0]);
    });

    it('(existing Node) : should clone all but the last occurrence', function () {
      var $originalApple = $('.apple');

      $('.orange, .pear').append($originalApple);

      var $apples = $('.apple');
      expect($apples).toHaveLength(2);
      expect($apples.eq(0).parent()[0]).toBe($('.orange')[0]);
      expect($apples.eq(1).parent()[0]).toBe($('.pear')[0]);
      expect($apples[1]).toBe($originalApple[0]);
    });

    it('(elem) : should NOP if removed', function () {
      var $apple = $('.apple');

      $apple.remove();
      $fruits.append($apple);
      expect($fruits.children().eq(2).hasClass('apple')).toBe(true);
    });

    it('($(...), html) : should add multiple elements as last children', function () {
      var $plum = $('<li class="plum">Plum</li>');
      var grape = '<li class="grape">Grape</li>';
      $fruits.append($plum, grape);
      expect($fruits.children().eq(3).hasClass('plum')).toBe(true);
      expect($fruits.children().eq(4).hasClass('grape')).toBe(true);
    });

    it('(Array) : should append all elements in the array', function () {
      var more = $(
        '<li class="plum">Plum</li><li class="grape">Grape</li>'
      ).get();
      $fruits.append(more);
      expect($fruits.children().eq(3).hasClass('plum')).toBe(true);
      expect($fruits.children().eq(4).hasClass('grape')).toBe(true);
    });

    it('(fn) : should invoke the callback with the correct arguments and context', function () {
      $fruits = $fruits.children();
      var args = [];
      var thisValues = [];

      $fruits.append(function () {
        args.push(Array.from(arguments));
        thisValues.push(this);
      });

      expect(args).toStrictEqual([
        [0, 'Apple'],
        [1, 'Orange'],
        [2, 'Pear'],
      ]);
      expect(thisValues).toStrictEqual([$fruits[0], $fruits[1], $fruits[2]]);
    });

    it('(fn) : should add returned string as last child', function () {
      $fruits = $fruits.children();

      $fruits.append(function () {
        return '<div class="first">';
      });

      var $apple = $fruits.eq(0);
      var $orange = $fruits.eq(1);
      var $pear = $fruits.eq(2);

      expect($apple.find('.first')[0]).toBe($apple.contents()[1]);
      expect($orange.find('.first')[0]).toBe($orange.contents()[1]);
      expect($pear.find('.first')[0]).toBe($pear.contents()[1]);
    });

    it('(fn) : should add returned Cheerio object as last child', function () {
      $fruits = $fruits.children();

      $fruits.append(function () {
        return $('<div class="second">');
      });

      var $apple = $fruits.eq(0);
      var $orange = $fruits.eq(1);
      var $pear = $fruits.eq(2);

      expect($apple.find('.second')[0]).toBe($apple.contents()[1]);
      expect($orange.find('.second')[0]).toBe($orange.contents()[1]);
      expect($pear.find('.second')[0]).toBe($pear.contents()[1]);
    });

    it('(fn) : should add returned Node as last child', function () {
      $fruits = $fruits.children();

      $fruits.append(function () {
        return $('<div class="third">')[0];
      });

      var $apple = $fruits.eq(0);
      var $orange = $fruits.eq(1);
      var $pear = $fruits.eq(2);

      expect($apple.find('.third')[0]).toBe($apple.contents()[1]);
      expect($orange.find('.third')[0]).toBe($orange.contents()[1]);
      expect($pear.find('.third')[0]).toBe($pear.contents()[1]);
    });

    it('should maintain correct object state (Issue: #10)', function () {
      var $obj = $('<div></div>')
        .append('<div><div></div></div>')
        .children()
        .children()
        .parent();
      expect($obj).toBeTruthy();
    });

    it('($(...)) : should remove from root element', function () {
      var $plum = $('<li class="plum">Plum</li>');
      var parent = $plum[0].parent;
      expect(parent).toBeTruthy();

      $fruits.append($plum);
      expect($plum[0].parent.type).not.toBe('root');
      expect(parent.childNodes).not.toContain($plum[0]);
    });
  });

  describe('.prepend', function () {
    it('() : should do nothing', function () {
      expect($('#fruits').prepend()[0].tagName).toBe('ul');
    });

    it('(html) : should add element as first child', function () {
      $fruits.prepend('<li class="plum">Plum</li>');
      expect($fruits.children().eq(0).hasClass('plum')).toBe(true);
    });

    it('($(...)) : should add element as first child', function () {
      var $plum = $('<li class="plum">Plum</li>');
      $fruits.prepend($plum);
      expect($fruits.children().eq(0).hasClass('plum')).toBe(true);
    });

    it('($(...)) : should add style element as first child', function () {
      var $style = $('<style>.foo {}</style>');
      $fruits.prepend($style);
      var styleTag = $fruits.children().get(0);
      expect(styleTag.tagName).toBe('style');
      expect(styleTag.children[0].data).toBe('.foo {}');
    });

    it('($(...)) : should add script element as first child', function () {
      var $script = $('<script>var foo;</script>');
      $fruits.prepend($script);
      var scriptTag = $fruits.children().get(0);
      expect(scriptTag.tagName).toBe('script');
      expect(scriptTag.children[0].data).toBe('var foo;');
    });

    it('(Node) : should add node as first child', function () {
      var plum = $('<li class="plum">Plum</li>')[0];
      $fruits.prepend(plum);
      expect($fruits.children().eq(0).hasClass('plum')).toBe(true);
    });

    it('(existing Node) : should remove existing nodes from previous locations', function () {
      var pear = $fruits.children()[2];

      expect($fruits.children()).toHaveLength(3);
      $fruits.prepend(pear);
      var $children = $fruits.children();

      expect($children).toHaveLength(3);
      expect($children[2]).not.toBe(pear);
      expect($children[0]).toBe(pear);
    });

    it('(existing Node) : should update original direct siblings', function () {
      $('.pear').prepend($('.orange'));
      expect($('.apple').next()[0]).toBe($('.pear')[0]);
      expect($('.pear').prev()[0]).toBe($('.apple')[0]);
    });

    it('(existing Node) : should clone all but the last occurrence', function () {
      var $originalApple = $('.apple');

      $('.orange, .pear').prepend($originalApple);

      var $apples = $('.apple');
      expect($apples).toHaveLength(2);
      expect($apples.eq(0).parent()[0]).toBe($('.orange')[0]);
      expect($apples.eq(1).parent()[0]).toBe($('.pear')[0]);
      expect($apples[1]).toBe($originalApple[0]);
    });

    it('(elem) : should handle if removed', function () {
      var $apple = $('.apple');

      $apple.remove();
      $fruits.prepend($apple);
      expect($fruits.children().eq(0).hasClass('apple')).toBe(true);
    });

    it('(Array) : should add all elements in the array as initial children', function () {
      var more = $(
        '<li class="plum">Plum</li><li class="grape">Grape</li>'
      ).get();
      $fruits.prepend(more);
      expect($fruits.children().eq(0).hasClass('plum')).toBe(true);
      expect($fruits.children().eq(1).hasClass('grape')).toBe(true);
    });

    it('(html, $(...), html) : should add multiple elements as first children', function () {
      var $plum = $('<li class="plum">Plum</li>');
      var grape = '<li class="grape">Grape</li>';
      $fruits.prepend($plum, grape);
      expect($fruits.children().eq(0).hasClass('plum')).toBe(true);
      expect($fruits.children().eq(1).hasClass('grape')).toBe(true);
    });

    it('(fn) : should invoke the callback with the correct arguments and context', function () {
      var args = [];
      var thisValues = [];
      $fruits = $fruits.children();

      $fruits.prepend(function () {
        args.push(Array.from(arguments));
        thisValues.push(this);
      });

      expect(args).toStrictEqual([
        [0, 'Apple'],
        [1, 'Orange'],
        [2, 'Pear'],
      ]);
      expect(thisValues).toStrictEqual([$fruits[0], $fruits[1], $fruits[2]]);
    });

    it('(fn) : should add returned string as first child', function () {
      $fruits = $fruits.children();

      $fruits.prepend(function () {
        return '<div class="first">';
      });

      var $apple = $fruits.eq(0);
      var $orange = $fruits.eq(1);
      var $pear = $fruits.eq(2);

      expect($apple.find('.first')[0]).toBe($apple.contents()[0]);
      expect($orange.find('.first')[0]).toBe($orange.contents()[0]);
      expect($pear.find('.first')[0]).toBe($pear.contents()[0]);
    });

    it('(fn) : should add returned Cheerio object as first child', function () {
      $fruits = $fruits.children();

      $fruits.prepend(function () {
        return $('<div class="second">');
      });

      var $apple = $fruits.eq(0);
      var $orange = $fruits.eq(1);
      var $pear = $fruits.eq(2);

      expect($apple.find('.second')[0]).toBe($apple.contents()[0]);
      expect($orange.find('.second')[0]).toBe($orange.contents()[0]);
      expect($pear.find('.second')[0]).toBe($pear.contents()[0]);
    });

    it('(fn) : should add returned Node as first child', function () {
      $fruits = $fruits.children();

      $fruits.prepend(function () {
        return $('<div class="third">')[0];
      });

      var $apple = $fruits.eq(0);
      var $orange = $fruits.eq(1);
      var $pear = $fruits.eq(2);

      expect($apple.find('.third')[0]).toBe($apple.contents()[0]);
      expect($orange.find('.third')[0]).toBe($orange.contents()[0]);
      expect($pear.find('.third')[0]).toBe($pear.contents()[0]);
    });

    it('($(...)) : should remove from root element', function () {
      var $plum = $('<li class="plum">Plum</li>');
      var root = $plum[0].parent;
      expect(root.type).toBe('root');

      $fruits.prepend($plum);
      expect($plum[0].parent.type).not.toBe('root');
      expect(root.childNodes).not.toContain($plum[0]);
    });
  });

  describe('.appendTo', function () {
    it('(html) : should add element as last child', function () {
      var $plum = $('<li class="plum">Plum</li>').appendTo(fruits);
      expect($plum.parent().children().eq(3).hasClass('plum')).toBe(true);
    });

    it('($(...)) : should add element as last child', function () {
      $('<li class="plum">Plum</li>').appendTo($fruits);
      expect($fruits.children().eq(3).hasClass('plum')).toBe(true);
    });

    it('(Node) : should add element as last child', function () {
      $('<li class="plum">Plum</li>').appendTo($fruits[0]);
      expect($fruits.children().eq(3).hasClass('plum')).toBe(true);
    });

    it('(selector) : should add element as last child', function () {
      $('<li class="plum">Plum</li>').appendTo('#fruits');
      expect($fruits.children().eq(3).hasClass('plum')).toBe(true);
    });

    it('(Array) : should add element as last child of all elements in the array', function () {
      var $multiple = $('<ul><li>Apple</li></ul><ul><li>Orange</li></ul>');
      $('<li class="plum">Plum</li>').appendTo($multiple.get());
      expect($multiple.first().children().eq(1).hasClass('plum')).toBe(true);
      expect($multiple.last().children().eq(1).hasClass('plum')).toBe(true);
    });
  });

  describe('.prependTo', function () {
    it('(html) : should add element as first child', function () {
      var $plum = $('<li class="plum">Plum</li>').prependTo(fruits);
      expect($plum.parent().children().eq(0).hasClass('plum')).toBe(true);
    });

    it('($(...)) : should add element as first child', function () {
      $('<li class="plum">Plum</li>').prependTo($fruits);
      expect($fruits.children().eq(0).hasClass('plum')).toBe(true);
    });

    it('(Node) : should add node as first child', function () {
      $('<li class="plum">Plum</li>').prependTo($fruits[0]);
      expect($fruits.children().eq(0).hasClass('plum')).toBe(true);
    });

    it('(selector) : should add element as first child', function () {
      $('<li class="plum">Plum</li>').prependTo('#fruits');
      expect($fruits.children().eq(0).hasClass('plum')).toBe(true);
    });

    it('(Array) : should add element as first child of all elements in the array', function () {
      var $multiple = $('<ul><li>Apple</li></ul><ul><li>Orange</li></ul>');
      $('<li class="plum">Plum</li>').prependTo($multiple.get());
      expect($multiple.first().children().eq(0).hasClass('plum')).toBe(true);
      expect($multiple.last().children().eq(0).hasClass('plum')).toBe(true);
    });
  });

  describe('.after', function () {
    it('() : should do nothing', function () {
      expect($fruits.after()[0].tagName).toBe('ul');
    });

    it('(html) : should add element as next sibling', function () {
      var grape = '<li class="grape">Grape</li>';
      $('.apple').after(grape);
      expect($('.apple').next().hasClass('grape')).toBe(true);
    });

    it('(Array) : should add all elements in the array as next sibling', function () {
      var more = $(
        '<li class="plum">Plum</li><li class="grape">Grape</li>'
      ).get();
      $('.apple').after(more);
      expect($fruits.children().eq(1).hasClass('plum')).toBe(true);
      expect($fruits.children().eq(2).hasClass('grape')).toBe(true);
    });

    it('($(...)) : should add element as next sibling', function () {
      var $plum = $('<li class="plum">Plum</li>');
      $('.apple').after($plum);
      expect($('.apple').next().hasClass('plum')).toBe(true);
    });

    it('(Node) : should add element as next sibling', function () {
      var plum = $('<li class="plum">Plum</li>')[0];
      $('.apple').after(plum);
      expect($('.apple').next().hasClass('plum')).toBe(true);
    });

    it('(existing Node) : should remove existing nodes from previous locations', function () {
      var pear = $fruits.children()[2];

      $('.apple').after(pear);

      var $children = $fruits.children();
      expect($children).toHaveLength(3);
      expect($children[1]).toBe(pear);
    });

    it('(existing Node) : should update original direct siblings', function () {
      $('.pear').after($('.orange'));
      expect($('.apple').next()[0]).toBe($('.pear')[0]);
      expect($('.pear').prev()[0]).toBe($('.apple')[0]);
    });

    it('(existing Node) : should clone all but the last occurrence', function () {
      var $originalApple = $('.apple');
      $('.orange, .pear').after($originalApple);

      expect($('.apple')).toHaveLength(2);
      expect($('.apple').eq(0).prev()[0]).toBe($('.orange')[0]);
      expect($('.apple').eq(0).next()[0]).toBe($('.pear')[0]);
      expect($('.apple').eq(1).prev()[0]).toBe($('.pear')[0]);
      expect($('.apple').eq(1).next()).toHaveLength(0);
      expect($('.apple')[0]).not.toStrictEqual($originalApple[0]);
      expect($('.apple')[1]).toStrictEqual($originalApple[0]);
    });

    it('(elem) : should handle if removed', function () {
      var $apple = $('.apple');
      var $plum = $('<li class="plum">Plum</li>');

      $apple.remove();
      $apple.after($plum);
      expect($plum.prev()).toHaveLength(0);
    });

    it('($(...), html) : should add multiple elements as next siblings', function () {
      var $plum = $('<li class="plum">Plum</li>');
      var grape = '<li class="grape">Grape</li>';
      $('.apple').after($plum, grape);
      expect($('.apple').next().hasClass('plum')).toBe(true);
      expect($('.plum').next().hasClass('grape')).toBe(true);
    });

    it('(fn) : should invoke the callback with the correct arguments and context', function () {
      var args = [];
      var thisValues = [];
      $fruits = $fruits.children();

      $fruits.after(function () {
        args.push(Array.from(arguments));
        thisValues.push(this);
      });

      expect(args).toStrictEqual([
        [0, 'Apple'],
        [1, 'Orange'],
        [2, 'Pear'],
      ]);
      expect(thisValues).toStrictEqual([$fruits[0], $fruits[1], $fruits[2]]);
    });

    it('(fn) : should add returned string as next sibling', function () {
      $fruits = $fruits.children();

      $fruits.after(function () {
        return '<li class="first">';
      });

      expect($('.first')[0]).toBe($('#fruits').contents()[1]);
      expect($('.first')[1]).toBe($('#fruits').contents()[3]);
      expect($('.first')[2]).toBe($('#fruits').contents()[5]);
    });

    it('(fn) : should add returned Cheerio object as next sibling', function () {
      $fruits = $fruits.children();

      $fruits.after(function () {
        return $('<li class="second">');
      });

      expect($('.second')[0]).toBe($('#fruits').contents()[1]);
      expect($('.second')[1]).toBe($('#fruits').contents()[3]);
      expect($('.second')[2]).toBe($('#fruits').contents()[5]);
    });

    it('(fn) : should add returned element as next sibling', function () {
      $fruits = $fruits.children();

      $fruits.after(function () {
        return $('<li class="third">')[0];
      });

      expect($('.third')[0]).toBe($('#fruits').contents()[1]);
      expect($('.third')[1]).toBe($('#fruits').contents()[3]);
      expect($('.third')[2]).toBe($('#fruits').contents()[5]);
    });

    it('($(...)) : should remove from root element', function () {
      var $plum = $('<li class="plum">Plum</li>');
      var root = $plum[0].parent;
      expect(root.type).toBe('root');

      $fruits.after($plum);
      expect($plum[0].parent.type).not.toBe('root');
      expect(root.childNodes).not.toContain($plum[0]);
    });
  });

  describe('.insertAfter', function () {
    it('(selector) : should create element and add as next sibling', function () {
      var grape = $('<li class="grape">Grape</li>');
      grape.insertAfter('.apple');
      expect($('.apple').next().hasClass('grape')).toBe(true);
    });

    it('(selector) : should create element and add as next sibling of multiple elements', function () {
      var grape = $('<li class="grape">Grape</li>');
      grape.insertAfter('.apple, .pear');
      expect($('.apple').next().hasClass('grape')).toBe(true);
      expect($('.pear').next().hasClass('grape')).toBe(true);
    });

    it('($(...)) : should create element and add as next sibling', function () {
      var grape = $('<li class="grape">Grape</li>');
      grape.insertAfter($('.apple'));
      expect($('.apple').next().hasClass('grape')).toBe(true);
    });

    it('($(...)) : should create element and add as next sibling of multiple elements', function () {
      var grape = $('<li class="grape">Grape</li>');
      grape.insertAfter($('.apple, .pear'));
      expect($('.apple').next().hasClass('grape')).toBe(true);
      expect($('.pear').next().hasClass('grape')).toBe(true);
    });

    it('($(...)) : should create all elements in the array and add as next siblings', function () {
      var more = $('<li class="plum">Plum</li><li class="grape">Grape</li>');
      more.insertAfter($('.apple'));
      expect($fruits.children().eq(0).hasClass('apple')).toBe(true);
      expect($fruits.children().eq(1).hasClass('plum')).toBe(true);
      expect($fruits.children().eq(2).hasClass('grape')).toBe(true);
    });

    it('(existing Node) : should remove existing nodes from previous locations', function () {
      $('.orange').insertAfter('.pear');
      expect($fruits.children().eq(1).hasClass('orange')).toBe(false);
      expect($fruits.children().length).toBe(3);
      expect($('.orange').length).toBe(1);
    });

    it('(existing Node) : should update original direct siblings', function () {
      $('.orange').insertAfter('.pear');
      expect($('.apple').next().hasClass('pear')).toBe(true);
      expect($('.pear').prev().hasClass('apple')).toBe(true);
      expect($('.pear').next().hasClass('orange')).toBe(true);
      expect($('.orange').next()).toHaveLength(0);
    });

    it('(existing Node) : should update original direct siblings of multiple elements', function () {
      $('.apple').insertAfter('.orange, .pear');
      expect($('.orange').prev()).toHaveLength(0);
      expect($('.orange').next().hasClass('apple')).toBe(true);
      expect($('.pear').next().hasClass('apple')).toBe(true);
      expect($('.pear').prev().hasClass('apple')).toBe(true);
      expect($fruits.children().length).toBe(4);
      var apples = $('.apple');
      expect(apples.length).toBe(2);
      expect(apples.eq(0).prev().hasClass('orange')).toBe(true);
      expect(apples.eq(1).prev().hasClass('pear')).toBe(true);
    });

    it('(elem) : should handle if removed', function () {
      var $apple = $('.apple');
      var $plum = $('<li class="plum">Plum</li>');
      $apple.remove();
      $plum.insertAfter($apple);
      expect($plum.prev()).toHaveLength(0);
    });

    it('(single) should return the new element for chaining', function () {
      var $grape = $('<li class="grape">Grape</li>').insertAfter('.apple');
      expect($grape.cheerio).toBeTruthy();
      expect($grape.each).toBeTruthy();
      expect($grape.length).toBe(1);
      expect($grape.hasClass('grape')).toBe(true);
    });

    it('(single) should return the new elements for chaining', function () {
      var $purple = $(
        '<li class="grape">Grape</li><li class="plum">Plum</li>'
      ).insertAfter('.apple');
      expect($purple.cheerio).toBeTruthy();
      expect($purple.each).toBeTruthy();
      expect($purple.length).toBe(2);
      expect($purple.eq(0).hasClass('grape')).toBe(true);
      expect($purple.eq(1).hasClass('plum')).toBe(true);
    });

    it('(multiple) should return the new elements for chaining', function () {
      var $purple = $(
        '<li class="grape">Grape</li><li class="plum">Plum</li>'
      ).insertAfter('.apple, .pear');
      expect($purple.cheerio).toBeTruthy();
      expect($purple.each).toBeTruthy();
      expect($purple.length).toBe(4);
      expect($purple.eq(0).hasClass('grape')).toBe(true);
      expect($purple.eq(1).hasClass('plum')).toBe(true);
      expect($purple.eq(2).hasClass('grape')).toBe(true);
      expect($purple.eq(3).hasClass('plum')).toBe(true);
    });

    it('(single) should return the existing element for chaining', function () {
      var $pear = $('.pear').insertAfter('.apple');
      expect($pear.cheerio).toBeTruthy();
      expect($pear.each).toBeTruthy();
      expect($pear.length).toBe(1);
      expect($pear.hasClass('pear')).toBe(true);
    });

    it('(single) should return the existing elements for chaining', function () {
      var $things = $('.orange, .apple').insertAfter('.pear');
      expect($things.cheerio).toBeTruthy();
      expect($things.each).toBeTruthy();
      expect($things.length).toBe(2);
      expect($things.eq(0).hasClass('apple')).toBe(true);
      expect($things.eq(1).hasClass('orange')).toBe(true);
    });

    it('(multiple) should return the existing elements for chaining', function () {
      $('<li class="grape">Grape</li>').insertAfter('.apple');
      var $things = $('.orange, .apple').insertAfter('.pear, .grape');
      expect($things.cheerio).toBeTruthy();
      expect($things.each).toBeTruthy();
      expect($things.length).toBe(4);
      expect($things.eq(0).hasClass('apple')).toBe(true);
      expect($things.eq(1).hasClass('orange')).toBe(true);
      expect($things.eq(2).hasClass('apple')).toBe(true);
      expect($things.eq(3).hasClass('orange')).toBe(true);
    });
  });

  describe('.before', function () {
    it('() : should do nothing', function () {
      expect($('#fruits').before()[0].tagName).toBe('ul');
    });

    it('(html) : should add element as previous sibling', function () {
      var grape = '<li class="grape">Grape</li>';
      $('.apple').before(grape);
      expect($('.apple').prev().hasClass('grape')).toBe(true);
    });

    it('($(...)) : should add element as previous sibling', function () {
      var $plum = $('<li class="plum">Plum</li>');
      $('.apple').before($plum);
      expect($('.apple').prev().hasClass('plum')).toBe(true);
    });

    it('(Node) : should add element as previous sibling', function () {
      var plum = $('<li class="plum">Plum</li>')[0];
      $('.apple').before(plum);
      expect($('.apple').prev().hasClass('plum')).toBe(true);
    });

    it('(existing Node) : should remove existing nodes from previous locations', function () {
      var pear = $fruits.children()[2];

      $('.apple').before(pear);

      var $children = $fruits.children();
      expect($children).toHaveLength(3);
      expect($children[0]).toBe(pear);
    });

    it('(existing Node) : should update original direct siblings', function () {
      $('.apple').before($('.orange'));
      expect($('.apple').next()[0]).toBe($('.pear')[0]);
      expect($('.pear').prev()[0]).toBe($('.apple')[0]);
    });

    it('(existing Node) : should clone all but the last occurrence', function () {
      var $originalPear = $('.pear');
      $('.apple, .orange').before($originalPear);

      expect($('.pear')).toHaveLength(2);
      expect($('.pear').eq(0).prev()).toHaveLength(0);
      expect($('.pear').eq(0).next()[0]).toBe($('.apple')[0]);
      expect($('.pear').eq(1).prev()[0]).toBe($('.apple')[0]);
      expect($('.pear').eq(1).next()[0]).toBe($('.orange')[0]);
      expect($('.pear')[0]).not.toStrictEqual($originalPear[0]);
      expect($('.pear')[1]).toStrictEqual($originalPear[0]);
    });

    it('(elem) : should handle if removed', function () {
      var $apple = $('.apple');
      var $plum = $('<li class="plum">Plum</li>');

      $apple.remove();
      $apple.before($plum);
      expect($plum.next()).toHaveLength(0);
    });

    it('(Array) : should add all elements in the array as previous sibling', function () {
      var more = $(
        '<li class="plum">Plum</li><li class="grape">Grape</li>'
      ).get();
      $('.apple').before(more);
      expect($fruits.children().eq(0).hasClass('plum')).toBe(true);
      expect($fruits.children().eq(1).hasClass('grape')).toBe(true);
    });

    it('($(...), html) : should add multiple elements as previous siblings', function () {
      var $plum = $('<li class="plum">Plum</li>');
      var grape = '<li class="grape">Grape</li>';
      $('.apple').before($plum, grape);
      expect($('.apple').prev().hasClass('grape')).toBe(true);
      expect($('.grape').prev().hasClass('plum')).toBe(true);
    });

    it('(fn) : should invoke the callback with the correct arguments and context', function () {
      var args = [];
      var thisValues = [];
      $fruits = $fruits.children();

      $fruits.before(function () {
        args.push(Array.from(arguments));
        thisValues.push(this);
      });

      expect(args).toStrictEqual([
        [0, 'Apple'],
        [1, 'Orange'],
        [2, 'Pear'],
      ]);
      expect(thisValues).toStrictEqual([$fruits[0], $fruits[1], $fruits[2]]);
    });

    it('(fn) : should add returned string as previous sibling', function () {
      $fruits = $fruits.children();

      $fruits.before(function () {
        return '<li class="first">';
      });

      expect($('.first')[0]).toBe($('#fruits').contents()[0]);
      expect($('.first')[1]).toBe($('#fruits').contents()[2]);
      expect($('.first')[2]).toBe($('#fruits').contents()[4]);
    });

    it('(fn) : should add returned Cheerio object as previous sibling', function () {
      $fruits = $fruits.children();

      $fruits.before(function () {
        return $('<li class="second">');
      });

      expect($('.second')[0]).toBe($('#fruits').contents()[0]);
      expect($('.second')[1]).toBe($('#fruits').contents()[2]);
      expect($('.second')[2]).toBe($('#fruits').contents()[4]);
    });

    it('(fn) : should add returned Node as previous sibling', function () {
      $fruits = $fruits.children();

      $fruits.before(function () {
        return $('<li class="third">')[0];
      });

      expect($('.third')[0]).toBe($('#fruits').contents()[0]);
      expect($('.third')[1]).toBe($('#fruits').contents()[2]);
      expect($('.third')[2]).toBe($('#fruits').contents()[4]);
    });

    it('($(...)) : should remove from root element', function () {
      var $plum = $('<li class="plum">Plum</li>');
      var root = $plum[0].parent;
      expect(root.type).toBe('root');

      $fruits.before($plum);
      expect($plum[0].parent.type).not.toBe('root');
      expect(root.childNodes).not.toContain($plum[0]);
    });
  });

  describe('.insertBefore', function () {
    it('(selector) : should create element and add as prev sibling', function () {
      var grape = $('<li class="grape">Grape</li>');
      grape.insertBefore('.apple');
      expect($('.apple').prev().hasClass('grape')).toBe(true);
    });

    it('(selector) : should create element and add as prev sibling of multiple elements', function () {
      var grape = $('<li class="grape">Grape</li>');
      grape.insertBefore('.apple, .pear');
      expect($('.apple').prev().hasClass('grape')).toBe(true);
      expect($('.pear').prev().hasClass('grape')).toBe(true);
    });

    it('($(...)) : should create element and add as prev sibling', function () {
      var grape = $('<li class="grape">Grape</li>');
      grape.insertBefore($('.apple'));
      expect($('.apple').prev().hasClass('grape')).toBe(true);
    });

    it('($(...)) : should create element and add as next sibling of multiple elements', function () {
      var grape = $('<li class="grape">Grape</li>');
      grape.insertBefore($('.apple, .pear'));
      expect($('.apple').prev().hasClass('grape')).toBe(true);
      expect($('.pear').prev().hasClass('grape')).toBe(true);
    });

    it('($(...)) : should create all elements in the array and add as prev siblings', function () {
      var more = $('<li class="plum">Plum</li><li class="grape">Grape</li>');
      more.insertBefore($('.apple'));
      expect($fruits.children().eq(0).hasClass('plum')).toBe(true);
      expect($fruits.children().eq(1).hasClass('grape')).toBe(true);
      expect($fruits.children().eq(2).hasClass('apple')).toBe(true);
    });

    it('(existing Node) : should remove existing nodes from previous locations', function () {
      $('.pear').insertBefore('.apple');
      expect($fruits.children().eq(2).hasClass('pear')).toBe(false);
      expect($fruits.children().length).toBe(3);
      expect($('.pear').length).toBe(1);
    });

    it('(existing Node) : should update original direct siblings', function () {
      $('.pear').insertBefore('.apple');
      expect($('.apple').prev().hasClass('pear')).toBe(true);
      expect($('.apple').next().hasClass('orange')).toBe(true);
      expect($('.pear').next().hasClass('apple')).toBe(true);
      expect($('.pear').prev()).toHaveLength(0);
    });

    it('(existing Node) : should update original direct siblings of multiple elements', function () {
      $('.pear').insertBefore('.apple, .orange');
      expect($('.apple').prev().hasClass('pear')).toBe(true);
      expect($('.apple').next().hasClass('pear')).toBe(true);
      expect($('.orange').prev().hasClass('pear')).toBe(true);
      expect($('.orange').next()).toHaveLength(0);
      expect($fruits.children().length).toBe(4);
      var pears = $('.pear');
      expect(pears.length).toBe(2);
      expect(pears.eq(0).next().hasClass('apple')).toBe(true);
      expect(pears.eq(1).next().hasClass('orange')).toBe(true);
    });

    it('(elem) : should handle if removed', function () {
      var $apple = $('.apple');
      var $plum = $('<li class="plum">Plum</li>');

      $apple.remove();
      $plum.insertBefore($apple);
      expect($plum.next()).toHaveLength(0);
    });

    it('(single) should return the new element for chaining', function () {
      var $grape = $('<li class="grape">Grape</li>').insertBefore('.apple');
      expect($grape.cheerio).toBeTruthy();
      expect($grape.each).toBeTruthy();
      expect($grape.length).toBe(1);
      expect($grape.hasClass('grape')).toBe(true);
    });

    it('(single) should return the new elements for chaining', function () {
      var $purple = $(
        '<li class="grape">Grape</li><li class="plum">Plum</li>'
      ).insertBefore('.apple');
      expect($purple.cheerio).toBeTruthy();
      expect($purple.each).toBeTruthy();
      expect($purple.length).toBe(2);
      expect($purple.eq(0).hasClass('grape')).toBe(true);
      expect($purple.eq(1).hasClass('plum')).toBe(true);
    });

    it('(multiple) should return the new elements for chaining', function () {
      var $purple = $(
        '<li class="grape">Grape</li><li class="plum">Plum</li>'
      ).insertBefore('.apple, .pear');
      expect($purple.cheerio).toBeTruthy();
      expect($purple.each).toBeTruthy();
      expect($purple.length).toBe(4);
      expect($purple.eq(0).hasClass('grape')).toBe(true);
      expect($purple.eq(1).hasClass('plum')).toBe(true);
      expect($purple.eq(2).hasClass('grape')).toBe(true);
      expect($purple.eq(3).hasClass('plum')).toBe(true);
    });

    it('(single) should return the existing element for chaining', function () {
      var $orange = $('.orange').insertBefore('.apple');
      expect($orange.cheerio).toBeTruthy();
      expect($orange.each).toBeTruthy();
      expect($orange.length).toBe(1);
      expect($orange.hasClass('orange')).toBe(true);
    });

    it('(single) should return the existing elements for chaining', function () {
      var $things = $('.orange, .pear').insertBefore('.apple');
      expect($things.cheerio).toBeTruthy();
      expect($things.each).toBeTruthy();
      expect($things.length).toBe(2);
      expect($things.eq(0).hasClass('orange')).toBe(true);
      expect($things.eq(1).hasClass('pear')).toBe(true);
    });

    it('(multiple) should return the existing elements for chaining', function () {
      $('<li class="grape">Grape</li>').insertBefore('.apple');
      var $things = $('.orange, .apple').insertBefore('.pear, .grape');
      expect($things.cheerio).toBeTruthy();
      expect($things.each).toBeTruthy();
      expect($things.length).toBe(4);
      expect($things.eq(0).hasClass('apple')).toBe(true);
      expect($things.eq(1).hasClass('orange')).toBe(true);
      expect($things.eq(2).hasClass('apple')).toBe(true);
      expect($things.eq(3).hasClass('orange')).toBe(true);
    });
  });

  describe('.remove', function () {
    it('() : should remove selected elements', function () {
      $('.apple').remove();
      expect($fruits.find('.apple')).toHaveLength(0);
    });

    it('() : should be reentrant', function () {
      var $apple = $('.apple');
      $apple.remove();
      $apple.remove();
      expect($fruits.find('.apple')).toHaveLength(0);
    });

    it('(selector) : should remove matching selected elements', function () {
      $('li').remove('.apple');
      expect($fruits.find('.apple')).toHaveLength(0);
    });

    it('($(...)) : should remove from root element', function () {
      var $plum = $('<li class="plum">Plum</li>');
      var root = $plum[0].parent;
      expect(root.type).toBe('root');

      $plum.remove();
      expect($plum[0].parent).toBe(null);
      expect(root.childNodes).not.toContain($plum[0]);
    });
  });

  describe('.replaceWith', function () {
    it('(elem) : should replace one <li> tag with another', function () {
      var $plum = $('<li class="plum">Plum</li>');
      $('.orange').replaceWith($plum);
      expect($('.apple').next().hasClass('plum')).toBe(true);
      expect($('.apple').next().html()).toBe('Plum');
      expect($('.pear').prev().hasClass('plum')).toBe(true);
      expect($('.pear').prev().html()).toBe('Plum');
    });

    it('(Array) : should replace one <li> tag with the elements in the array', function () {
      var more = $(
        '<li class="plum">Plum</li><li class="grape">Grape</li>'
      ).get();
      $('.orange').replaceWith(more);

      expect($fruits.children().eq(1).hasClass('plum')).toBe(true);
      expect($fruits.children().eq(2).hasClass('grape')).toBe(true);
      expect($('.apple').next().hasClass('plum')).toBe(true);
      expect($('.pear').prev().hasClass('grape')).toBe(true);
      expect($fruits.children()).toHaveLength(4);
    });

    it('(Node) : should replace the selected element with given node', function () {
      var $src = $('<h2>hi <span>there</span></h2>');
      var $new = $('<ul></ul>');
      var $replaced = $src.find('span').replaceWith($new[0]);
      expect($new[0].parentNode).toBe($src[0]);
      expect($replaced[0].parentNode).toBe(null);
      expect($.html($src)).toBe('<h2>hi <ul></ul></h2>');
    });

    it('(existing element) : should remove element from its previous location', function () {
      $('.pear').replaceWith($('.apple'));
      expect($fruits.children()).toHaveLength(2);
      expect($fruits.children()[0]).toBe($('.orange')[0]);
      expect($fruits.children()[1]).toBe($('.apple')[0]);
    });

    it('(elem) : should NOP if removed', function () {
      var $pear = $('.pear');
      var $plum = $('<li class="plum">Plum</li>');

      $pear.remove();
      $pear.replaceWith($plum);
      expect($('.orange').next().hasClass('plum')).toBe(false);
    });

    it('(elem) : should replace the single selected element with given element', function () {
      var $src = $('<h2>hi <span>there</span></h2>');
      var $new = $('<div>here</div>');
      var $replaced = $src.find('span').replaceWith($new);
      expect($new[0].parentNode).toBe($src[0]);
      expect($replaced[0].parentNode).toBe(null);
      expect($.html($src)).toBe('<h2>hi <div>here</div></h2>');
    });

    it('(self) : should be replaced after replacing it with itself', function () {
      var $a = cheerio.load('<a>foo</a>', null, false);
      var replacement = '<a>bar</a>';
      $a('a').replaceWith(function (i, el) {
        return el;
      });
      $a('a').replaceWith(replacement);
      expect($a.html()).toBe(replacement);
    });

    it('(str) : should accept strings', function () {
      var $src = $('<h2>hi <span>there</span></h2>');
      var newStr = '<div>here</div>';
      var $replaced = $src.find('span').replaceWith(newStr);
      expect($replaced[0].parentNode).toBe(null);
      expect($.html($src)).toBe('<h2>hi <div>here</div></h2>');
    });

    it('(str) : should replace all selected elements', function () {
      var $src = $('<b>a<br>b<br>c<br>d</b>');
      var $replaced = $src.find('br').replaceWith(' ');
      expect($replaced[0].parentNode).toBe(null);
      expect($.html($src)).toBe('<b>a b c d</b>');
    });

    it('(fn) : should invoke the callback with the correct argument and context', function () {
      var origChildren = $fruits.children().get();
      var args = [];
      var thisValues = [];

      $fruits.children().replaceWith(function () {
        args.push(Array.from(arguments));
        thisValues.push(this);
        return '<li class="first">';
      });

      expect(args).toStrictEqual([
        [0, origChildren[0]],
        [1, origChildren[1]],
        [2, origChildren[2]],
      ]);
      expect(thisValues).toStrictEqual([
        origChildren[0],
        origChildren[1],
        origChildren[2],
      ]);
    });

    it('(fn) : should replace the selected element with the returned string', function () {
      $fruits.children().replaceWith(function () {
        return '<li class="first">';
      });

      expect($fruits.find('.first')).toHaveLength(3);
    });

    it('(fn) : should replace the selected element with the returned Cheerio object', function () {
      $fruits.children().replaceWith(function () {
        return $('<li class="second">');
      });

      expect($fruits.find('.second')).toHaveLength(3);
    });

    it('(fn) : should replace the selected element with the returned node', function () {
      $fruits.children().replaceWith(function () {
        return $('<li class="third">')[0];
      });

      expect($fruits.find('.third')).toHaveLength(3);
    });

    it('($(...)) : should remove from root element', function () {
      var $plum = $('<li class="plum">Plum</li>');
      var root = $plum[0].parent;
      expect(root.type).toBe('root');

      $fruits.children().replaceWith($plum);
      expect($plum[0].parent.type).not.toBe('root');
      expect(root.childNodes).not.toContain($plum[0]);
    });
  });

  describe('.empty', function () {
    it('() : should remove all children from selected elements', function () {
      expect($fruits.children()).toHaveLength(3);

      $fruits.empty();
      expect($fruits.children()).toHaveLength(0);
    });

    it('() : should allow element reinsertion', function () {
      var $children = $fruits.children();

      $fruits.empty();
      expect($fruits.children()).toHaveLength(0);
      expect($children).toHaveLength(3);

      $fruits.append($('<div></div><div></div>'));
      var $remove = $fruits.children().eq(0);

      $remove.replaceWith($children);
      expect($fruits.children()).toHaveLength(4);
    });

    it("() : should destroy children's references to the parent", function () {
      var $children = $fruits.children();

      $fruits.empty();

      expect($children.eq(0).parent()).toHaveLength(0);
      expect($children.eq(0).next()).toHaveLength(0);
      expect($children.eq(0).prev()).toHaveLength(0);
      expect($children.eq(1).parent()).toHaveLength(0);
      expect($children.eq(1).next()).toHaveLength(0);
      expect($children.eq(1).prev()).toHaveLength(0);
      expect($children.eq(2).parent()).toHaveLength(0);
      expect($children.eq(2).next()).toHaveLength(0);
      expect($children.eq(2).prev()).toHaveLength(0);
    });
  });

  describe('.html', function () {
    it('() : should get the innerHTML for an element', function () {
      expect($fruits.html()).toBe(
        [
          '<li class="apple">Apple</li>',
          '<li class="orange">Orange</li>',
          '<li class="pear">Pear</li>',
        ].join('')
      );
    });

    it('() : should get innerHTML even if its just text', function () {
      var item = '<li class="pear">Pear</li>';
      expect($('.pear', item).html()).toBe('Pear');
    });

    it('() : should return empty string if nothing inside', function () {
      var item = '<li></li>';
      expect($('li', item).html()).toBe('');
    });

    it('(html) : should set the html for its children', function () {
      $fruits.html('<li class="durian">Durian</li>');
      var html = $fruits.html();
      expect(html).toBe('<li class="durian">Durian</li>');
    });

    it('(html) : should add new elements for each element in selection', function () {
      $fruits = $('li');
      $fruits.html('<li class="durian">Durian</li>');
      var tested = 0;
      $fruits.each(function () {
        expect($(this).children().parent().get(0)).toBe(this);
        tested++;
      });
      expect(tested).toBe(3);
    });

    it('(elem) : should set the html for its children with element', function () {
      $fruits.html($('<li class="durian">Durian</li>'));
      var html = $fruits.html();
      expect(html).toBe('<li class="durian">Durian</li>');
    });

    it('() : should allow element reinsertion', function () {
      var $children = $fruits.children();

      $fruits.html('<div></div><div></div>');
      expect($fruits.children()).toHaveLength(2);

      var $remove = $fruits.children().eq(0);

      $remove.replaceWith($children);
      expect($fruits.children()).toHaveLength(4);
    });

    it('(script value) : should add content as text', function () {
      var $data = '<a><b>';
      var $script = $('<script>').html($data);

      expect($script).toHaveLength(1);
      expect($script[0].type).toBe('script');
      expect($script[0].name).toBe('script');

      expect($script[0].children).toHaveLength(1);
      expect($script[0].children[0].type).toBe('text');
      expect($script[0].children[0].data).toBe($data);
    });
  });

  describe('.toString', function () {
    it('() : should get the outerHTML for an element', function () {
      expect($fruits.toString()).toBe(fruits);
    });

    it('() : should return an html string for a set of elements', function () {
      expect($fruits.find('li').toString()).toBe(
        '<li class="apple">Apple</li><li class="orange">Orange</li><li class="pear">Pear</li>'
      );
    });

    it('() : should be called implicitly', function () {
      var string = [$('<foo>'), $('<bar>'), $('<baz>')].join('');
      expect(string).toBe('<foo></foo><bar></bar><baz></baz>');
    });

    it('() : should pass options', function () {
      var dom = cheerio.load('&', { xml: { decodeEntities: false } });
      expect(dom.root().toString()).toBe('&');
    });
  });

  describe('.text', function () {
    it('() : gets the text for a single element', function () {
      expect($('.apple').text()).toBe('Apple');
    });

    it('() : combines all text from children text nodes', function () {
      expect($('#fruits').text()).toBe('AppleOrangePear');
    });

    it('(text) : sets the text for the child node', function () {
      $('.apple').text('Granny Smith Apple');
      expect($('.apple')[0].childNodes[0].data).toBe('Granny Smith Apple');
    });

    it('(text) : inserts separate nodes for all children', function () {
      $('li').text('Fruits');
      var tested = 0;
      $('li').each(function () {
        expect(this.childNodes[0].parentNode).toBe(this);
        tested++;
      });
      expect(tested).toBe(3);
    });

    it('(text) : should create a Node with the DOM level 1 API', function () {
      var $apple = $('.apple');

      $apple.text('anything');
      var textNode = $apple[0].childNodes[0];

      expect(textNode.parentNode).toBe($apple[0]);
      expect(textNode.nodeType).toBe(3);
      expect(textNode.data).toBe('anything');
    });

    it('should allow functions as arguments', function () {
      $('.apple').text(function (idx, content) {
        expect(idx).toBe(0);
        expect(content).toBe('Apple');
        return 'whatever mate';
      });
      expect($('.apple')[0].childNodes[0].data).toBe('whatever mate');
    });

    it('should allow functions as arguments for multiple elements', function () {
      $('li').text(function (idx) {
        return 'text' + idx;
      });
      $('li').each(function (idx) {
        expect(this.childNodes[0].data).toBe('text' + idx);
      });
    });

    it('should decode special chars', function () {
      var text = $('<p>M&amp;M</p>').text();
      expect(text).toBe('M&M');
    });

    it('should work with special chars added as strings', function () {
      var text = $('<p>M&M</p>').text();
      expect(text).toBe('M&M');
    });

    it('( undefined ) : should act as an accessor', function () {
      var $div = $('<div>test</div>');
      expect(typeof $div.text(undefined)).toBe('string');
      expect($div.text()).toBe('test');
    });

    it('( "" ) : should convert to string', function () {
      var $div = $('<div>test</div>');
      expect($div.text('').text()).toBe('');
    });

    it('( null ) : should convert to string', function () {
      expect($('<div>').text(null).text()).toBe('null');
    });

    it('( 0 ) : should convert to string', function () {
      expect($('<div>').text(0).text()).toBe('0');
    });

    it('(str) should encode then decode unsafe characters', function () {
      var $apple = $('.apple');

      $apple.text('blah <script>alert("XSS!")</script> blah');
      expect($apple[0].childNodes[0].data).toBe(
        'blah <script>alert("XSS!")</script> blah'
      );
      expect($apple.text()).toBe('blah <script>alert("XSS!")</script> blah');

      $apple.text('blah <script>alert("XSS!")</script> blah');
      expect($apple.html()).not.toContain('<script>alert("XSS!")</script>');
    });
  });
});
