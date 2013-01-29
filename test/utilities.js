var expect = require('expect.js'),
    $ = require('../'),
    food = require('./fixtures').food;

describe('utility methods', function() {

  describe('.contains', function() {

    it('(container, contained) : should correctly detect the provided element', function() {
      var $food = $(food);
      var $fruits = $food.find('#fruits');
      var $apple = $fruits.find('.apple');

      expect($.contains($food[0], $fruits[0])).to.equal(true);
      expect($.contains($food[0], $apple[0])).to.equal(true);
    });

    it('(container, other) : should not detect elements that are not contained', function() {
      var $food = $(food);
      var $fruits = $food.find('#fruits');
      var $vegetables = $food.find('#vegetables');
      var $apple = $fruits.find('.apple');

      expect($.contains($vegetables[0], $apple[0])).to.equal(false);
      expect($.contains($fruits[0], $vegetables[0])).to.equal(false);
      expect($.contains($vegetables[0], $fruits[0])).to.equal(false);
      expect($.contains($fruits[0], $fruits[0])).to.equal(false);
      expect($.contains($vegetables[0], $vegetables[0])).to.equal(false);
    });

  });

});
