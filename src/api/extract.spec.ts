import * as fixtures from '../__fixtures__/fixtures.js';
import cheerio from '..';

describe('$.extract', () => {
  it('() : should extract values for selectors', () => {
    const $ = cheerio.load(fixtures.eleven);
    const $root = cheerio.load(fixtures.eleven).root();
    // An empty object should lead to an empty extraction.
    expect($root.extract({})).toStrictEqual({});
    // Non-existent values should be undefined.
    expect($root.extract({ foo: 'bar' })).toStrictEqual({ foo: undefined });
    // Existing values should be extracted.
    expect($root.extract({ red: '.red' })).toStrictEqual({ red: 'Four' });
    expect($root.extract({ red: '.red', sel: '.sel' })).toStrictEqual({
      red: 'Four',
      sel: 'Three',
    });
    // Descriptors for extractions should be supported
    expect(
      $root.extract({
        red: { selector: '.red' },
        sel: { selector: '.sel' },
      })
    ).toStrictEqual({ red: 'Four', sel: 'Three' });
    // Should support extraction of multiple values.
    expect(
      $root.extract({
        red: ['.red'],
        sel: ['.sel'],
      })
    ).toStrictEqual({
      red: ['Four', 'Five', 'Nine'],
      sel: ['Three', 'Nine', 'Eleven'],
    });
    // Should support custom `prop`s.
    expect(
      $root.extract({
        red: { selector: '.red', value: 'outerHTML' },
        sel: { selector: '.sel', value: 'tagName' },
      })
    ).toStrictEqual({ red: '<li class="red">Four</li>', sel: 'LI' });
    // Should support custom `prop`s for multiple values.
    expect(
      $root.extract({
        red: [{ selector: '.red', value: 'outerHTML' }],
      })
    ).toStrictEqual({
      red: [
        '<li class="red">Four</li>',
        '<li class="red">Five</li>',
        '<li class="red sel">Nine</li>',
      ],
    });
    // Should support custom extraction functions.
    expect(
      $root.extract({
        red: {
          selector: '.red',
          value: (el, key) => `${key}=${$(el).text()}`,
        },
      })
    ).toStrictEqual({ red: 'red=Four' });
    // Should support custom extraction functions for multiple values.
    expect(
      $root.extract({
        red: [
          {
            selector: '.red',
            value: (el, key) => `${key}=${$(el).text()}`,
          },
        ],
      })
    ).toStrictEqual({ red: ['red=Four', 'red=Five', 'red=Nine'] });
    // Should support extraction objects
    expect(
      $root.extract({
        section: {
          selector: 'ul:nth(1)',
          value: {
            red: '.red',
            blue: '.blue',
          },
        },
      })
    ).toStrictEqual({
      section: {
        red: 'Five',
        blue: 'Seven',
      },
    });
  });
});
