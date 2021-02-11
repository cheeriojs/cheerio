'use strict';
var cheerio = require('../..');
var food = require('../__fixtures__/fixtures').food;
var fruits = require('../__fixtures__/fixtures').fruits;
var drinks = require('../__fixtures__/fixtures').drinks;
var text = require('../__fixtures__/fixtures').text;

describe('$(...)', function () {
  var $;

  beforeEach(function () {
    $ = cheerio.load(fruits);
  });

  describe('.load', function () {
    it('should throw a TypeError if given invalid input', function () {
      expect(function () {
        cheerio.load();
      }).toThrow('cheerio.load() expects a string');
    });
  });

  describe('.find', function () {
    it('() : should find nothing', function () {
      expect($('ul').find()).toHaveLength(0);
    });

    it('(single) : should find one descendant', function () {
      expect($('#fruits').find('.apple')[0].attribs['class']).toBe('apple');
    });

    // #1679 - text tags not filtered
    it('(single) : should filter out text nodes', function () {
      var $root = $('<html>\n' + fruits.replace(/></g, '>\n<') + '\n</html>');
      expect($root.find('.apple')[0].attribs['class']).toBe('apple');
    });

    it('(many) : should find all matching descendant', function () {
      expect($('#fruits').find('li')).toHaveLength(3);
    });

    it('(many) : should merge all selected elems with matching descendants', function () {
      expect($('#fruits, #food', food).find('.apple')).toHaveLength(1);
    });

    it('(invalid single) : should return empty if cant find', function () {
      expect($('ul').find('blah')).toHaveLength(0);
    });

    it('(invalid single) : should query descendants only', function () {
      expect($('#fruits').find('ul')).toHaveLength(0);
    });

    it('should return empty if search already empty result', function () {
      expect($('#not-fruits').find('li')).toHaveLength(0);
    });

    it('should lowercase selectors', function () {
      expect($('#fruits').find('LI')).toHaveLength(3);
    });

    it('should query immediate descendant only', function () {
      var q = cheerio.load('<foo><bar><bar></bar><bar></bar></bar></foo>');
      expect(q('foo').find('> bar')).toHaveLength(1);
    });

    it('should find siblings', function () {
      var q = cheerio.load('<p class=a><p class=b></p>');
      expect(q('.a').find('+.b')).toHaveLength(1);
      expect(q('.a').find('~.b')).toHaveLength(1);
      expect(q('.a').find('+.a')).toHaveLength(0);
      expect(q('.a').find('~.a')).toHaveLength(0);
    });

    it('should query case-sensitively when in xml mode', function () {
      var q = cheerio.load('<caseSenSitive allTheWay>', { xml: true });
      expect(q('caseSenSitive')).toHaveLength(1);
      expect(q('[allTheWay]')).toHaveLength(1);
      expect(q('casesensitive')).toHaveLength(0);
      expect(q('[alltheway]')).toHaveLength(0);
    });

    it('should throw an Error if given an invalid selector', function () {
      expect(function () {
        $('#fruits').find(':bah');
      }).toThrow('unmatched pseudo-class');
    });

    describe('(cheerio object) :', function () {
      it('returns only those nodes contained within the current selection', function () {
        var q = cheerio.load(food);
        var $selection = q('#fruits').find(q('li'));

        expect($selection).toHaveLength(3);
        expect($selection[0]).toBe(q('.apple')[0]);
        expect($selection[1]).toBe(q('.orange')[0]);
        expect($selection[2]).toBe(q('.pear')[0]);
      });
      it('returns only those nodes contained within any element in the current selection', function () {
        var q = cheerio.load(food);
        var $selection = q('.apple, #vegetables').find(q('li'));

        expect($selection).toHaveLength(2);
        expect($selection[0]).toBe(q('.carrot')[0]);
        expect($selection[1]).toBe(q('.sweetcorn')[0]);
      });
    });

    describe('(node) :', function () {
      it('returns node when contained within the current selection', function () {
        var q = cheerio.load(food);
        var $selection = q('#fruits').find(q('.apple')[0]);

        expect($selection).toHaveLength(1);
        expect($selection[0]).toBe(q('.apple')[0]);
      });
      it('returns node when contained within any element the current selection', function () {
        var q = cheerio.load(food);
        var $selection = q('#fruits, #vegetables').find(q('.carrot')[0]);

        expect($selection).toHaveLength(1);
        expect($selection[0]).toBe(q('.carrot')[0]);
      });
      it('does not return node that is not contained within the current selection', function () {
        var q = cheerio.load(food);
        var $selection = q('#fruits').find(q('.carrot')[0]);

        expect($selection).toHaveLength(0);
      });
    });
  });

  describe('.children', function () {
    it('() : should get all children', function () {
      expect($('ul').children()).toHaveLength(3);
    });

    it('() : should return children of all matched elements', function () {
      expect($('ul ul', food).children()).toHaveLength(5);
    });

    it('(selector) : should return children matching selector', function () {
      var cls = $('ul').children('.orange')[0].attribs['class'];
      expect(cls).toBe('orange');
    });

    it('(invalid selector) : should return empty', function () {
      expect($('ul').children('.lulz')).toHaveLength(0);
    });

    it('should only match immediate children, not ancestors', function () {
      expect($(food).children('li')).toHaveLength(0);
    });
  });

  describe('.contents', function () {
    beforeEach(function () {
      $ = cheerio.load(text);
    });

    it('() : should get all contents', function () {
      expect($('p').contents()).toHaveLength(5);
    });

    it('() : should include text nodes', function () {
      expect($('p').contents().first()[0].type).toBe('text');
    });

    it('() : should include comment nodes', function () {
      expect($('p').contents().last()[0].type).toBe('comment');
    });
  });

  describe('.next', function () {
    it('() : should return next element', function () {
      var cls = $('.orange').next()[0].attribs['class'];
      expect(cls).toBe('pear');
    });

    it('(no next) : should return empty for last child', function () {
      expect($('.pear').next()).toHaveLength(0);
    });

    it('(next on empty object) : should return empty', function () {
      expect($('.banana').next()).toHaveLength(0);
    });

    it('() : should operate over all elements in the selection', function () {
      expect($('.apple, .orange', food).next()).toHaveLength(2);
    });

    describe('(selector) :', function () {
      it('should reject elements that violate the filter', function () {
        expect($('.apple').next('.non-existent')).toHaveLength(0);
      });

      it('should accept elements that satisify the filter', function () {
        expect($('.apple').next('.orange')).toHaveLength(1);
      });
    });
  });

  describe('.nextAll', function () {
    it('() : should return all following siblings', function () {
      var elems = $('.apple').nextAll();
      expect(elems).toHaveLength(2);
      expect(elems[0].attribs['class']).toBe('orange');
      expect(elems[1].attribs['class']).toBe('pear');
    });

    it('(no next) : should return empty for last child', function () {
      expect($('.pear').nextAll()).toHaveLength(0);
    });

    it('(nextAll on empty object) : should return empty', function () {
      expect($('.banana').nextAll()).toHaveLength(0);
    });

    it('() : should operate over all elements in the selection', function () {
      expect($('.apple, .carrot', food).nextAll()).toHaveLength(3);
    });

    it('() : should not contain duplicate elements', function () {
      var elems = $('.apple, .orange', food);
      expect(elems.nextAll()).toHaveLength(2);
    });

    describe('(selector) :', function () {
      it('should filter according to the provided selector', function () {
        expect($('.apple').nextAll('.pear')).toHaveLength(1);
      });

      it("should not consider siblings' contents when filtering", function () {
        expect($('#fruits', food).nextAll('li')).toHaveLength(0);
      });
    });
  });

  describe('.nextUntil', function () {
    it('() : should return all following siblings if no selector specified', function () {
      var elems = $('.apple', food).nextUntil();
      expect(elems).toHaveLength(2);
      expect(elems[0].attribs['class']).toBe('orange');
      expect(elems[1].attribs['class']).toBe('pear');
    });

    it('() : should filter out non-element nodes', function () {
      var elems = $('<div><div></div><!-- comment -->text<div></div></div>');
      var div = elems.children().eq(0);
      expect(div.nextUntil()).toHaveLength(1);
    });

    it('() : should operate over all elements in the selection', function () {
      var elems = $('.apple, .carrot', food);
      expect(elems.nextUntil()).toHaveLength(3);
    });

    it('() : should not contain duplicate elements', function () {
      var elems = $('.apple, .orange', food);
      expect(elems.nextUntil()).toHaveLength(2);
    });

    it('(selector) : should return all following siblings until selector', function () {
      var elems = $('.apple', food).nextUntil('.pear');
      expect(elems).toHaveLength(1);
      expect(elems[0].attribs['class']).toBe('orange');
    });

    it('(selector not sibling) : should return all following siblings', function () {
      var elems = $('.apple').nextUntil('#vegetables');
      expect(elems).toHaveLength(2);
    });

    it('(selector, filterString) : should return all following siblings until selector, filtered by filter', function () {
      var elems = $('.beer', drinks).nextUntil('.water', '.milk');
      expect(elems).toHaveLength(1);
      expect(elems[0].attribs['class']).toBe('milk');
    });

    it('(null, filterString) : should return all following siblings until selector, filtered by filter', function () {
      var elems = $('<ul><li></li><li><p></p></li></ul>');
      var empty = elems.find('li').eq(0).nextUntil(null, 'p');
      expect(empty).toHaveLength(0);
    });

    it('() : should return an empty object for last child', function () {
      expect($('.pear').nextUntil()).toHaveLength(0);
    });

    it('() : should return an empty object when called on an empty object', function () {
      expect($('.banana').nextUntil()).toHaveLength(0);
    });

    it('(node) : should return all following siblings until the node', function () {
      var $fruits = $('#fruits').children();
      var elems = $fruits.eq(0).nextUntil($fruits[2]);
      expect(elems).toHaveLength(1);
    });

    it('(cheerio object) : should return all following siblings until any member of the cheerio object', function () {
      var $drinks = $(drinks).children();
      var $until = $([$drinks[4], $drinks[3]]);
      var elems = $drinks.eq(0).nextUntil($until);
      expect(elems).toHaveLength(2);
    });
  });

  describe('.prev', function () {
    it('() : should return previous element', function () {
      var cls = $('.orange').prev()[0].attribs['class'];
      expect(cls).toBe('apple');
    });

    it('(no prev) : should return empty for first child', function () {
      expect($('.apple').prev()).toHaveLength(0);
    });

    it('(prev on empty object) : should return empty', function () {
      expect($('.banana').prev()).toHaveLength(0);
    });

    it('() : should operate over all elements in the selection', function () {
      expect($('.orange, .pear', food).prev()).toHaveLength(2);
    });

    describe('(selector) :', function () {
      it('should reject elements that violate the filter', function () {
        expect($('.orange').prev('.non-existent')).toHaveLength(0);
      });

      it('should accept elements that satisify the filter', function () {
        expect($('.orange').prev('.apple')).toHaveLength(1);
      });
    });
  });

  describe('.prevAll', function () {
    it('() : should return all preceding siblings', function () {
      var elems = $('.pear').prevAll();
      expect(elems).toHaveLength(2);
      expect(elems[0].attribs['class']).toBe('orange');
      expect(elems[1].attribs['class']).toBe('apple');
    });

    it('(no prev) : should return empty for first child', function () {
      expect($('.apple').prevAll()).toHaveLength(0);
    });

    it('(prevAll on empty object) : should return empty', function () {
      expect($('.banana').prevAll()).toHaveLength(0);
    });

    it('() : should operate over all elements in the selection', function () {
      expect($('.orange, .sweetcorn', food).prevAll()).toHaveLength(2);
    });

    it('() : should not contain duplicate elements', function () {
      var elems = $('.orange, .pear', food);
      expect(elems.prevAll()).toHaveLength(2);
    });

    describe('(selector) :', function () {
      it('should filter returned elements', function () {
        var elems = $('.pear').prevAll('.apple');
        expect(elems).toHaveLength(1);
      });

      it("should not consider siblings's descendents", function () {
        var elems = $('#vegetables', food).prevAll('li');
        expect(elems).toHaveLength(0);
      });
    });
  });

  describe('.prevUntil', function () {
    it('() : should return all preceding siblings if no selector specified', function () {
      var elems = $('.pear').prevUntil();
      expect(elems).toHaveLength(2);
      expect(elems[0].attribs['class']).toBe('orange');
      expect(elems[1].attribs['class']).toBe('apple');
    });

    it('() : should filter out non-element nodes', function () {
      var elems = $(
        '<div class="1"><div class="2"></div><!-- comment -->text<div class="3"></div></div>'
      );
      var div = elems.children().last();
      expect(div.prevUntil()).toHaveLength(1);
    });

    it('() : should operate over all elements in the selection', function () {
      var elems = $('.pear, .sweetcorn', food);
      expect(elems.prevUntil()).toHaveLength(3);
    });

    it('() : should not contain duplicate elements', function () {
      var elems = $('.orange, .pear', food);
      expect(elems.prevUntil()).toHaveLength(2);
    });

    it('(selector) : should return all preceding siblings until selector', function () {
      var elems = $('.pear').prevUntil('.apple');
      expect(elems).toHaveLength(1);
      expect(elems[0].attribs['class']).toBe('orange');
    });

    it('(selector not sibling) : should return all preceding siblings', function () {
      var elems = $('.sweetcorn', food).prevUntil('#fruits');
      expect(elems).toHaveLength(1);
      expect(elems[0].attribs['class']).toBe('carrot');
    });

    it('(selector, filterString) : should return all preceding siblings until selector, filtered by filter', function () {
      var elems = $('.cider', drinks).prevUntil('.juice', '.water');
      expect(elems).toHaveLength(1);
      expect(elems[0].attribs['class']).toBe('water');
    });

    it('(selector, filterString) : should return all preceding siblings until selector', function () {
      var elems = $('<ul><li><p></p></li><li></li></ul>');
      var empty = elems.find('li').eq(1).prevUntil(null, 'p');
      expect(empty).toHaveLength(0);
    });

    it('() : should return an empty object for first child', function () {
      expect($('.apple').prevUntil()).toHaveLength(0);
    });

    it('() : should return an empty object when called on an empty object', function () {
      expect($('.banana').prevUntil()).toHaveLength(0);
    });

    it('(node) : should return all previous siblings until the node', function () {
      var $fruits = $('#fruits').children();
      var elems = $fruits.eq(2).prevUntil($fruits[0]);
      expect(elems).toHaveLength(1);
    });

    it('(cheerio object) : should return all previous siblings until any member of the cheerio object', function () {
      var $drinks = $(drinks).children();
      var $until = $([$drinks[0], $drinks[1]]);
      var elems = $drinks.eq(4).prevUntil($until);
      expect(elems).toHaveLength(2);
    });
  });

  describe('.siblings', function () {
    it('() : should get all the siblings', function () {
      expect($('.orange').siblings()).toHaveLength(2);
      expect($('#fruits').siblings()).toHaveLength(0);
      expect($('.apple, .carrot', food).siblings()).toHaveLength(3);
    });

    it('(selector) : should get all siblings that match the selector', function () {
      expect($('.orange').siblings('.apple')).toHaveLength(1);
      expect($('.orange').siblings('.peach')).toHaveLength(0);
    });

    it('(selector) : should throw an Error if given an invalid selector', function () {
      expect(function () {
        $('.orange').siblings(':bah');
      }).toThrow('unmatched pseudo-class');
    });

    it('(selector) : does not consider the contents of siblings when filtering (GH-374)', function () {
      expect($('#fruits', food).siblings('li')).toHaveLength(0);
    });
  });

  describe('.parents', function () {
    beforeEach(function () {
      $ = cheerio.load(food);
    });

    it('() : should get all of the parents in logical order', function () {
      var result = $('.orange').parents();
      expect(result).toHaveLength(4);
      expect(result[0].attribs.id).toBe('fruits');
      expect(result[1].attribs.id).toBe('food');
      expect(result[2].tagName).toBe('body');
      expect(result[3].tagName).toBe('html');
      result = $('#fruits').parents();
      expect(result).toHaveLength(3);
      expect(result[0].attribs.id).toBe('food');
      expect(result[1].tagName).toBe('body');
      expect(result[2].tagName).toBe('html');
    });

    it('(selector) : should get all of the parents that match the selector in logical order', function () {
      var result = $('.orange').parents('#fruits');
      expect(result).toHaveLength(1);
      expect(result[0].attribs.id).toBe('fruits');
      result = $('.orange').parents('ul');
      expect(result).toHaveLength(2);
      expect(result[0].attribs.id).toBe('fruits');
      expect(result[1].attribs.id).toBe('food');
    });

    it('() : should not break if the selector does not have any results', function () {
      var result = $('.saladbar').parents();
      expect(result).toHaveLength(0);
    });

    it('() : should return an empty set for top-level elements', function () {
      var result = $('html').parents();
      expect(result).toHaveLength(0);
    });

    it('() : should return the parents of every element in the *reveresed* collection, omitting duplicates', function () {
      var $parents = $('li').parents();

      expect($parents).toHaveLength(5);
      expect($parents[0]).toBe($('#vegetables')[0]);
      expect($parents[1]).toBe($('#food')[0]);
      expect($parents[2]).toBe($('body')[0]);
      expect($parents[3]).toBe($('html')[0]);
      expect($parents[4]).toBe($('#fruits')[0]);
    });
  });

  describe('.parentsUntil', function () {
    beforeEach(function () {
      $ = cheerio.load(food);
    });

    it('() : should get all of the parents in logical order', function () {
      var result = $('.orange').parentsUntil();
      expect(result).toHaveLength(4);
      expect(result[0].attribs.id).toBe('fruits');
      expect(result[1].attribs.id).toBe('food');
      expect(result[2].tagName).toBe('body');
      expect(result[3].tagName).toBe('html');
    });

    it('() : should get all of the parents in reversed order, omitting duplicates', function () {
      var result = $('.apple, .sweetcorn').parentsUntil();
      expect(result).toHaveLength(5);
      expect(result[0].attribs.id).toBe('vegetables');
      expect(result[1].attribs.id).toBe('food');
      expect(result[2].tagName).toBe('body');
      expect(result[3].tagName).toBe('html');
      expect(result[4].attribs.id).toBe('fruits');
    });

    it('(selector) : should get all of the parents until selector', function () {
      var result = $('.orange').parentsUntil('#food');
      expect(result).toHaveLength(1);
      expect(result[0].attribs.id).toBe('fruits');
      result = $('.orange').parentsUntil('#fruits');
      expect(result).toHaveLength(0);
    });

    it('(selector) : Less simple parentsUntil check with selector', function () {
      var result = $('#fruits').parentsUntil('html, body');
      expect(result.eq(0).attr('id')).toBe('food');
    });

    it('(selector not parent) : should return all parents', function () {
      var result = $('.orange').parentsUntil('.apple');
      expect(result).toHaveLength(4);
      expect(result[0].attribs.id).toBe('fruits');
      expect(result[1].attribs.id).toBe('food');
      expect(result[2].tagName).toBe('body');
      expect(result[3].tagName).toBe('html');
    });

    it('(selector, filter) : should get all of the parents that match the filter', function () {
      var result = $('.apple, .sweetcorn').parentsUntil(
        '.saladbar',
        '#vegetables'
      );
      expect(result).toHaveLength(1);
      expect(result[0].attribs.id).toBe('vegetables');
    });

    it('(selector, filter) : Multiple-filtered parentsUntil check', function () {
      var result = $('.orange').parentsUntil('html', 'ul,body');
      expect(result).toHaveLength(3);
      expect(result.eq(0).prop('tagName')).toBe('BODY');
      expect(result.eq(1).attr('id')).toBe('food');
      expect(result.eq(2).attr('id')).toBe('fruits');
    });

    it('() : should return empty object when called on an empty object', function () {
      var result = $('.saladbar').parentsUntil();
      expect(result).toHaveLength(0);
    });

    it('() : should return an empty set for top-level elements', function () {
      var result = $('html').parentsUntil();
      expect(result).toHaveLength(0);
    });

    it('(cheerio object) : should return all parents until any member of the cheerio object', function () {
      var $fruits = $('#fruits');
      var $until = $('#food');
      var result = $fruits.children().eq(1).parentsUntil($until);
      expect(result).toHaveLength(1);
      expect(result[0].attribs.id).toBe('fruits');
    });

    it('(cheerio object) : should return all parents until body element', function () {
      var body = $('body')[0];
      var result = $('.carrot').parentsUntil(body);
      expect(result).toHaveLength(2);
      expect(result.eq(0).is('ul#vegetables')).toBe(true);
    });
  });

  describe('.parent', function () {
    it('() : should return the parent of each matched element', function () {
      var result = $('.orange').parent();
      expect(result).toHaveLength(1);
      expect(result[0].attribs.id).toBe('fruits');
      result = $('li', food).parent();
      expect(result).toHaveLength(2);
      expect(result[0].attribs.id).toBe('fruits');
      expect(result[1].attribs.id).toBe('vegetables');
    });

    it('(undefined) : should not throw an exception', function () {
      expect(function () {
        $('li').parent(undefined);
      }).not.toThrow();
    });

    it('() : should return an empty object for top-level elements', function () {
      var result = $('html').parent();
      expect(result).toHaveLength(0);
    });

    it('() : should not contain duplicate elements', function () {
      var result = $('li').parent();
      expect(result).toHaveLength(1);
    });

    it('(selector) : should filter the matched parent elements by the selector', function () {
      var result = $('.orange').parent();
      expect(result).toHaveLength(1);
      expect(result[0].attribs.id).toBe('fruits');
      result = $('li', food).parent('#fruits');
      expect(result).toHaveLength(1);
      expect(result[0].attribs.id).toBe('fruits');
    });
  });

  describe('.closest', function () {
    it('() : should return an empty array', function () {
      var result = $('.orange').closest();
      expect(result).toHaveLength(0);
      expect(result).toBeInstanceOf(cheerio);
    });

    it('(selector) : should find the closest element that matches the selector, searching through its ancestors and itself', function () {
      expect($('.orange').closest('.apple')).toHaveLength(0);
      var result = $('.orange', food).closest('#food');
      expect(result[0].attribs.id).toBe('food');
      result = $('.orange', food).closest('ul');
      expect(result[0].attribs.id).toBe('fruits');
      result = $('.orange', food).closest('li');
      expect(result[0].attribs['class']).toBe('orange');
    });

    it('(selector) : should find the closest element of each item, removing duplicates', function () {
      var result = $('li', food).closest('ul');
      expect(result).toHaveLength(2);
    });

    it('() : should not break if the selector does not have any results', function () {
      var result = $('.saladbar', food).closest('ul');
      expect(result).toHaveLength(0);
    });
  });

  describe('.each', function () {
    it('( (i, elem) -> ) : should loop selected returning fn with (i, elem)', function () {
      var items = [];
      var classes = ['apple', 'orange', 'pear'];
      $('li').each(function (idx, elem) {
        items[idx] = elem;
        expect(this.attribs['class']).toBe(classes[idx]);
      });
      expect(items[0].attribs['class']).toBe('apple');
      expect(items[1].attribs['class']).toBe('orange');
      expect(items[2].attribs['class']).toBe('pear');
    });

    it('( (i, elem) -> ) : should break iteration when the iterator function returns false', function () {
      var iterationCount = 0;
      $('li').each(function (idx) {
        iterationCount++;
        return idx < 1;
      });

      expect(iterationCount).toBe(2);
    });
  });

  if (typeof Symbol !== 'undefined') {
    describe('[Symbol.iterator]', function () {
      it('should yield each element', function () {
        // The equivalent of: for (const element of $('li')) ...
        var $li = $('li');
        var iterator = $li[Symbol.iterator]();
        expect(iterator.next().value.attribs['class']).toBe('apple');
        expect(iterator.next().value.attribs['class']).toBe('orange');
        expect(iterator.next().value.attribs['class']).toBe('pear');
        expect(iterator.next().done).toBe(true);
      });
    });
  }

  describe('.map', function () {
    it('(fn) : should be invoked with the correct arguments and context', function () {
      var $fruits = $('li');
      var args = [];
      var thisVals = [];

      $fruits.map(function () {
        args.push(Array.prototype.slice.call(arguments));
        thisVals.push(this);
        return;
      });

      expect(args).toStrictEqual([
        [0, $fruits[0]],
        [1, $fruits[1]],
        [2, $fruits[2]],
      ]);
      expect(thisVals).toStrictEqual([$fruits[0], $fruits[1], $fruits[2]]);
    });

    it('(fn) : should return an Cheerio object wrapping the returned items', function () {
      var $fruits = $('li');
      var $mapped = $fruits.map(function (i) {
        return $fruits[2 - i];
      });

      expect($mapped).toHaveLength(3);
      expect($mapped[0]).toBe($fruits[2]);
      expect($mapped[1]).toBe($fruits[1]);
      expect($mapped[2]).toBe($fruits[0]);
    });

    it('(fn) : should ignore `null` and `undefined` returned by iterator', function () {
      var $fruits = $('li');
      var retVals = [null, undefined, $fruits[1]];

      var $mapped = $fruits.map(function (i) {
        return retVals[i];
      });

      expect($mapped).toHaveLength(1);
      expect($mapped[0]).toBe($fruits[1]);
    });

    it('(fn) : should preform a shallow merge on arrays returned by iterator', function () {
      var $fruits = $('li');

      var $mapped = $fruits.map(function () {
        return [1, [3, 4]];
      });

      expect($mapped.get()).toStrictEqual([1, [3, 4], 1, [3, 4], 1, [3, 4]]);
    });

    it('(fn) : should tolerate `null` and `undefined` when flattening arrays returned by iterator', function () {
      var $fruits = $('li');

      var $mapped = $fruits.map(function () {
        return [null, undefined];
      });

      expect($mapped.get()).toStrictEqual([
        null,
        undefined,
        null,
        undefined,
        null,
        undefined,
      ]);
    });
  });

  describe('.filter', function () {
    it('(selector) : should reduce the set of matched elements to those that match the selector', function () {
      var pear = $('li').filter('.pear').text();
      expect(pear).toBe('Pear');
    });

    it('(selector) : should not consider nested elements', function () {
      var lis = $('#fruits').filter('li');
      expect(lis).toHaveLength(0);
    });

    it('(selection) : should reduce the set of matched elements to those that are contained in the provided selection', function () {
      var $fruits = $('li');
      var $pear = $fruits.filter('.pear, .apple');
      expect($fruits.filter($pear)).toHaveLength(2);
    });

    it('(element) : should reduce the set of matched elements to those that specified directly', function () {
      var $fruits = $('li');
      var pear = $fruits.filter('.pear')[0];
      expect($fruits.filter(pear)).toHaveLength(1);
    });

    it("(fn) : should reduce the set of matched elements to those that pass the function's test", function () {
      var orange = $('li')
        .filter(function (i, el) {
          expect(this).toBe(el);
          expect(el.tagName).toBe('li');
          expect(typeof i).toBe('number');
          return $(this).attr('class') === 'orange';
        })
        .text();

      expect(orange).toBe('Orange');
    });
  });

  describe('.not', function () {
    it('(selector) : should reduce the set of matched elements to those that do not match the selector', function () {
      var $fruits = $('li');

      var $notPear = $fruits.not('.pear');

      expect($notPear).toHaveLength(2);
      expect($notPear[0]).toBe($fruits[0]);
      expect($notPear[1]).toBe($fruits[1]);
    });

    it('(selector) : should not consider nested elements', function () {
      var lis = $('#fruits').not('li');
      expect(lis).toHaveLength(1);
    });

    it('(selection) : should reduce the set of matched elements to those that are mot contained in the provided selection', function () {
      var $fruits = $('li');
      var $orange = $('.orange');

      var $notOrange = $fruits.not($orange);

      expect($notOrange).toHaveLength(2);
      expect($notOrange[0]).toBe($fruits[0]);
      expect($notOrange[1]).toBe($fruits[2]);
    });

    it('(element) : should reduce the set of matched elements to those that specified directly', function () {
      var $fruits = $('li');
      var apple = $('.apple')[0];

      var $notApple = $fruits.not(apple);

      expect($notApple).toHaveLength(2);
      expect($notApple[0]).toBe($fruits[1]);
      expect($notApple[1]).toBe($fruits[2]);
    });

    it("(fn) : should reduce the set of matched elements to those that do not pass the function's test", function () {
      var $fruits = $('li');

      var $notOrange = $fruits.not(function (i, el) {
        expect(this).toBe(el);
        expect(el.name).toBe('li');
        expect(typeof i).toBe('number');
        return $(this).attr('class') === 'orange';
      });

      expect($notOrange).toHaveLength(2);
      expect($notOrange[0]).toBe($fruits[0]);
      expect($notOrange[1]).toBe($fruits[2]);
    });
  });

  describe('.has', function () {
    beforeEach(function () {
      $ = cheerio.load(food);
    });

    it('(selector) : should reduce the set of matched elements to those with descendants that match the selector', function () {
      var $fruits = $('#fruits,#vegetables').has('.pear');
      expect($fruits).toHaveLength(1);
      expect($fruits[0]).toBe($('#fruits')[0]);
    });

    it('(selector) : should only consider nested elements', function () {
      var $empty = $('#fruits').has('#fruits');
      expect($empty).toHaveLength(0);
    });

    it('(element) : should reduce the set of matched elements to those that are ancestors of the provided element', function () {
      var $fruits = $('#fruits,#vegetables').has($('.pear')[0]);
      expect($fruits).toHaveLength(1);
      expect($fruits[0]).toBe($('#fruits')[0]);
    });

    it('(element) : should only consider nested elements', function () {
      var $fruits = $('#fruits');
      var fruitsEl = $fruits[0];
      var $empty = $fruits.has(fruitsEl);

      expect($empty).toHaveLength(0);
    });
  });

  describe('.first', function () {
    it('() : should return the first item', function () {
      var $src = $('<span>foo</span><span>bar</span><span>baz</span>');
      var $elem = $src.first();
      expect($elem.length).toBe(1);
      expect($elem[0].childNodes[0].data).toBe('foo');
    });

    it('() : should return an empty object for an empty object', function () {
      var $src = $();
      var $first = $src.first();
      expect($first.length).toBe(0);
      expect($first[0]).toBeUndefined();
    });
  });

  describe('.last', function () {
    it('() : should return the last element', function () {
      var $src = $('<span>foo</span><span>bar</span><span>baz</span>');
      var $elem = $src.last();
      expect($elem.length).toBe(1);
      expect($elem[0].childNodes[0].data).toBe('baz');
    });

    it('() : should return an empty object for an empty object', function () {
      var $src = $();
      var $last = $src.last();
      expect($last.length).toBe(0);
      expect($last[0]).toBeUndefined();
    });
  });

  describe('.first & .last', function () {
    it('() : should return equivalent collections if only one element', function () {
      var $src = $('<span>bar</span>');
      var $first = $src.first();
      var $last = $src.last();
      expect($first.length).toBe(1);
      expect($first[0].childNodes[0].data).toBe('bar');
      expect($last.length).toBe(1);
      expect($last[0].childNodes[0].data).toBe('bar');
      expect($first[0]).toBe($last[0]);
    });
  });

  describe('.eq', function () {
    function getText(el) {
      if (!el.length) return '';
      return el[0].childNodes[0].data;
    }

    it('(i) : should return the element at the specified index', function () {
      expect(getText($('li').eq(0))).toBe('Apple');
      expect(getText($('li').eq(1))).toBe('Orange');
      expect(getText($('li').eq(2))).toBe('Pear');
      expect(getText($('li').eq(3))).toBe('');
      expect(getText($('li').eq(-1))).toBe('Pear');
    });
  });

  describe('.get', function () {
    it('(i) : should return the element at the specified index', function () {
      var children = $('#fruits').children();
      expect(children.get(0)).toBe(children[0]);
      expect(children.get(1)).toBe(children[1]);
      expect(children.get(2)).toBe(children[2]);
    });

    it('(-1) : should return the element indexed from the end of the collection', function () {
      var children = $('#fruits').children();
      expect(children.get(-1)).toBe(children[2]);
      expect(children.get(-2)).toBe(children[1]);
      expect(children.get(-3)).toBe(children[0]);
    });

    it('() : should return an array containing all of the collection', function () {
      var children = $('#fruits').children();
      var all = children.get();
      expect(Array.isArray(all)).toBe(true);
      expect(all).toStrictEqual([children[0], children[1], children[2]]);
    });
  });

  describe('.index', function () {
    describe('() :', function () {
      it('returns the index of a child amongst its siblings', function () {
        expect($('.orange').index()).toBe(1);
      });
      it('returns -1 when the selection has no parent', function () {
        expect($('<div/>').index()).toBe(-1);
      });
    });

    describe('(selector) :', function () {
      it('returns the index of the first element in the set matched by `selector`', function () {
        expect($('.apple').index('#fruits, li')).toBe(1);
      });
      it('returns -1 when the item is not present in the set matched by `selector`', function () {
        expect($('.apple').index('#fuits')).toBe(-1);
      });
      it('returns -1 when the first element in the set has no parent', function () {
        expect($('<div/>').index('*')).toBe(-1);
      });
    });

    describe('(node) :', function () {
      it('returns the index of the given node within the current selection', function () {
        var $lis = $('li');
        expect($lis.index($lis.get(1))).toBe(1);
      });
      it('returns the index of the given node within the current selection when the current selection has no parent', function () {
        var $apple = $('.apple').remove();

        expect($apple.index($apple.get(0))).toBe(0);
      });
      it('returns -1 when the given node is not present in the current selection', function () {
        expect($('li').index($('#fruits').get(0))).toBe(-1);
      });
      it('returns -1 when the current selection is empty', function () {
        expect($('.not-fruit').index($('#fruits').get(0))).toBe(-1);
      });
    });

    describe('(selection) :', function () {
      it('returns the index of the first node in the provided selection within the current selection', function () {
        var $lis = $('li');
        expect($lis.index($('.orange, .pear'))).toBe(1);
      });
      it('returns -1 when the given node is not present in the current selection', function () {
        expect($('li').index($('#fruits'))).toBe(-1);
      });
      it('returns -1 when the current selection is empty', function () {
        expect($('.not-fruit').index($('#fruits'))).toBe(-1);
      });
    });
  });

  describe('.slice', function () {
    function getText(el) {
      if (!el.length) return '';
      return el[0].childNodes[0].data;
    }

    it('(start) : should return all elements after the given index', function () {
      var sliced = $('li').slice(1);
      expect(sliced).toHaveLength(2);
      expect(getText(sliced.eq(0))).toBe('Orange');
      expect(getText(sliced.eq(1))).toBe('Pear');
    });

    it('(start, end) : should return all elements matching the given range', function () {
      var sliced = $('li').slice(1, 2);
      expect(sliced).toHaveLength(1);
      expect(getText(sliced.eq(0))).toBe('Orange');
    });

    it('(-start) : should return element matching the offset from the end', function () {
      var sliced = $('li').slice(-1);
      expect(sliced).toHaveLength(1);
      expect(getText(sliced.eq(0))).toBe('Pear');
    });
  });

  describe('.end() :', function () {
    var $fruits;

    beforeEach(function () {
      $fruits = $('#fruits').children();
    });

    it('returns an empty object at the end of the chain', function () {
      expect($fruits.end().end().end()).toBeTruthy();
      expect($fruits.end().end().end()).toHaveLength(0);
    });
    it('find', function () {
      expect($fruits.find('.apple').end()).toBe($fruits);
    });
    it('filter', function () {
      expect($fruits.filter('.apple').end()).toBe($fruits);
    });
    it('map', function () {
      expect(
        $fruits
          .map(function () {
            return this;
          })
          .end()
      ).toBe($fruits);
    });
    it('contents', function () {
      expect($fruits.contents().end()).toBe($fruits);
    });
    it('eq', function () {
      expect($fruits.eq(1).end()).toBe($fruits);
    });
    it('first', function () {
      expect($fruits.first().end()).toBe($fruits);
    });
    it('last', function () {
      expect($fruits.last().end()).toBe($fruits);
    });
    it('slice', function () {
      expect($fruits.slice(1).end()).toBe($fruits);
    });
    it('children', function () {
      expect($fruits.children().end()).toBe($fruits);
    });
    it('parent', function () {
      expect($fruits.parent().end()).toBe($fruits);
    });
    it('parents', function () {
      expect($fruits.parents().end()).toBe($fruits);
    });
    it('closest', function () {
      expect($fruits.closest('ul').end()).toBe($fruits);
    });
    it('siblings', function () {
      expect($fruits.siblings().end()).toBe($fruits);
    });
    it('next', function () {
      expect($fruits.next().end()).toBe($fruits);
    });
    it('nextAll', function () {
      expect($fruits.nextAll().end()).toBe($fruits);
    });
    it('prev', function () {
      expect($fruits.prev().end()).toBe($fruits);
    });
    it('prevAll', function () {
      expect($fruits.prevAll().end()).toBe($fruits);
    });
    it('clone', function () {
      expect($fruits.clone().end()).toBe($fruits);
    });
  });

  describe('.add', function () {
    var $fruits;
    var $apple;
    var $orange;
    var $pear;
    var $carrot;
    var $sweetcorn;

    beforeEach(function () {
      $ = cheerio.load(food);
      $fruits = $('#fruits');
      $apple = $('.apple');
      $orange = $('.orange');
      $pear = $('.pear');
      $carrot = $('.carrot');
      $sweetcorn = $('.sweetcorn');
    });

    describe('(selector', function () {
      describe(') :', function () {
        describe('matched element', function () {
          it('occurs before current selection', function () {
            var $selection = $orange.add('.apple');

            expect($selection).toHaveLength(2);
            expect($selection[0]).toBe($apple[0]);
            expect($selection[1]).toBe($orange[0]);
          });
          it('is identical to the current selection', function () {
            var $selection = $orange.add('.orange');

            expect($selection).toHaveLength(1);
            expect($selection[0]).toBe($orange[0]);
          });
          it('occurs after current selection', function () {
            var $selection = $orange.add('.pear');

            expect($selection).toHaveLength(2);
            expect($selection[0]).toBe($orange[0]);
            expect($selection[1]).toBe($pear[0]);
          });
          it('contains the current selection', function () {
            var $selection = $orange.add('#fruits');

            expect($selection).toHaveLength(2);
            expect($selection[0]).toBe($fruits[0]);
            expect($selection[1]).toBe($orange[0]);
          });
          it('is a child of the current selection', function () {
            var $selection = $fruits.add('.orange');

            expect($selection).toHaveLength(2);
            expect($selection[0]).toBe($fruits[0]);
            expect($selection[1]).toBe($orange[0]);
          });
        });
        describe('matched elements', function () {
          it('occur before the current selection', function () {
            var $selection = $pear.add('.apple, .orange');

            expect($selection).toHaveLength(3);
            expect($selection[0]).toBe($apple[0]);
            expect($selection[1]).toBe($orange[0]);
            expect($selection[2]).toBe($pear[0]);
          });
          it('include the current selection', function () {
            var $selection = $pear.add('#fruits li');

            expect($selection).toHaveLength(3);
            expect($selection[0]).toBe($apple[0]);
            expect($selection[1]).toBe($orange[0]);
            expect($selection[2]).toBe($pear[0]);
          });
          it('occur after the current selection', function () {
            var $selection = $apple.add('.orange, .pear');

            expect($selection).toHaveLength(3);
            expect($selection[0]).toBe($apple[0]);
            expect($selection[1]).toBe($orange[0]);
            expect($selection[2]).toBe($pear[0]);
          });
          it('occur within the current selection', function () {
            var $selection = $fruits.add('#fruits li');

            expect($selection).toHaveLength(4);
            expect($selection[0]).toBe($fruits[0]);
            expect($selection[1]).toBe($apple[0]);
            expect($selection[2]).toBe($orange[0]);
            expect($selection[3]).toBe($pear[0]);
          });
        });
      });
      it(', context)', function () {
        var $selection = $fruits.add('li', '#vegetables');
        expect($selection).toHaveLength(3);
        expect($selection[0]).toBe($fruits[0]);
        expect($selection[1]).toBe($carrot[0]);
        expect($selection[2]).toBe($sweetcorn[0]);
      });
    });

    describe('(element) :', function () {
      describe('honors document order when element occurs', function () {
        it('before the current selection', function () {
          var $selection = $orange.add($apple[0]);

          expect($selection).toHaveLength(2);
          expect($selection[0]).toBe($apple[0]);
          expect($selection[1]).toBe($orange[0]);
        });
        it('after the current selection', function () {
          var $selection = $orange.add($pear[0]);

          expect($selection).toHaveLength(2);
          expect($selection[0]).toBe($orange[0]);
          expect($selection[1]).toBe($pear[0]);
        });
        it('within the current selection', function () {
          var $selection = $fruits.add($orange[0]);

          expect($selection).toHaveLength(2);
          expect($selection[0]).toBe($fruits[0]);
          expect($selection[1]).toBe($orange[0]);
        });
        it('as an ancestor of the current selection', function () {
          var $selection = $orange.add($fruits[0]);

          expect($selection).toHaveLength(2);
          expect($selection[0]).toBe($fruits[0]);
          expect($selection[1]).toBe($orange[0]);
        });
      });
      it('does not insert an element already contained within the current selection', function () {
        var $selection = $apple.add($apple[0]);

        expect($selection).toHaveLength(1);
        expect($selection[0]).toBe($apple[0]);
      });
    });
    describe('([elements]) : elements', function () {
      it('occur before the current selection', function () {
        var $selection = $pear.add($('.apple, .orange').get());

        expect($selection).toHaveLength(3);
        expect($selection[0]).toBe($apple[0]);
        expect($selection[1]).toBe($orange[0]);
        expect($selection[2]).toBe($pear[0]);
      });
      it('include the current selection', function () {
        var $selection = $pear.add($('#fruits li').get());

        expect($selection).toHaveLength(3);
        expect($selection[0]).toBe($apple[0]);
        expect($selection[1]).toBe($orange[0]);
        expect($selection[2]).toBe($pear[0]);
      });
      it('occur after the current selection', function () {
        var $selection = $apple.add($('.orange, .pear').get());

        expect($selection).toHaveLength(3);
        expect($selection[0]).toBe($apple[0]);
        expect($selection[1]).toBe($orange[0]);
        expect($selection[2]).toBe($pear[0]);
      });
      it('occur within the current selection', function () {
        var $selection = $fruits.add($('#fruits li').get());

        expect($selection).toHaveLength(4);
        expect($selection[0]).toBe($fruits[0]);
        expect($selection[1]).toBe($apple[0]);
        expect($selection[2]).toBe($orange[0]);
        expect($selection[3]).toBe($pear[0]);
      });
    });

    /**
     * Element order is undefined in this case, so it should not be asserted here.
     *
     * > If the collection consists of elements from different documents or ones
     * > not in any document, the sort order is undefined.
     *
     * @see {@link https://api.jquery.com/add/}
     */
    it('(html) : correctly parses and adds the new elements', function () {
      var $selection = $apple.add('<li class="banana">banana</li>');

      expect($selection).toHaveLength(2);
      expect($selection.is('.apple')).toBe(true);
      expect($selection.is('.banana')).toBe(true);
    });

    describe('(selection) :', function () {
      describe('element in selection', function () {
        it('occurs before current selection', function () {
          var $selection = $orange.add($('.apple'));

          expect($selection).toHaveLength(2);
          expect($selection[0]).toBe($apple[0]);
          expect($selection[1]).toBe($orange[0]);
        });
        it('is identical to the current selection', function () {
          var $selection = $orange.add($('.orange'));

          expect($selection).toHaveLength(1);
          expect($selection[0]).toBe($orange[0]);
        });
        it('occurs after current selection', function () {
          var $selection = $orange.add($('.pear'));

          expect($selection).toHaveLength(2);
          expect($selection[0]).toBe($orange[0]);
          expect($selection[1]).toBe($pear[0]);
        });
        it('contains the current selection', function () {
          var $selection = $orange.add($('#fruits'));

          expect($selection).toHaveLength(2);
          expect($selection[0]).toBe($fruits[0]);
          expect($selection[1]).toBe($orange[0]);
        });
        it('is a child of the current selection', function () {
          var $selection = $fruits.add($('.orange'));

          expect($selection).toHaveLength(2);
          expect($selection[0]).toBe($fruits[0]);
          expect($selection[1]).toBe($orange[0]);
        });
      });
      describe('elements in the selection', function () {
        it('occur before the current selection', function () {
          var $selection = $pear.add($('.apple, .orange'));

          expect($selection).toHaveLength(3);
          expect($selection[0]).toBe($apple[0]);
          expect($selection[1]).toBe($orange[0]);
          expect($selection[2]).toBe($pear[0]);
        });
        it('include the current selection', function () {
          var $selection = $pear.add($('#fruits li'));

          expect($selection).toHaveLength(3);
          expect($selection[0]).toBe($apple[0]);
          expect($selection[1]).toBe($orange[0]);
          expect($selection[2]).toBe($pear[0]);
        });
        it('occur after the current selection', function () {
          var $selection = $apple.add($('.orange, .pear'));

          expect($selection).toHaveLength(3);
          expect($selection[0]).toBe($apple[0]);
          expect($selection[1]).toBe($orange[0]);
          expect($selection[2]).toBe($pear[0]);
        });
        it('occur within the current selection', function () {
          var $selection = $fruits.add($('#fruits li'));

          expect($selection).toHaveLength(4);
          expect($selection[0]).toBe($fruits[0]);
          expect($selection[1]).toBe($apple[0]);
          expect($selection[2]).toBe($orange[0]);
          expect($selection[3]).toBe($pear[0]);
        });
      });

      it('modifying nested selections should not impact the parent [#834]', function () {
        var apple_pear = $apple.add($pear);

        // applies red to apple and pear
        apple_pear.addClass('red');

        expect($apple.hasClass('red')).toBe(true); // this is true
        expect($pear.hasClass('red')).toBe(true); // this is true

        // applies green to pear... AND should not affect apple
        $pear.addClass('green');
        expect($pear.hasClass('green')).toBe(true); //currently this is true
        expect($apple.hasClass('green')).toBe(false); // and this should be false!
      });
    });
  });

  describe('.addBack', function () {
    describe('() :', function () {
      it('includes siblings and self', function () {
        var $selection = $('.orange').siblings().addBack();

        expect($selection).toHaveLength(3);
        expect($selection[0]).toBe($('.apple')[0]);
        expect($selection[1]).toBe($('.orange')[0]);
        expect($selection[2]).toBe($('.pear')[0]);
      });
      it('includes children and self', function () {
        var $selection = $('#fruits').children().addBack();

        expect($selection).toHaveLength(4);
        expect($selection[0]).toBe($('#fruits')[0]);
        expect($selection[1]).toBe($('.apple')[0]);
        expect($selection[2]).toBe($('.orange')[0]);
        expect($selection[3]).toBe($('.pear')[0]);
      });
      it('includes parent and self', function () {
        var $selection = $('.apple').parent().addBack();

        expect($selection).toHaveLength(2);
        expect($selection[0]).toBe($('#fruits')[0]);
        expect($selection[1]).toBe($('.apple')[0]);
      });
      it('includes parents and self', function () {
        var q = cheerio.load(food);
        var $selection = q('.apple').parents().addBack();

        expect($selection).toHaveLength(5);
        expect($selection[0]).toBe(q('html')[0]);
        expect($selection[1]).toBe(q('body')[0]);
        expect($selection[2]).toBe(q('#food')[0]);
        expect($selection[3]).toBe(q('#fruits')[0]);
        expect($selection[4]).toBe(q('.apple')[0]);
      });
    });
    it('(filter) : filters the previous selection', function () {
      var $selection = $('li').eq(1).addBack('.apple');

      expect($selection).toHaveLength(2);
      expect($selection[0]).toBe($('.apple')[0]);
      expect($selection[1]).toBe($('.orange')[0]);
    });
  });
});
