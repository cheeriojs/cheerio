var expect = require('expect.js'),
  $ = require('../'),
  food = require('./fixtures').food,
  fruits = require('./fixtures').fruits,
  drinks = require('./fixtures').drinks,
  text = require('./fixtures').text;

describe('$(...)', function() {

  describe('.find', function() {

    it('() : should find nothing', function() {
      expect($('ul', fruits).find()).to.have.length(0);
    });

    it('(single) : should find one descendant', function() {
      expect($('#fruits', fruits).find('.apple')[0].attribs['class']).to.equal('apple');
    });

    it('(many) : should find all matching descendant', function() {
      expect($('#fruits', fruits).find('li')).to.have.length(3);
    });

    it('(many) : should merge all selected elems with matching descendants', function() {
      expect($('#fruits, #food', food).find('.apple')).to.have.length(1);
    });

    it('(invalid single) : should return empty if cant find', function() {
      expect($('ul', fruits).find('blah')).to.have.length(0);
    });

    it('(invalid single) : should query descendants only', function() {
      expect($('#fruits', fruits).find('ul')).to.have.length(0);
    });

    it('should return empty if search already empty result', function() {
      expect($('#fruits').find('li')).to.have.length(0);
    });

    it('should lowercase selectors', function() {
      expect($('#fruits', fruits).find('LI')).to.have.length(3);
    });

    it('should query case-sensitively when in xmlMode', function() {
      var q = $.load('<caseSenSitive allTheWay>', {xmlMode: true});
      expect(q('caseSenSitive')).to.have.length(1);
      expect(q('[allTheWay]')).to.have.length(1);
      expect(q('casesensitive')).to.have.length(0);
      expect(q('[alltheway]')).to.have.length(0);
    });

    it('should throw a SyntaxError if given an invalid selector', function() {
      expect(function() {
        $('#fruits').find(':bah');
      }).to.throwException(function(err) {
        expect(err).to.be.a(SyntaxError);
      });
    });

  });

  describe('.children', function() {

    it('() : should get all children', function() {
      expect($('ul', fruits).children()).to.have.length(3);
    });

    it('() : should return children of all matched elements', function() {
      expect($('ul ul', food).children()).to.have.length(5);
    });

    it('(selector) : should return children matching selector', function() {
      var cls = $('ul', fruits).children('.orange')[0].attribs['class'];
      expect(cls).to.equal('orange');
    });

    it('(invalid selector) : should return empty', function() {
      expect($('ul', fruits).children('.lulz')).to.have.length(0);
    });

    it('should only match immediate children, not ancestors', function() {
      expect($(food).children('li')).to.have.length(0);
    });

  });

  describe('.contents', function() {

    it('() : should get all contents', function() {
      expect($('p', text).contents()).to.have.length(5);
    });

    it('() : should include text nodes', function() {
      expect($('p', text).contents().first()[0].type).to.equal('text');
    });

    it('() : should include comment nodes', function() {
      expect($('p', text).contents().last()[0].type).to.equal('comment');
    });

  });

  describe('.next', function() {

    it('() : should return next element', function() {
      var cls = $('.orange', fruits).next()[0].attribs['class'];
      expect(cls).to.equal('pear');
    });

    it('(no next) : should return empty for last child', function() {
      expect($('.pear', fruits).next()).to.have.length(0);
    });

    it('(next on empty object) : should return empty', function() {
      expect($('.banana', fruits).next()).to.have.length(0);
    });

    it('() : should operate over all elements in the selection', function() {
      expect($('.apple, .orange', food).next()).to.have.length(2);
    });

    describe('(selector) :', function() {
      it('should reject elements that violate the filter', function() {
        expect($('.apple', fruits).next('.non-existent')).to.have.length(0);
      });

      it('should accept elements that satisify the filter', function() {
        expect($('.apple', fruits).next('.orange')).to.have.length(1);
      });
    });

  });

  describe('.nextAll', function() {

    it('() : should return all following siblings', function() {
      var elems = $('.apple', fruits).nextAll();
      expect(elems).to.have.length(2);
      expect(elems[0].attribs['class']).to.equal('orange');
      expect(elems[1].attribs['class']).to.equal('pear');
    });

    it('(no next) : should return empty for last child', function() {
      expect($('.pear', fruits).nextAll()).to.have.length(0);
    });

    it('(nextAll on empty object) : should return empty', function() {
      expect($('.banana', fruits).nextAll()).to.have.length(0);
    });

    it('() : should operate over all elements in the selection', function() {
      expect($('.apple, .carrot', food).nextAll()).to.have.length(3);
    });

    it('() : should not contain duplicate elements', function() {
      var elems = $('.apple, .orange', food);
      expect(elems.nextAll()).to.have.length(2);
    });

    describe('(selector) :', function() {
      it('should filter according to the provided selector', function() {
        expect($('.apple', fruits).nextAll('.pear')).to.have.length(1);
      });

      it('should not consider siblings\' contents when filtering', function() {
        expect($('#fruits', food).nextAll('li')).to.have.length(0);
      });
    });

  });

  describe('.nextUntil', function() {

    it('() : should return all following siblings if no selector specified', function() {
      var elems = $('.apple', food).nextUntil();
      expect(elems).to.have.length(2);
      expect(elems[0].attribs['class']).to.equal('orange');
      expect(elems[1].attribs['class']).to.equal('pear');
    });

    it('() : should filter out non-element nodes', function() {
      var elems = $('<div><div></div><!-- comment -->text<div></div></div>');
      var div = elems.children().eq(0);
      expect(div.nextUntil()).to.have.length(1);
    });

    it('() : should operate over all elements in the selection', function() {
      var elems = $('.apple, .carrot', food);
      expect(elems.nextUntil()).to.have.length(3);
    });

    it('() : should not contain duplicate elements', function() {
      var elems = $('.apple, .orange', food);
      expect(elems.nextUntil()).to.have.length(2);
    });

    it('(selector) : should return all following siblings until selector', function() {
      var elems = $('.apple', food).nextUntil('.pear');
      expect(elems).to.have.length(1);
      expect(elems[0].attribs['class']).to.equal('orange');
    });

    it('(selector not sibling) : should return all following siblings', function() {
      var elems = $('.apple', fruits).nextUntil('#vegetables');
      expect(elems).to.have.length(2);
    });

    it('(selector, filterString) : should return all following siblings until selector, filtered by filter', function() {
      var elems = $('.beer', drinks).nextUntil('.water', '.milk');
      expect(elems).to.have.length(1);
      expect(elems[0].attribs['class']).to.equal('milk');
    });

    it('(null, filterString) : should return all following siblings until selector, filtered by filter', function() {
      var elems = $('<ul><li></li><li><p></p></li></ul>');
      var empty = elems.find('li').eq(0).nextUntil(null, 'p');
      expect(empty).to.have.length(0);
    });

    it('() : should return an empty object for last child', function() {
      expect($('.pear', fruits).nextUntil()).to.have.length(0);
    });

    it('() : should return an empty object when called on an empty object', function() {
      expect($('.banana', fruits).nextUntil()).to.have.length(0);
    });

    it('(node) : should return all following siblings until the node', function() {
      var $fruits = $(fruits).children();
      var elems = $fruits.eq(0).nextUntil($fruits[2]);
      expect(elems).to.have.length(1);
    });

    it('(cheerio object) : should return all following siblings until any member of the cheerio object', function() {
      var $drinks = $(drinks).children();
      var $until = $([$drinks[4], $drinks[3]]);
      var elems = $drinks.eq(0).nextUntil($until);
      expect(elems).to.have.length(2);
    });

  });

  describe('.prev', function() {

    it('() : should return previous element', function() {
      var cls = $('.orange', fruits).prev()[0].attribs['class'];
      expect(cls).to.equal('apple');
    });

    it('(no prev) : should return empty for first child', function() {
      expect($('.apple', fruits).prev()).to.have.length(0);
    });

    it('(prev on empty object) : should return empty', function() {
      expect($('.banana', fruits).prev()).to.have.length(0);
    });

    it('() : should operate over all elements in the selection', function() {
      expect($('.orange, .pear', food).prev()).to.have.length(2);
    });

    describe('(selector) :', function() {
      it('should reject elements that violate the filter', function() {
        expect($('.orange', fruits).prev('.non-existent')).to.have.length(0);
      });

      it('should accept elements that satisify the filter', function() {
        expect($('.orange', fruits).prev('.apple')).to.have.length(1);
      });
    });

  });

  describe('.prevAll', function() {

    it('() : should return all preceding siblings', function() {
      var elems = $('.pear', fruits).prevAll();
      expect(elems).to.have.length(2);
      expect(elems[0].attribs['class']).to.equal('orange');
      expect(elems[1].attribs['class']).to.equal('apple');
    });

    it('(no prev) : should return empty for first child', function() {
      expect($('.apple', fruits).prevAll()).to.have.length(0);
    });

    it('(prevAll on empty object) : should return empty', function() {
      expect($('.banana', fruits).prevAll()).to.have.length(0);
    });

    it('() : should operate over all elements in the selection', function() {
      expect($('.orange, .sweetcorn', food).prevAll()).to.have.length(2);
    });

    it('() : should not contain duplicate elements', function() {
      var elems = $('.orange, .pear', food);
      expect(elems.prevAll()).to.have.length(2);
    });

    describe('(selector) :', function() {
      it('should filter returned elements', function() {
        var elems = $('.pear', fruits).prevAll('.apple');
        expect(elems).to.have.length(1);
      });

      it('should not consider siblings\'s descendents', function() {
        var elems = $('#vegetables', food).prevAll('li');
        expect(elems).to.have.length(0);
      });
    });

  });

  describe('.prevUntil', function() {

    it('() : should return all preceding siblings if no selector specified', function() {
      var elems = $('.pear', fruits).prevUntil();
      expect(elems).to.have.length(2);
      expect(elems[0].attribs['class']).to.equal('orange');
      expect(elems[1].attribs['class']).to.equal('apple');
    });

    it('() : should filter out non-element nodes', function() {
      var elems = $('<div class="1"><div class="2"></div><!-- comment -->text<div class="3"></div></div>');
      var div = elems.children().last();
      expect(div.prevUntil()).to.have.length(1);
    });

    it('() : should operate over all elements in the selection', function() {
      var elems = $('.pear, .sweetcorn', food);
      expect(elems.prevUntil()).to.have.length(3);
    });

    it('() : should not contain duplicate elements', function() {
      var elems = $('.orange, .pear', food);
      expect(elems.prevUntil()).to.have.length(2);
    });

    it('(selector) : should return all preceding siblings until selector', function() {
      var elems = $('.pear', fruits).prevUntil('.apple');
      expect(elems).to.have.length(1);
      expect(elems[0].attribs['class']).to.equal('orange');
    });

    it('(selector not sibling) : should return all preceding siblings', function() {
      var elems = $('.sweetcorn', food).prevUntil('#fruits');
      expect(elems).to.have.length(1);
      expect(elems[0].attribs['class']).to.equal('carrot');
    });

    it('(selector, filterString) : should return all preceding siblings until selector, filtered by filter', function() {
      var elems = $('.cider', drinks).prevUntil('.juice', '.water');
      expect(elems).to.have.length(1);
      expect(elems[0].attribs['class']).to.equal('water');
    });

    it('(selector, filterString) : should return all preceding siblings until selector', function() {
      var elems = $('<ul><li><p></p></li><li></li></ul>');
      var empty = elems.find('li').eq(1).prevUntil(null, 'p');
      expect(empty).to.have.length(0);
    });

    it('() : should return an empty object for first child', function() {
      expect($('.apple', fruits).prevUntil()).to.have.length(0);
    });

    it('() : should return an empty object when called on an empty object', function() {
      expect($('.banana', fruits).prevUntil()).to.have.length(0);
    });

    it('(node) : should return all previous siblings until the node', function() {
      var $fruits = $(fruits).children();
      var elems = $fruits.eq(2).prevUntil($fruits[0]);
      expect(elems).to.have.length(1);
    });

    it('(cheerio object) : should return all previous siblings until any member of the cheerio object', function() {
      var $drinks = $(drinks).children();
      var $until = $([$drinks[0], $drinks[1]]);
      var elems = $drinks.eq(4).prevUntil($until);
      expect(elems).to.have.length(2);
    });

  });

  describe('.siblings', function() {

    it('() : should get all the siblings', function() {
      expect($('.orange', fruits).siblings()).to.have.length(2);
      expect($('#fruits', fruits).siblings()).to.have.length(0);
      expect($('.apple, .carrot', food).siblings()).to.have.length(3);
    });

    it('(selector) : should get all siblings that match the selector', function() {
      expect($('.orange', fruits).siblings('.apple')).to.have.length(1);
      expect($('.orange', fruits).siblings('.peach')).to.have.length(0);
    });

    it('(selector) : should throw a SyntaxError if given an invalid selector', function() {
      expect(function() {
        $('.orange', fruits).siblings(':bah');
      }).to.throwException(function(err) {
        expect(err).to.be.a(SyntaxError);
      });
    });

    it('(selector) : does not consider the contents of siblings when filtering (GH-374)', function() {
      expect($('#fruits', food).siblings('li')).to.have.length(0);
    });

  });

  describe('.parents', function() {

    it('() : should get all of the parents in logical order', function(){
      var result = $('.orange', food).parents();
      expect(result).to.have.length(2);
      expect(result[0].attribs.id).to.be('fruits');
      expect(result[1].attribs.id).to.be('food');
      result = $('#fruits', food).parents();
      expect(result).to.have.length(1);
      expect(result[0].attribs.id).to.be('food');
    });

    it('(selector) : should get all of the parents that match the selector in logical order', function() {
      var result = $('.orange', food).parents('#fruits');
      expect(result).to.have.length(1);
      expect(result[0].attribs.id).to.be('fruits');
      result = $('.orange', food).parents('ul');
      expect(result).to.have.length(2);
      expect(result[0].attribs.id).to.be('fruits');
      expect(result[1].attribs.id).to.be('food');
    });

    it('() : should not break if the selector does not have any results', function() {
      var result = $('.saladbar', food).parents();
      expect(result).to.have.length(0);
    });

    it('() : should return an empty set for top-level elements', function() {
      var result = $('#food', food).parents();
      expect(result).to.have.length(0);
    });

    it('() : should return the parents of every element in the *reveresed* collection, omitting duplicates', function() {
      var $food = $(food);
      var $parents = $food.find('li').parents();

      expect($parents).to.have.length(3);
      expect($parents[0]).to.be($food.find('#vegetables')[0]);
      expect($parents[1]).to.be($food[0]);
      expect($parents[2]).to.be($food.find('#fruits')[0]);
    });

  });

  describe('.parentsUntil', function() {

    it('() : should get all of the parents in logical order', function() {
      var result = $('.orange', food).parentsUntil();
      expect(result).to.have.length(2);
      expect(result[0].attribs.id).to.be('fruits');
      expect(result[1].attribs.id).to.be('food');
    });

    it('() : should get all of the parents in reversed order, omitting duplicates', function() {
      var result = $('.apple, .sweetcorn', food).parentsUntil();
      expect(result).to.have.length(3);
      expect(result[0].attribs.id).to.be('vegetables');
      expect(result[1].attribs.id).to.be('food');
      expect(result[2].attribs.id).to.be('fruits');
    });

    it('(selector) : should get all of the parents until selector', function() {
      var result = $('.orange', food).parentsUntil('#food');
      expect(result).to.have.length(1);
      expect(result[0].attribs.id).to.be('fruits');
      result = $('.orange', food).parentsUntil('#fruits');
      expect(result).to.have.length(0);
    });

    it('(selector not parent) : should return all parents', function() {
      var result = $('.orange', food).parentsUntil('.apple');
      expect(result).to.have.length(2);
      expect(result[0].attribs.id).to.be('fruits');
      expect(result[1].attribs.id).to.be('food');
    });

    it('(selector, filter) : should get all of the parents that match the filter', function() {
      var result = $('.apple, .sweetcorn', food).parentsUntil('.saladbar', '#vegetables');
      expect(result).to.have.length(1);
      expect(result[0].attribs.id).to.be('vegetables');
    });

    it('() : should return empty object when called on an empty object', function() {
      var result = $('.saladbar', food).parentsUntil();
      expect(result).to.have.length(0);
    });

    it('() : should return an empty set for top-level elements', function() {
      var result = $('#food', food).parentsUntil();
      expect(result).to.have.length(0);
    });

    it('(cheerio object) : should return all parents until any member of the cheerio object', function() {
      var $food = $(food);
      var $fruits = $(fruits);
      var $until = $($food[0]);
      var result = $fruits.children().eq(1).parentsUntil($until);
      expect(result).to.have.length(1);
      expect(result[0].attribs.id).to.be('fruits');
    });

  });

  describe('.parent', function() {

    it('() : should return the parent of each matched element', function() {
      var result = $('.orange', fruits).parent();
      expect(result).to.have.length(1);
      expect(result[0].attribs.id).to.be('fruits');
      result = $('li', food).parent();
      expect(result).to.have.length(2);
      expect(result[0].attribs.id).to.be('fruits');
      expect(result[1].attribs.id).to.be('vegetables');
    });

    it('() : should return an empty object for top-level elements', function() {
      var result = $('ul', fruits).parent();
      expect(result).to.have.length(0);
    });

    it('() : should not contain duplicate elements', function() {
      var result = $('li', fruits).parent();
      expect(result).to.have.length(1);
    });

    it('(selector) : should filter the matched parent elements by the selector', function() {
      var result = $('.orange', fruits).parent();
      expect(result).to.have.length(1);
      expect(result[0].attribs.id).to.be('fruits');
      result = $('li', food).parent('#fruits');
      expect(result).to.have.length(1);
      expect(result[0].attribs.id).to.be('fruits');
    });

  });

  describe('.closest', function() {

    it('() : should return an empty array', function() {
      var result = $('.orange', fruits).closest();
      expect(result).to.have.length(0);
      expect(result).to.be.a($);
    });

    it('(selector) : should find the closest element that matches the selector, searching through its ancestors and itself', function() {
      expect($('.orange', fruits).closest('.apple')).to.have.length(0);
      var result = $('.orange', food).closest('#food');
      expect(result[0].attribs.id).to.be('food');
      result = $('.orange', food).closest('ul');
      expect(result[0].attribs.id).to.be('fruits');
      result = $('.orange', food).closest('li');
      expect(result[0].attribs['class']).to.be('orange');
    });

    it('(selector) : should find the closest element of each item, removing duplicates', function() {
      var result = $('li', food).closest('ul');
      expect(result).to.have.length(2);
    });

    it('() : should not break if the selector does not have any results', function() {
      var result = $('.saladbar', food).closest('ul');
      expect(result).to.have.length(0);
    });

  });

  describe('.each', function() {

    it('( (i, elem) -> ) : should loop selected returning fn with (i, elem)', function() {
      var items = [],
          classes = ['apple', 'orange', 'pear'];
      $('li', fruits).each(function(idx, elem) {
        items[idx] = elem;
        expect(this.attribs['class']).to.equal(classes[idx]);
      });
      expect(items[0].attribs['class']).to.equal('apple');
      expect(items[1].attribs['class']).to.equal('orange');
      expect(items[2].attribs['class']).to.equal('pear');
    });

    it('( (i, elem) -> ) : should break iteration when the iterator function returns false', function() {
      var iterationCount = 0;
      $('li', fruits).each(function(idx, elem) {
        iterationCount++;
        return idx < 1;
      });

      expect(iterationCount).to.equal(2);
    });

  });

  describe('.map', function() {
    it('(fn) : should be invoked with the correct arguments and context', function() {
      var $fruits = $('li', fruits);
      var args = [];
      var thisVals = [];

      $fruits.map(function() {
        args.push(Array.prototype.slice.call(arguments));
        thisVals.push(this);
      });

      expect(args).to.eql([
        [0, $fruits[0]],
        [1, $fruits[1]],
        [2, $fruits[2]]
      ]);
      expect(thisVals).to.eql([
        $fruits[0],
        $fruits[1],
        $fruits[2]
      ]);
    });

    it('(fn) : should return an Cheerio object wrapping the returned items', function() {
      var $fruits = $('li', fruits);
      var $mapped = $fruits.map(function(i, el) {
        return $fruits[2 - i];
      });

      expect($mapped).to.have.length(3);
      expect($mapped[0]).to.be($fruits[2]);
      expect($mapped[1]).to.be($fruits[1]);
      expect($mapped[2]).to.be($fruits[0]);
    });

    it('(fn) : should ignore `null` and `undefined` returned by iterator', function() {
      var $fruits = $('li', fruits);
      var retVals = [null, undefined, $fruits[1]];

      var $mapped = $fruits.map(function(i, el) {
        return retVals[i];
      });

      expect($mapped).to.have.length(1);
      expect($mapped[0]).to.be($fruits[1]);
    });

    it('(fn) : should preform a shallow merge on arrays returned by iterator', function() {
      var $fruits = $('li', fruits);

      var $mapped = $fruits.map(function(i, el) {
        return [1, [3, 4]];
      });

      expect($mapped.get()).to.eql([
        1, [3, 4],
        1, [3, 4],
        1, [3, 4]
      ]);
    });

    it('(fn) : should tolerate `null` and `undefined` when flattening arrays returned by iterator', function() {
      var $fruits = $('li', fruits);

      var $mapped = $fruits.map(function(i, el) {
        return [null, undefined];
      });

      expect($mapped.get()).to.eql([
        null, undefined,
        null, undefined,
        null, undefined,
      ]);
    });
  });

  describe('.filter', function() {
    it('(selector) : should reduce the set of matched elements to those that match the selector', function() {
      var pear = $('li', fruits).filter('.pear').text();
      expect(pear).to.be('Pear');
    });

    it('(selector) : should not consider nested elements', function() {
      var lis = $(fruits).filter('li');
      expect(lis).to.have.length(0);
    });

    it('(selection) : should reduce the set of matched elements to those that are contained in the provided selection', function() {
      var $fruits = $('li', fruits);
      var $pear = $fruits.filter('.pear, .apple');
      expect($fruits.filter($pear)).to.have.length(2);
    });

    it('(element) : should reduce the set of matched elements to those that specified directly', function() {
      var $fruits = $('li', fruits);
      var pear = $fruits.filter('.pear')[0];
      expect($fruits.filter(pear)).to.have.length(1);
    });

    it('(fn) : should reduce the set of matched elements to those that pass the function\'s test', function() {
      var orange = $('li', fruits).filter(function(i, el) {
        expect(this).to.be(el);
        expect(el.name).to.be('li');
        expect(i).to.be.a('number');
        return $(this).attr('class') === 'orange';
      }).text();

      expect(orange).to.be('Orange');
    });
  });

  describe('.first', function() {

    it('() : should return the first item', function() {
      var $src = $('<span>foo</span><span>bar</span><span>baz</span>');
      var $elem = $src.first();
      expect($elem.length).to.equal(1);
      expect($elem[0].children[0].data).to.equal('foo');
    });

    it('() : should return an empty object for an empty object', function() {
      var $src = $();
      var $first = $src.first();
      expect($first.length).to.equal(0);
      expect($first[0]).to.be(undefined);
    });

  });

  describe('.last', function() {

    it('() : should return the last element', function() {
      var $src = $('<span>foo</span><span>bar</span><span>baz</span>');
      var $elem = $src.last();
      expect($elem.length).to.equal(1);
      expect($elem[0].children[0].data).to.equal('baz');
    });

    it('() : should return an empty object for an empty object', function() {
      var $src = $();
      var $last = $src.last();
      expect($last.length).to.equal(0);
      expect($last[0]).to.be(undefined);
    });

  });

  describe('.first & .last', function() {

    it('() : should return equivalent collections if only one element', function() {
      var $src = $('<span>bar</span>');
      var $first = $src.first();
      var $last = $src.last();
      expect($first.length).to.equal(1);
      expect($first[0].children[0].data).to.equal('bar');
      expect($last.length).to.equal(1);
      expect($last[0].children[0].data).to.equal('bar');
      expect($first[0]).to.equal($last[0]);
    });

  });

  describe('.eq', function() {

    function getText(el) {
      if(!el.length) return '';
      return el[0].children[0].data;
    }

    it('(i) : should return the element at the specified index', function() {
      expect(getText($('li', fruits).eq(0))).to.equal('Apple');
      expect(getText($('li', fruits).eq(1))).to.equal('Orange');
      expect(getText($('li', fruits).eq(2))).to.equal('Pear');
      expect(getText($('li', fruits).eq(3))).to.equal('');
      expect(getText($('li', fruits).eq(-1))).to.equal('Pear');
    });

  });

  describe('.get', function() {

    it('(i) : should return the element at the specified index', function() {
      var children = $(fruits).children();
      expect(children.get(0)).to.be(children[0]);
      expect(children.get(1)).to.be(children[1]);
      expect(children.get(2)).to.be(children[2]);
    });

    it('(-1) : should return the element indexed from the end of the collection', function() {
      var children = $(fruits).children();
      expect(children.get(-1)).to.be(children[2]);
      expect(children.get(-2)).to.be(children[1]);
      expect(children.get(-3)).to.be(children[0]);
    });

    it('() : should return an array containing all of the collection', function() {
      var children = $(fruits).children();
      var all = children.get();
      expect(Array.isArray(all)).to.be.ok();
      expect(all).to.eql([
        children[0],
        children[1],
        children[2]
      ]);
    });

  });

  describe('.slice', function() {

    function getText(el) {
      if(!el.length) return '';
      return el[0].children[0].data;
    }

    it('(start) : should return all elements after the given index', function() {
      var sliced = $('li', fruits).slice(1);
      expect(sliced).to.have.length(2);
      expect(getText(sliced.eq(0))).to.equal('Orange');
      expect(getText(sliced.eq(1))).to.equal('Pear');
    });

    it('(start, end) : should return all elements matching the given range', function() {
      var sliced = $('li', fruits).slice(1, 2);
      expect(sliced).to.have.length(1);
      expect(getText(sliced.eq(0))).to.equal('Orange');
    });

    it('(-start) : should return element matching the offset from the end', function() {
      var sliced = $('li', fruits).slice(-1);
      expect(sliced).to.have.length(1);
      expect(getText(sliced.eq(0))).to.equal('Pear');
    });

  });

  describe('.end() :', function() {
    var $fruits = $(fruits).children();

    it('returns an empty object at the end of the chain', function() {
      expect($fruits.end().end()).to.be.ok();
      expect($fruits.end().end()).to.have.length(0);
    });
    it('find', function() {
      expect($fruits.find('.apple').end()).to.be($fruits);
    });
    it('filter', function() {
      expect($fruits.filter('.apple').end()).to.be($fruits);
    });
    it('map', function() {
      expect($fruits.map(function() { return this; }).end()).to.be($fruits);
    });
    it('contents', function() {
      expect($fruits.contents().end()).to.be($fruits);
    });
    it('eq', function() {
      expect($fruits.eq(1).end()).to.be($fruits);
    });
    it('first', function() {
      expect($fruits.first().end()).to.be($fruits);
    });
    it('last', function() {
      expect($fruits.last().end()).to.be($fruits);
    });
    it('slice', function() {
      expect($fruits.slice(1).end()).to.be($fruits);
    });
    it('children', function() {
      expect($fruits.children().end()).to.be($fruits);
    });
    it('parent', function() {
      expect($fruits.parent().end()).to.be($fruits);
    });
    it('parents', function() {
      expect($fruits.parents().end()).to.be($fruits);
    });
    it('closest', function() {
      expect($fruits.closest('ul').end()).to.be($fruits);
    });
    it('siblings', function() {
      expect($fruits.siblings().end()).to.be($fruits);
    });
    it('next', function() {
      expect($fruits.next().end()).to.be($fruits);
    });
    it('nextAll', function() {
      expect($fruits.nextAll().end()).to.be($fruits);
    });
    it('prev', function() {
      expect($fruits.prev().end()).to.be($fruits);
    });
    it('prevAll', function() {
      expect($fruits.prevAll().end()).to.be($fruits);
    });
    it('clone', function() {
      expect($fruits.clone().end()).to.be($fruits);
    });
  });

});
