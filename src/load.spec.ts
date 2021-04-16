import cheerio from '.';

describe('.load', () => {
  it('(html) : should retain original root after creating a new node', () => {
    const $ = cheerio.load('<body><ul id="fruits"></ul></body>');
    expect($('body')).toHaveLength(1);
    $('<script>');
    expect($('body')).toHaveLength(1);
  });

  it('(html) : should handle lowercase tag options', () => {
    const $ = cheerio.load('<BODY><ul id="fruits"></ul></BODY>', {
      xml: { lowerCaseTags: true },
    });
    expect($.html()).toBe('<body><ul id="fruits"/></body>');
  });

  it('(html) : should handle the `normalizeWhitepace` option', () => {
    const $ = cheerio.load('<body><b>foo</b>  <b>bar</b></body>', {
      xml: { normalizeWhitespace: true },
    });
    expect($.html()).toBe('<body><b>foo</b> <b>bar</b></body>');
  });

  it('(html) : should handle xml tag option', () => {
    const $ = cheerio.load('<body><script><foo></script></body>', {
      xml: true,
    });
    expect($('script')[0].children[0].type).toBe('tag');
  });

  it('(buffer) : should accept a buffer', () => {
    const html = '<html><head></head><body>foo</body></html>';
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const $html = cheerio.load(Buffer.from(html));
    expect($html.html()).toBe(html);
  });
});
