var cheerio = require('../..');

describe('$(...)', function () {
  describe('.css', function () {
    it('(prop): should return a css property value', function () {
      var el = cheerio('<li style="hai: there">');
      expect(el.css('hai')).toBe('there');
    });

    it('([prop1, prop2]): should return the specified property values as an object', function () {
      var el = cheerio('<li style="margin: 1px; padding: 2px; color: blue;">');
      expect(el.css(['margin', 'color'])).toStrictEqual({
        margin: '1px',
        color: 'blue',
      });
    });

    it('(prop, val): should set a css property', function () {
      var el = cheerio('<li style="margin: 0;"></li><li></li>');
      el.css('color', 'red');
      expect(el.attr('style')).toBe('margin: 0; color: red;');
      expect(el.eq(1).attr('style')).toBe('color: red;');
    });

    it('(prop, ""): should unset a css property', function () {
      var el = cheerio('<li style="padding: 1px; margin: 0;">');
      el.css('padding', '');
      expect(el.attr('style')).toBe('margin: 0;');
    });

    it('(prop): should not mangle embedded urls', function () {
      var el = cheerio(
        '<li style="background-image:url(http://example.com/img.png);">'
      );
      expect(el.css('background-image')).toBe(
        'url(http://example.com/img.png)'
      );
    });

    it('(prop): should ignore blank properties', function () {
      var el = cheerio('<li style=":#ccc;color:#aaa;">');
      expect(el.css()).toStrictEqual({ color: '#aaa' });
    });

    it('(prop): should ignore blank values', function () {
      var el = cheerio('<li style="color:;position:absolute;">');
      expect(el.css()).toStrictEqual({ position: 'absolute' });
    });

    it('(prop): should return undefined for unmatched elements', function () {
      var $ = cheerio.load('<li style="color:;position:absolute;">');
      expect($('ul').css('background-image')).toStrictEqual(undefined);
    });

    it('(prop): should return undefined for unmatched styles', function () {
      var el = cheerio('<li style="color:;position:absolute;">');
      expect(el.css('margin')).toStrictEqual(undefined);
    });

    describe('(prop, function):', function () {
      var $el;
      beforeEach(function () {
        $el = cheerio(
          '<div style="margin: 0px;"></div><div style="margin: 1px;"></div><div style="margin: 2px;">'
        );
      });

      it('should iterate over the selection', function () {
        var count = 0;
        $el.css('margin', function (idx, value) {
          expect(idx).toBe(count);
          expect(value).toBe(count + 'px');
          expect(this).toBe($el[count]);
          count++;
        });
        expect(count).toBe(3);
      });

      it('should set each attribute independently', function () {
        var values = ['4px', '', undefined];
        $el.css('margin', function (idx) {
          return values[idx];
        });
        expect($el.eq(0).attr('style')).toBe('margin: 4px;');
        expect($el.eq(1).attr('style')).toBe('');
        expect($el.eq(2).attr('style')).toBe('margin: 2px;');
      });
    });

    it('(obj): should set each key and val', function () {
      var el = cheerio('<li style="padding: 0;"></li><li></li>');
      el.css({ foo: 0 });
      expect(el.eq(0).attr('style')).toBe('padding: 0; foo: 0;');
      expect(el.eq(1).attr('style')).toBe('foo: 0;');
    });

    describe('parser', function () {
      it('should allow any whitespace between declarations', function () {
        var el = cheerio('<li style="one \t:\n 0;\n two \f\r:\v 1">');
        expect(el.css(['one', 'two'])).toStrictEqual({ one: '0', two: '1' });
      });
    });
  });
});
