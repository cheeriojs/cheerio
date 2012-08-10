var expect = require('expect.js'),
    $ = require('../'),
    fruits = require('./fixtures').fruits;

describe('$(...)', function() {

  describe('.find', function() {

    it('() : should return this', function() {
      expect($('ul', fruits).find()[0].name).to.equal('ul');
    });

    it('(single) : should find one descendant', function() {
      expect($('#fruits', fruits).find('.apple')[0].attribs['class']).to.equal('apple');
    });

    it('(many) : should find all matching descendant', function() {
      expect($('#fruits', fruits).find('li')).to.have.length(3);
    });

    it('(many) : should merge all selected elems with matching descendants');

    it('(invalid single) : should return empty if cant find', function() {
      expect($('ul', fruits).find('blah')).to.have.length(0);
    });

    it('should return empty if search already empty result', function() {
      expect($('#fruits').find('li')).to.have.length(0);
    });

  });

  describe('.children', function() {

    it('() : should get all children', function() {
      expect($('ul', fruits).children()).to.have.length(3);
    });

    it('(selector) : should return children matching selector', function() {
      expect($('ul', fruits).children('.orange').hasClass('orange')).to.be.ok();
    });

    it('(invalid selector) : should return empty', function() {
      expect($('ul', fruits).children('.lulz')).to.have.length(0);
    });

    it('should only match immediate children, not ancestors');

  });

  describe('.next', function() {

    it('() : should return next element', function() {
      expect($('.orange', fruits).next().hasClass('pear')).to.be.ok();
    });

    it('(no next) : should return null (?)');

  });

  describe('.prev', function() {

    it('() : should return previous element', function() {
      expect($('.orange', fruits).prev().hasClass('apple')).to.be.ok();
    });

    it('(no prev) : should return null (?)');

  });

  describe('.siblings', function() {

    it('() : should get all the siblings', function() {
      expect($('.orange', fruits).siblings()).to.have.length(2);
    });

    it('(selector) : should get all siblings that match the selector', function() {
      expect($('.orange', fruits).siblings('li')).to.have.length(2);
    });

  });

  describe('.each', function() {

    it('( (i, elem) -> ) : should loop selected returning fn with (i, elem)', function() {
      var items = [];
      $('li', fruits).each(function(idx, elem) {
        items[idx] = elem;
      });
      expect(items[0].attribs['class']).to.equal('apple');
      expect(items[1].attribs['class']).to.equal('orange');
      expect(items[2].attribs['class']).to.equal('pear');
    });

  });

  describe('.map', function() {
    it('(fn) : should return an array of mapped items', function() {
      var classes = $('li', fruits).map(function(i, el) {
        expect(this).to.be(el);
        expect(el.name).to.be('li');
        expect(i).to.be.a('number');

        return $(this).attr('class');
      }).join(', ');

      expect(classes).to.be('apple, orange, pear');
    });
  });

  describe('.first', function() {

    it('() : should return the first item', function() {
      var $src = $('<span>foo</span><span>bar</span><span>baz</span>');
      var $elem = $src.first();
      expect($elem.length).to.equal(1);
      expect($elem.html()).to.equal('foo');
    });

    it('() : should return an empty object for an empty object', function() {
      var $src = $();
      var $first = $src.first();
      expect($first.length).to.equal(0);
      expect($first.html()).to.be(null);
    });

  });

  describe('.last', function() {

    it('() : should return the last element', function() {
      var $src = $('<span>foo</span><span>bar</span><span>baz</span>');
      var $elem = $src.last();
      expect($elem.length).to.equal(1);
      expect($elem.html()).to.equal('baz');
    });

    it('() : should return an empty object for an empty object', function() {
      var $src = $();
      var $last = $src.last();
      expect($last.length).to.equal(0);
      expect($last.html()).to.be(null);
    });

  });

  describe('.first & .last', function() {

    it('() : should return equivalent collections if only one element', function() {
      var $src = $('<span>bar</span>');
      var $first = $src.first();
      var $last = $src.last();
      expect($first.length).to.equal(1);
      expect($first.html()).to.equal('bar');
      expect($last.length).to.equal(1);
      expect($last.html()).to.equal('bar');
      expect($first[0]).to.equal($last[0]);
    });

  });

  describe('.eq', function() {

    it('(i) : should return the element at the specified index', function() {
      expect($('li', fruits).eq(0).text()).to.equal('Apple');
      expect($('li', fruits).eq(1).text()).to.equal('Orange');
      expect($('li', fruits).eq(2).text()).to.equal('Pear');
      expect($('li', fruits).eq(3).text()).to.equal('');
      expect($('li', fruits).eq(-1).text()).to.equal('Pear');
    });

  });

});
