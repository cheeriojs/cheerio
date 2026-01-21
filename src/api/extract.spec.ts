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
  it('should return an empty object when no selectors are provided', () => {
    const $ = load(fixtures.eleven);
    const $root = $.root();

    expectTypeOf($root.extract({})).toEqualTypeOf<Record<never, never>>();
    const emptyExtract = $root.extract({});
    expect(emptyExtract).toStrictEqual({});
  });

  it('should return undefined for selectors that do not match any elements', () => {
    const $ = load(fixtures.eleven);
    const $root = $.root();

    expectTypeOf($root.extract({ foo: 'bar' })).toEqualTypeOf<{
      foo: string | undefined;
    }>();
    const simpleExtract = $root.extract({ foo: 'bar' });
    expect(simpleExtract).toStrictEqual({ foo: undefined });
  });

  it('should extract values for existing selectors', () => {
    const $ = load(fixtures.eleven);
    const $root = $.root();

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
  });

  it('should extract values using descriptor objects', () => {
    const $ = load(fixtures.eleven);
    const $root = $.root();

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
  });

  it('should extract multiple values for selectors', () => {
    const $ = load(fixtures.eleven);
    const $root = $.root();

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
  });

  it('should extract custom properties specified by the user', () => {
    const $ = load(fixtures.eleven);
    const $root = $.root();

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
  });

  it('should extract multiple custom properties for selectors', () => {
    const $ = load(fixtures.eleven);
    const $root = $.root();

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
  });

  it('should extract values using custom extraction functions', () => {
    const $ = load(fixtures.eleven);
    const $root = $.root();

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
  });

  it('should correctly type check custom extraction functions returning non-string values', () => {
    const $ = load(fixtures.eleven);
    const $root = $.root();

    expectTypeOf(
      $root.extract({
        red: {
          selector: '.red',
          value: (el) => $(el).text().length,
        },
      }),
    ).toEqualTypeOf<{ red: number | undefined }>();
    expect(
      $root.extract({
        red: {
          selector: '.red',
          value: (el) => $(el).text().length,
        },
      }),
    ).toStrictEqual({ red: 4 });
  });

  it('should extract multiple values using custom extraction functions', () => {
    const $ = load(fixtures.eleven);
    const $root = $.root();

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
  });

  it('should extract nested objects based on selectors', () => {
    const $ = load(fixtures.eleven);
    const $root = $.root();

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

  it('should correctly type check nested objects returning non-string values', () => {
    const $ = load(fixtures.eleven);
    const $root = $.root();

    expectTypeOf(
      $root.extract({
        section: {
          selector: 'ul:nth(1)',
          value: {
            red: {
              selector: '.red',
              value: (el) => $(el).text().length,
            },
          },
        },
      }),
    ).toEqualTypeOf<{
      section: { red: number | undefined } | undefined;
    }>();
    expect(
      $root.extract({
        section: {
          selector: 'ul:nth(1)',
          value: {
            red: {
              selector: '.red',
              value: (el) => $(el).text().length,
            },
          },
        },
      }),
    ).toStrictEqual({
      section: {
        red: 4,
      },
    });
  });

  it('should handle missing href properties without errors (#4239)', () => {
    const $ = load(fixtures.eleven);
    expect<{ links: string[] }>(
      $.extract({ links: [{ selector: 'li', value: 'href' }] }),
    ).toStrictEqual({ links: [] });
  });
});
