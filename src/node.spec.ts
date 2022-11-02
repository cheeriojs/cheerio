/* eslint-disable jest/no-done-callback */
import * as cheerio from './node.js';
import { Writable } from 'node:stream';

function noop() {
  // Ignore
}

const TEST_HTML = '<h1>Hello World</h1>';
const TEST_HTML_UTF16 = Buffer.from(TEST_HTML, 'utf16le');
const TEST_HTML_UTF16_BOM = Buffer.from([
  // UTF16-LE BOM
  0xff,
  0xfe,
  ...Array.from(TEST_HTML_UTF16),
]);

describe('Node API', () => {
  describe('stringStream', () => {
    it('should use parse5 by default', (cb) => {
      const stream = cheerio.stringStream({}, (err, $) => {
        expect(err).toBeUndefined();

        expect($.html()).toBe(
          `<html><head></head><body>${TEST_HTML}</body></html>`
        );

        cb();
      });
      expect(stream).toBeInstanceOf(Writable);

      stream.end(TEST_HTML);
    });

    it('should error from parse5 on buffer', () => {
      const stream = cheerio.stringStream({}, noop);
      expect(stream).toBeInstanceOf(Writable);

      expect(() => stream.write(Buffer.from(TEST_HTML))).toThrow(
        'Parser can work only with string streams.'
      );
    });

    it('should use htmlparser2 for XML', (cb) => {
      const stream = cheerio.stringStream({ xmlMode: true }, (err, $) => {
        expect(err).toBeNull();

        expect($.html()).toBe(TEST_HTML);

        cb();
      });
      expect(stream).toBeInstanceOf(Writable);

      stream.end(TEST_HTML);
    });
  });

  describe('decodeStream', () => {
    it('should use parse5 by default', (cb) => {
      const stream = cheerio.decodeStream({}, (err, $) => {
        expect(err).toBeUndefined();

        expect($.html()).toBe(
          `<html><head></head><body>${TEST_HTML}</body></html>`
        );

        cb();
      });
      expect(stream).toBeInstanceOf(Writable);

      stream.end(TEST_HTML_UTF16_BOM);
    });

    it('should use htmlparser2 for XML', (cb) => {
      const stream = cheerio.decodeStream({ xmlMode: true }, (err, $) => {
        expect(err).toBeNull();

        expect($.html()).toBe(TEST_HTML);

        cb();
      });
      expect(stream).toBeInstanceOf(Writable);

      stream.end(TEST_HTML_UTF16_BOM);
    });
  });
});
