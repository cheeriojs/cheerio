import { beforeEach, describe, expect, it } from 'vitest';
import { cheerio, forms } from '../__fixtures__/fixtures.js';
import type { CheerioAPI } from '../index.js';

describe('$(...)', () => {
  let $: CheerioAPI;

  beforeEach(() => {
    $ = cheerio.load(forms);
  });

  describe('.serializeArray', () => {
    it('() : should get form controls', () => {
      expect($('form#simple').serializeArray()).toStrictEqual([
        {
          name: 'fruit',
          value: 'Apple',
        },
      ]);
    });

    it('() : should get nested form controls', () => {
      expect($('form#nested').serializeArray()).toHaveLength(2);
      const data = $('form#nested').serializeArray();
      data.sort((a, b) => a.value.localeCompare(b.value));
      expect(data).toStrictEqual([
        {
          name: 'fruit',
          value: 'Apple',
        },
        {
          name: 'vegetable',
          value: 'Carrot',
        },
      ]);
    });

    it('() : should not get disabled form controls', () => {
      expect($('form#disabled').serializeArray()).toStrictEqual([]);
    });

    it('() : should not get form controls with the wrong type', () => {
      expect($('form#submit').serializeArray()).toStrictEqual([
        {
          name: 'fruit',
          value: 'Apple',
        },
      ]);
    });

    it('() : should get selected options', () => {
      expect($('form#select').serializeArray()).toStrictEqual([
        {
          name: 'fruit',
          value: 'Orange',
        },
      ]);
    });

    it('() : should not get unnamed form controls', () => {
      expect($('form#unnamed').serializeArray()).toStrictEqual([
        {
          name: 'fruit',
          value: 'Apple',
        },
      ]);
    });

    it('() : should get multiple selected options', () => {
      expect($('form#multiple').serializeArray()).toHaveLength(2);
      const data = $('form#multiple').serializeArray();
      data.sort((a, b) => a.value.localeCompare(b.value));
      expect(data).toStrictEqual([
        {
          name: 'fruit',
          value: 'Apple',
        },
        {
          name: 'fruit',
          value: 'Orange',
        },
      ]);
    });

    it('() : should get individually selected elements', () => {
      const data = $('form#nested input').serializeArray();
      data.sort((a, b) => a.value.localeCompare(b.value));
      expect(data).toStrictEqual([
        {
          name: 'fruit',
          value: 'Apple',
        },
        {
          name: 'vegetable',
          value: 'Carrot',
        },
      ]);
    });

    it('() : should respect explicit form ownership', () => {
      const $local = cheerio.load(`
        <form id="a">
          <input name="own" value="1">
          <input form="b" name="other" value="2">
        </form>
        <form id="b"></form>
        <input form="a" name="external" value="3">
      `);

      expect($local('#a').serializeArray()).toStrictEqual([
        { name: 'own', value: '1' },
        { name: 'external', value: '3' },
      ]);
      expect($local('#b').serializeArray()).toStrictEqual([
        { name: 'other', value: '2' },
      ]);
    });

    it('() : should not fall back to the ancestor form for an invalid form attribute', () => {
      const $local = cheerio.load(`
        <form id="a"><input name="own" value="1"></form>
        <input form="missing" name="orphan" value="2">
        <div id="notform"></div>
        <form id="b"></form>
        <input form="notform" name="wrongtype" value="3">
        <input form="b" name="external" value="4">
      `);

      expect($local('#a').serializeArray()).toStrictEqual([
        { name: 'own', value: '1' },
      ]);
      expect($local('#b').serializeArray()).toStrictEqual([
        { name: 'external', value: '4' },
      ]);
    });

    it('() : should serialize explicitly associated controls in document order', () => {
      const $local = cheerio.load(`
        <input form="f" name="before" value="1">
        <form id="f">
          <select name="middle"><option value="2" selected>2</option></select>
          <input name="after" value="3">
        </form>
      `);

      expect($local('#f').serializeArray()).toStrictEqual([
        { name: 'before', value: '1' },
        { name: 'middle', value: '2' },
        { name: 'after', value: '3' },
      ]);
    });

    it('() : should use the first element with the referenced ID as the form owner', () => {
      const $local = cheerio.load(`
        <div id="x"></div>
        <form id="x"><input name="inside" value="1"></form>
        <input form="x" name="outside" value="2">
      `);

      expect($local('form#x').serializeArray()).toStrictEqual([
        { name: 'inside', value: '1' },
      ]);
    });

    it('() : should standardize line breaks', () => {
      expect($('form#textarea').serializeArray()).toStrictEqual([
        {
          name: 'fruits',
          value: 'Apple\r\nOrange',
        },
      ]);
    });

    it("() : shouldn't serialize the empty string", () => {
      expect($('<input value=pineapple>').serializeArray()).toStrictEqual([]);
      expect(
        $('<input name="" value=pineapple>').serializeArray(),
      ).toStrictEqual([]);
      expect(
        $('<input name="fruit" value=pineapple>').serializeArray(),
      ).toStrictEqual([
        {
          name: 'fruit',
          value: 'pineapple',
        },
      ]);
    });

    it('() : should serialize inputs without value attributes', () => {
      expect($('<input name="fruit">').serializeArray()).toStrictEqual([
        {
          name: 'fruit',
          value: '',
        },
      ]);
    });
  });

  describe('.serialize', () => {
    it('() : should get form controls', () => {
      expect($('form#simple').serialize()).toBe('fruit=Apple');
    });

    it('() : should get nested form controls', () => {
      expect($('form#nested').serialize()).toBe('fruit=Apple&vegetable=Carrot');
    });

    it('() : should not get disabled form controls', () => {
      expect($('form#disabled').serialize()).toBe('');
    });

    it('() : should get multiple selected options', () => {
      expect($('form#multiple').serialize()).toBe('fruit=Apple&fruit=Orange');
    });

    it("() : should encode spaces as +'s", () => {
      expect($('form#spaces').serialize()).toBe('fruit=Blood+orange');
    });
  });
});
