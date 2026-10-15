import { beforeEach, describe, expect, it } from 'vitest';
import { cheerio, forms } from '../__fixtures__/fixtures.js';
import type { CheerioAPI } from '../index.js';

describe('$(...)', () => {
  let $: CheerioAPI;

  beforeEach(() => {
    $ = cheerio.load(forms);
  });

  describe('.serializeArray', () => {
    it('() : should resolve ownership once per tree for many selected forms', () => {
      $ = cheerio.load(
        '<div id="sentinel"></div>' +
          Array.from(
            { length: 40 },
            (_, i) =>
              `<form id="f${i}"></form><input form="f${i}" name="n${i}" value="${i}">`,
          ).join(''),
      );
      const selected = $('form');
      const sentinel = $('#sentinel')[0];
      let idReads = 0;
      let associationReads = 0;
      Object.defineProperty(sentinel.attribs, 'id', {
        get() {
          idReads++;
          return 'sentinel';
        },
      });
      $('input').each((i, control) => {
        Object.defineProperty(control.attribs, 'form', {
          get() {
            associationReads++;
            return `f${i}`;
          },
        });
      });

      expect(selected.serializeArray()).toStrictEqual(
        Array.from({ length: 40 }, (_, i) => ({
          name: `n${i}`,
          value: `${i}`,
        })),
      );
      expect(idReads).toBe(1);
      expect(associationReads).toBe(40);
    });

    it('() : should recompute IDs and owners after mutations between calls', () => {
      $ = cheerio.load(
        '<div id="blocked"></div><form id="blocked"></form><form id="other"></form><input form="blocked" name="external" value="1">',
      );
      const selected = $('form');
      expect(selected.serializeArray()).toStrictEqual([]);
      $('div').remove();
      expect(selected.serializeArray()).toStrictEqual([
        { name: 'external', value: '1' },
      ]);
      $('input').attr('form', 'other');
      expect(selected.first().serializeArray()).toStrictEqual([]);
      expect(selected.last().serializeArray()).toStrictEqual([
        { name: 'external', value: '1' },
      ]);
      selected.last().append($('input').removeAttr('form'));
      expect(selected.serializeArray()).toStrictEqual([
        { name: 'external', value: '1' },
      ]);
    });

    it('() : should keep roots independent and preserve selection order and duplicates', () => {
      const first = cheerio.load(
        '<form id="same"></form><input form="same" name="first" value="1">',
      );
      const second = cheerio.load(
        '<form id="same"></form><input form="same" name="second" value="2">',
      );
      const detached = $(
        '<section><form id="same"><input form="missing" name="detached" value="3"></form></section>',
      ).remove();
      const selected = $([
        second('form')[0],
        first('form')[0],
        detached.find('form')[0],
        first('form')[0],
        second('input')[0],
      ]);
      expect(selected.serializeArray()).toStrictEqual([
        { name: 'second', value: '2' },
        { name: 'first', value: '1' },
        { name: 'detached', value: '3' },
        { name: 'first', value: '1' },
        { name: 'second', value: '2' },
      ]);
    });

    it('() : should include explicitly associated controls in document order', () => {
      $ = cheerio.load(`
        <input form="owner" name="before" value="1">
        <form id="owner"><input name="inside" value="2"></form>
        <textarea form="owner" name="after">3</textarea>
        <select form="owner" name="choice"><option value="4" selected>Four</option></select>
      `);

      expect($('#owner').serializeArray()).toStrictEqual([
        { name: 'before', value: '1' },
        { name: 'inside', value: '2' },
        { name: 'after', value: '3' },
        { name: 'choice', value: '4' },
      ]);
      expect($('#owner').serialize()).toBe(
        'before=1&inside=2&after=3&choice=4',
      );
    });

    it('() : should use explicit form ownership instead of ancestry', () => {
      $ = cheerio.load(`
        <form id="first">
          <input name="own" value="1">
          <input form="second" name="reassigned" value="2">
        </form>
        <form id="second"></form>
      `);

      expect($('#first').serializeArray()).toStrictEqual([
        { name: 'own', value: '1' },
      ]);
      expect($('#second').serializeArray()).toStrictEqual([
        { name: 'reassigned', value: '2' },
      ]);
    });

    it('() : should not fall back to ancestry for unmatched form attributes', () => {
      $ = cheerio.load(`
        <div id="not-a-form"></div>
        <form id="owner">
          <input form="" name="empty" value="1">
          <input form="missing" name="missing" value="2">
          <input form="not-a-form" name="nonform" value="3">
          <input form="OWNER" name="case" value="4">
          <input name="own" value="5">
        </form>
      `);

      expect($('#owner').serializeArray()).toStrictEqual([
        { name: 'own', value: '5' },
      ]);
    });

    it('() : should use the first element with the matching ID', () => {
      $ = cheerio.load(`
        <div id="blocked"></div>
        <form id="blocked"><input form="blocked" name="blocked" value="1"></form>
        <form id="duplicate"></form>
        <form id="duplicate"><input name="own" value="2"></form>
        <input form="duplicate" name="external" value="3">
      `);

      expect($('form#blocked').serializeArray()).toStrictEqual([]);
      const duplicates = $('form#duplicate');
      expect(duplicates.first().serializeArray()).toStrictEqual([
        { name: 'external', value: '3' },
      ]);
      expect(duplicates.last().serializeArray()).toStrictEqual([
        { name: 'own', value: '2' },
      ]);
    });

    it('() : should keep individually selected controls independent of form ownership', () => {
      $ = cheerio.load('<input form="missing" name="individual" value="1">');

      expect($('input').serializeArray()).toStrictEqual([
        { name: 'individual', value: '1' },
      ]);
    });

    it('() : should keep XML form serialization limited to descendants', () => {
      $ = cheerio.load(
        '<root><form id="owner"><input form="missing" name="inside" value="1"/></form><input form="owner" name="outside" value="2"/></root>',
        { xmlMode: true },
      );

      expect($('form').serializeArray()).toStrictEqual([
        { name: 'inside', value: '1' },
      ]);
    });

    it('() : should serialize ordinary controls in a detached form', () => {
      const form = $(
        '<form><input name="detached" value="1"><input form="missing" name="explicit" value="2"><input form="" name="empty" value="3"><input form="other" name="other" value="4"></form>',
      ).remove();

      expect(form.serializeArray()).toStrictEqual([
        { name: 'detached', value: '1' },
        { name: 'explicit', value: '2' },
        { name: 'empty', value: '3' },
        { name: 'other', value: '4' },
      ]);
    });

    it('() : should find the nearest form after moving controls', () => {
      $ = cheerio.load('<form id="outer"></form><form id="inner"></form>');
      $('#inner').append('<input name="nested" value="1">');
      $('#outer').append($('#inner'));

      expect($('#outer').serializeArray()).toStrictEqual([]);
      expect($('#inner').serializeArray()).toStrictEqual([
        { name: 'nested', value: '1' },
      ]);
    });

    it('() : should match form IDs literally rather than as selectors', () => {
      $ = cheerio.load(`
        <form id="owner['special']"></form>
        <input form="owner['special']" name="literal" value="1">
      `);

      expect($('form').serializeArray()).toStrictEqual([
        { name: 'literal', value: '1' },
      ]);
    });

    it('() : should apply successful control filtering to external controls', () => {
      $ = cheerio.load(`
        <form id="owner"></form>
        <input form="owner" name="disabled" value="1" disabled>
        <input form="owner" name="submit" value="2" type="submit">
        <input form="owner" name="unchecked" value="3" type="checkbox">
        <input form="owner" name="checked" value="4" type="checkbox" checked>
      `);

      expect($('#owner').serializeArray()).toStrictEqual([
        { name: 'checked', value: '4' },
      ]);
    });

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
