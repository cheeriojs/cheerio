import { describe, it, expect, expectTypeOf } from 'vitest';
import * as fixtures from '../__fixtures__/fixtures.js';
import { load } from '../load-parse.js';

interface RedSelObject {
  red: string | undefined;
  sel: string | undefined;
}

interface RedSelMultipleObject {
  red: string[];
  sel: string[];
}

describe('$.extract', () => {
  it('() : should extract values for selectors', () => {
    const $ = load(fixtures.eleven);
    const $root = $.root();

    // An empty object should lead to an empty extraction.
    expectTypeOf($root.extract({})).toEqualTypeOf<Record<never, never>>();
    const emptyExtract = $root.extract({});
    expect(emptyExtract).toStrictEqual({});

    // Non-existent values should be undefined.
    expectTypeOf($root.extract({ foo: 'bar' })).toEqualTypeOf<{
      foo: string | undefined;
    }>();
    const simpleExtract = $root.extract({ foo: 'bar' });
    expect(simpleExtract).toStrictEqual({ foo: undefined });

    // Existing values should be extracted.
    expectTypeOf($root.extract({ red: '.red' })).toEqualTypeOf<{
      red: string | undefined;
    }>();
    expect($root.extract({ red: '.red' })).toStrictEqual({ red: 'Four' });

    expectTypeOf(
      $root.extract({ red: '.red', sel: '.sel' }),
    ).toEqualTypeOf<RedSelObject>();
    expect($root.extract({ red: '.red', sel: '.sel' })).toStrictEqual({
      red: 'Four',
      sel: 'Three',
    });

    // Descriptors for extractions should be supported.
    expectTypeOf(
      $root.extract({
        red: { selector: '.red' },
        sel: { selector: '.sel' },
      }),
    ).toEqualTypeOf<RedSelObject>();
    expect(
      $root.extract({
        red: { selector: '.red' },
        sel: { selector: '.sel' },
      }),
    ).toStrictEqual({ red: 'Four', sel: 'Three' });

    // Should support extraction of multiple values.
    expectTypeOf(
      $root.extract({
        red: ['.red'],
        sel: ['.sel'],
      }),
    ).toEqualTypeOf<{ red: string[]; sel: string[] }>();
    const multipleExtract = $root.extract({
      red: ['.red'],
      sel: ['.sel'],
    });
    expectTypeOf(multipleExtract).toEqualTypeOf<RedSelMultipleObject>();
    expect(multipleExtract).toStrictEqual({
      red: ['Four', 'Five', 'Nine'],
      sel: ['Three', 'Nine', 'Eleven'],
    });

    // Should support custom `prop`s.
    expectTypeOf(
      $root.extract({
        red: { selector: '.red', value: 'outerHTML' },
        sel: { selector: '.sel', value: 'tagName' },
      }),
    ).toEqualTypeOf<RedSelObject>();
    expect(
      $root.extract({
        red: { selector: '.red', value: 'outerHTML' },
        sel: { selector: '.sel', value: 'tagName' },
      }),
    ).toStrictEqual({ red: '<li class="red">Four</li>', sel: 'LI' });

    // Should support custom `prop`s for multiple values.
    expectTypeOf(
      $root.extract({
        red: [{ selector: '.red', value: 'outerHTML' }],
      }),
    ).toEqualTypeOf<{ red: string[] }>();
    expect(
      $root.extract({
        red: [{ selector: '.red', value: 'outerHTML' }],
      }),
    ).toStrictEqual({
      red: [
        '<li class="red">Four</li>',
        '<li class="red">Five</li>',
        '<li class="red sel">Nine</li>',
      ],
    });

    // Should support custom extraction functions.
    expectTypeOf(
      $root.extract({
        red: {
          selector: '.red',
          value: (el, key) => `${key}=${$(el).text()}`,
        },
      }),
    ).toEqualTypeOf<{ red: string | undefined }>();
    expect(
      $root.extract({
        red: {
          selector: '.red',
          value: (el, key) => `${key}=${$(el).text()}`,
        },
      }),
    ).toStrictEqual({ red: 'red=Four' });

    // Should support custom extraction functions for multiple values.
    expectTypeOf(
      $root.extract({
        red: [
          {
            selector: '.red',
            value: (el, key) => `${key}=${$(el).text()}`,
          },
        ],
      }),
    ).toEqualTypeOf<{ red: string[] }>();
    expect(
      $root.extract({
        red: [
          {
            selector: '.red',
            value: (el, key) => `${key}=${$(el).text()}`,
          },
        ],
      }),
    ).toStrictEqual({ red: ['red=Four', 'red=Five', 'red=Nine'] });

    // Should support extraction objects.
    expectTypeOf(
      $root.extract({
        section: {
          selector: 'ul:nth(1)',
          value: {
            red: '.red',
            sel: '.blue',
          },
        },
      }),
    ).toEqualTypeOf<{
      section: { red: string | undefined; sel: string | undefined } | undefined;
    }>();
    const subExtractObject = $root.extract({
      section: {
        selector: 'ul:nth(1)',
        value: {
          red: '.red',
          sel: '.blue',
        },
      },
    });
    expectTypeOf(subExtractObject).toEqualTypeOf<{
      section: RedSelObject | undefined;
    }>();
    expect(subExtractObject).toStrictEqual({
      section: {
        red: 'Five',
        sel: 'Seven',
      },
    });
  });
});
