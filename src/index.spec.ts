import * as cheerio from './index';
import * as statics from './static';

describe('index', () => {
  it('should export all static methods', () => {
    for (const key of Object.keys(statics) as (keyof typeof statics)[]) {
      expect(cheerio[key]).toBe(statics[key]);
    }
  });
});
