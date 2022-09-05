import * as fixtures from '../__fixtures__/fixtures.js';
import cheerio from '..';

describe('$.extract', () => {
  it('() : should extract values for selectors', () => {
    const $ = cheerio.load(fixtures.eleven).root();
    // An empty object should lead to an empty extraction.
    expect($.extract({})).toStrictEqual({});
    // Non-existent values should be undefined.
    expect($.extract({ foo: 'bar' })).toStrictEqual({ foo: undefined });
    // Existing values should be extracted.
    expect($.extract({ red: '.red' })).toStrictEqual({ red: 'Four' });
    expect($.extract({ red: '.red', sel: '.sel' })).toStrictEqual({
      red: 'Four',
      sel: 'Three',
    });
    // Descriptors for extractions should be supported
    expect(
      $.extract({
        red: { selector: '.red' },
        sel: { selector: '.sel' },
      })
    ).toStrictEqual({ red: 'Four', sel: 'Three' });
    // Should support extraction of multiple values.
    expect(
      $.extract({
        red: ['.red'],
        sel: ['.sel'],
      })
    ).toStrictEqual({
      red: ['Four', 'Five', 'Nine'],
      sel: ['Three', 'Nine', 'Eleven'],
    });
    // Should support custom `prop`s.
    expect(
      $.extract({
        red: { selector: '.red', out: 'outerHTML' },
        sel: { selector: '.sel', out: 'tagName' },
      })
    ).toStrictEqual({ red: '<li class="red">Four</li>', sel: 'LI' });
    // Should support custom `prop`s for multiple values.
    expect(
      $.extract({
        red: [{ selector: '.red', out: 'outerHTML' }],
      })
    ).toStrictEqual({
      red: [
        '<li class="red">Four</li>',
        '<li class="red">Five</li>',
        '<li class="red sel">Nine</li>',
      ],
    });
  });
});
