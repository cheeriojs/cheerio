import type { Element } from 'domhandler';
import { beforeEach, describe, expect, it } from 'vitest';
import { cheerio, mixedText } from '../__fixtures__/fixtures.js';
import { type Cheerio, load } from '../index.js';

describe('$(...)', () => {
  describe('.css', () => {
    it('(prop): should return a css property value', () => {
      const el = cheerio('<li style="hai: there">');
      expect(el.css('hai')).toBe('there');
    });

    it('([prop1, prop2]): should return the specified property values as an object', () => {
      const el = cheerio(
        '<li style="margin: 1px; padding: 2px; color: blue;">',
      );
      expect(el.css(['margin', 'color'])).toStrictEqual({
        margin: '1px',
        color: 'blue',
      });
    });

    it('(prop, val): should set a css property', () => {
      const el = cheerio('<li style="margin: 0;"></li><li></li>');
      el.css('color', 'red');
      expect(el.attr('style')).toBe('margin: 0; color: red;');
      expect(el.eq(1).attr('style')).toBe('color: red;');
    });

    it('(prop, val) : should skip text nodes', () => {
      const $text = load(mixedText);
      const $body = $text($text('body')[0].children);

      $body.css('test', 'value');

      expect($text('body').html()).toBe(
        '<a style="test: value;">1</a>TEXT<b style="test: value;">2</b>',
      );
    });

    it('(prop, ""): should unset a css property', () => {
      const el = cheerio('<li style="padding: 1px; margin: 0;">');
      el.css('padding', '');
      expect(el.attr('style')).toBe('margin: 0;');
    });

    it('(any, val): should ignore unsupported prop types', () => {
      const el = cheerio('<li style="padding: 1px;">');
      el.css(123 as never, 'test');
      expect(el.attr('style')).toBe('padding: 1px;');
    });

    it('(prop): should accept a camel cased property name', () => {
      const el = cheerio('<li style="background-color: red;">');
      expect(el.css('backgroundColor')).toBe('red');
    });

    it('([prop1, prop2]): should accept camel cased property names', () => {
      const el = cheerio('<li style="background-color: red; font-size: 2px;">');
      expect(el.css(['backgroundColor', 'font-size'])).toStrictEqual({
        backgroundColor: 'red',
        'font-size': '2px',
      });
    });

    it('(prop, val): should hyphenate a camel cased property name', () => {
      const el = cheerio('<li>');
      el.css('backgroundColor', 'red');
      expect(el.attr('style')).toBe('background-color: red;');
    });

    it('(prop, val): should not duplicate a declaration set with the other casing', () => {
      const el = cheerio('<li style="background-color: red;">');
      el.css('backgroundColor', 'blue');
      expect(el.attr('style')).toBe('background-color: blue;');
    });

    it('(prop, ""): should unset a camel cased css property', () => {
      const el = cheerio('<li style="background-color: red; margin: 0;">');
      el.css('backgroundColor', '');
      expect(el.attr('style')).toBe('margin: 0;');
    });

    it('(prop, val): should keep custom properties intact', () => {
      const el = cheerio('<li style="--my-var: 1;">');
      el.css('--other-var', '2');
      expect(el.css('--my-var')).toBe('1');
      expect(el.attr('style')).toBe('--my-var: 1; --other-var: 2;');
    });

    it('(prop): should treat custom properties as case sensitive', () => {
      const el = cheerio(
        '<li style="--Theme-Color: red; --theme-color: blue;">',
      );
      expect(el.css('--Theme-Color')).toBe('red');
      expect(el.css('--theme-color')).toBe('blue');
    });

    it('(prop, val): should not fold a custom property onto another casing', () => {
      const el = cheerio('<li style="--theme-color: blue;">');
      el.css('--Theme-Color', 'red');
      expect(el.attr('style')).toBe('--theme-color: blue; --Theme-Color: red;');
    });

    it('(prop, val): should prefix lowercase vendor CSSOM names', () => {
      const el = cheerio('<li>');
      el.css('webkitTextStrokeWidth', '1px');
      el.css('msOverflowStyle', 'none');
      expect(el.attr('style')).toBe(
        '-webkit-text-stroke-width: 1px; -ms-overflow-style: none;',
      );
    });

    it('(prop): should not mangle embedded urls', () => {
      const el = cheerio(
        '<li style="background-image:url(http://example.com/img.png);">',
      );
      expect(el.css('background-image')).toBe(
        'url(http://example.com/img.png)',
      );
    });

    it('(prop): should ignore blank properties', () => {
      const el = cheerio('<li style=":#ccc;color:#aaa;">');
      expect(el.css()).toStrictEqual({ color: '#aaa' });
    });

    it('(prop): should ignore blank values', () => {
      const el = cheerio('<li style="color:;position:absolute;">');
      expect(el.css()).toStrictEqual({ position: 'absolute' });
    });

    it('(prop): should return undefined for unmatched elements', () => {
      const $ = load('<li style="color:;position:absolute;">');
      expect($('ul').css('background-image')).toBeUndefined();
    });

    it('(prop): should return undefined for unmatched styles', () => {
      const el = cheerio('<li style="color:;position:absolute;">');
      expect(el.css('margin')).toBeUndefined();
    });

    describe('(prop, function):', () => {
      let $el: Cheerio<Element>;
      beforeEach(() => {
        const $ = load(
          '<div style="margin: 0px;"></div><div style="margin: 1px;"></div><div style="margin: 2px;">',
        );
        $el = $('div');
      });

      it('should iterate over the selection', () => {
        let count = 0;
        $el.css('margin', function (idx, value) {
          expect(idx).toBe(count);
          expect(value).toBe(`${count}px`);
          expect(this).toBe($el[count]);
          count++;
          return;
        });
        expect(count).toBe(3);
      });

      it('should set each attribute independently', () => {
        const values = ['4px', '', undefined];
        $el.css('margin', (idx) => values[idx]);
        expect($el.eq(0).attr('style')).toBe('margin: 4px;');
        expect($el.eq(1).attr('style')).toBe('');
        expect($el.eq(2).attr('style')).toBe('margin: 2px;');
      });
    });

    it('(obj): should set each key and val', () => {
      const el = cheerio('<li style="padding: 0;"></li><li></li>');
      el.css({ foo: 0 } as never);
      expect(el.eq(0).attr('style')).toBe('padding: 0; foo: 0;');
      expect(el.eq(1).attr('style')).toBe('foo: 0;');
    });

    describe('parser', () => {
      it('should allow any whitespace between declarations', () => {
        const el = cheerio('<li style="one \t:\n 0;\n two \f\r:\v 1">');
        expect(el.css(['one', 'two', 'five'])).toStrictEqual({
          one: '0',
          two: '1',
        });
      });

      it('should add malformed values to previous field (#1134)', () => {
        const el = cheerio(
          '<button style="background-image: url(data:image/png;base64,iVBORw0KGgo)"></button>',
        );
        expect(el.css('background-image')).toStrictEqual(
          'url(data:image/png;base64,iVBORw0KGgo)',
        );
      });
    });
  });
});
