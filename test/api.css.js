
var expect = require('expect.js');
var $ = require('..');

describe('$(...)', function(){

  describe('.css', function(){
    it('(): should get all styles as object', function(){
      var el = $('<li style="hai: there; wassup: 0;">');
      expect(el.css()).to.eql({ hai: 'there', wassup: 0 });
    })

    it('(undefined): should retrun all styles as object', function(){
      var el = $('<li style="color: white">');
      expect(el.css()).to.eql({ color: 'white' });
    })

    it('(prop): should return a css property value', function(){
      var el = $('<li style="hai: there">');
      expect(el.css('hai')).to.equal('there');
    })

    it('(prop, val): should set a css property', function(){
      var el = $('<li>');
      el.css('wassup', 0);
      expect(el.attr('style')).to.equal('wassup: 0;');
    })

    it('(obj): should set each key and val', function(){
      var el = $('<li>');
      el.css({ foo: 0 });
      expect(el.attr('style')).to.equal('foo: 0;');
    })

    describe('parser', function(){
      it('should allow any whitespace between declarations', function(){
        var el = $('<li style="one \t:\n 0;\n two \f\r:\v 1">');
        expect(el.css()).to.eql({ one: 0, two: 1 });
      })
    })
  })

})
