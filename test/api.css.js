var expect = require('expect.js');
var $ = require('..');

describe('$(...)', function() {

  describe('.css', function() {
    it('(prop): should return a css property value', function() {
      var el = $('<li style="hai: there">');
      expect(el.css('hai')).to.equal('there');
    });

    it('([prop1, prop2]): should return the specified property values as an object', function() {
      var el = $('<li style="margin: 1px; padding: 2px; color: blue;">');
      expect(el.css(['margin', 'color'])).to.eql({ margin: '1px', color: 'blue' });
    });

    it('(prop, val): should set a css property', function() {
      var el = $('<li style="margin: 0;"></li><li></li>');
      el.css('color', 'red');
      expect(el.attr('style')).to.equal('margin: 0; color: red;');
      expect(el.eq(1).attr('style')).to.equal('color: red;');
    });

    it('(prop, ""): should unset a css property', function() {
      var el = $('<li style="padding: 1px; margin: 0;">');
      el.css('padding', '');
      expect(el.attr('style')).to.equal('margin: 0;');
    });

    it('(prop): should not mangle embedded urls', function() {
      var el = $('<li style="background-image:url(http://example.com/img.png);">');
      expect(el.css('background-image')).to.equal('url(http://example.com/img.png)');
    });

    it('(prop): should ignore blank properties', function() {
      var el = $('<li style=":#ccc;color:#aaa;">');
      expect(el.css()).to.eql({color:'#aaa'});
    });

    it('(prop): should ignore blank values', function() {
      var el = $('<li style="color:;position:absolute;">');
      expect(el.css()).to.eql({position:'absolute'});
    });

    describe('(prop, function):', function() {
      beforeEach(function() {
        this.$el = $('<div style="margin: 0;"></div><div style="margin: 0;"></div><div style="margin: 0;">');
      });

      it('should iterate over the selection', function() {
        var count = 0;
        var $el = this.$el;
        this.$el.css('margin', function(idx, elem) {
          expect(idx).to.equal(count);
          expect(elem).to.equal($el[count]);
          expect(this).to.equal($el[count]);
          count++;
        });
        expect(count).to.equal(3);
      });

      it('should set each attribute independently', function() {
        var values = ['4px', '', undefined];
        this.$el.css('margin', function(idx) {
          return values[idx];
        });
        expect(this.$el.eq(0).attr('style')).to.equal('margin: 4px;');
        expect(this.$el.eq(1).attr('style')).to.equal('');
        expect(this.$el.eq(2).attr('style')).to.equal('margin: 0;');
      });
    });

    it('(obj): should set each key and val', function() {
      var el = $('<li style="padding: 0;"></li><li></li>');
      el.css({ foo: 0 });
      expect(el.eq(0).attr('style')).to.equal('padding: 0; foo: 0;');
      expect(el.eq(1).attr('style')).to.equal('foo: 0;');
    });

    describe('parser', function(){
      it('should allow any whitespace between declarations', function() {
        var el = $('<li style="one \t:\n 0;\n two \f\r:\v 1">');
        expect(el.css(['one', 'two'])).to.eql({ one: 0, two: 1 });
      });
    });
  });

});
