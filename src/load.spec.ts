import { describe, expect, it } from 'vitest';
import { load } from './index.js';

describe('.load', () => {
  it.each(['hello', 'a < b & c', ''])(
    '(node) : should accept a CDATA node containing %j',
    (content) => {
      const $ = load(`<root><![CDATA[${content}]]></root>`, {
        xmlMode: true,
      });
      const node = $('root').contents()[0];
      const $node = $(node);

      expect($node).toHaveLength(1);
      expect($node[0]).toBe(node);
      expect($node.text()).toBe(content);
      expect($node.parent()[0]).toBe($('root')[0]);
    },
  );

  it('(node) : should wrap CDATA nodes while iterating over XML contents', () => {
    const $ = load(
      '<root>before<![CDATA[a < b]]><child>inside</child>after</root>',
      { xmlMode: true },
    );
    const texts: string[] = [];

    $('root')
      .contents()
      .each(function () {
        texts.push($(this).text());
      });

    expect(texts).toEqual(['before', 'a < b', 'inside', 'after']);
  });

  it('(html) : should retain original root after creating a new node', () => {
    const $ = load('<body><ul id="fruits"></ul></body>');
    expect($('body')).toHaveLength(1);
    $('<script>');
    expect($('body')).toHaveLength(1);
  });

  it('(html) : should handle lowercase tag options', () => {
    const $ = load('<BODY><ul id="fruits"></ul></BODY>', {
      xml: { lowerCaseTags: true },
    });
    expect($.html()).toBe('<body><ul id="fruits"/></body>');
  });

  it('(html) : should handle xml tag option', () => {
    const $ = load('<body><script><foo></script></body>', {
      xml: true,
    });
    expect($('script')[0].children[0].type).toBe('tag');
  });

  it('(buffer) : should accept a buffer', () => {
    const html = '<html><head></head><body>foo</body></html>';
    const $html = load(Buffer.from(html));
    expect($html.html()).toBe(html);
  });
});
