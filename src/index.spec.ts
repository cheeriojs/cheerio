import * as cheerio from './index.js';
import * as statics from './static.js';

describe('static method re-exports', () => {
  it('should export expected static methods', () => {
    for (const key of Object.keys(statics) as (keyof typeof statics)[]) {
      if (key === 'extract') continue;
      expect(typeof cheerio[key]).toBe(typeof statics[key]);
    }
  });

  it('should have a functional `html` that is bound to the default instance', () => {
    expect(cheerio.html(cheerio.default('<div>test div</div>'))).toBe(
      '<div>test div</div>'
    );
  });

  it('should have a functional `xml` that is bound to the default instance', () => {
    expect(cheerio.xml(cheerio.default('<div>test div</div>'))).toBe(
      '<div>test div</div>'
    );
  });

  it('should have a functional `text` that is bound to the default instance', () => {
    expect(cheerio.text(cheerio.default('<div>test div</div>'))).toBe(
      'test div'
    );
  });
});
