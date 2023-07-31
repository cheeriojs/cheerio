/* eslint-disable jest/no-done-callback */
import * as cheerio from './batteries.js';
import { Writable } from 'node:stream';
import { createServer, type Server } from 'node:http';

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

describe('loadBuffer', () => {
  it('should parse UTF-8 HTML', () => {
    const $ = cheerio.loadBuffer(Buffer.from(TEST_HTML));

    expect($.html()).toBe(
      `<html><head></head><body>${TEST_HTML}</body></html>`
    );
  });

  it('should parse UTF-16 HTML', () => {
    const $ = cheerio.loadBuffer(TEST_HTML_UTF16_BOM);

    expect($.html()).toBe(
      `<html><head></head><body>${TEST_HTML}</body></html>`
    );
  });
});

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
    const stream = cheerio.stringStream({ xml: true }, (err, $) => {
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

describe('fromURL', () => {
  let server: Server | undefined;

  function createTestServer(
    contentType: string,
    body: string | Buffer
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      server = createServer((_req, res) => {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(body);
      });

      server.listen(0, () => {
        const address = server?.address();

        if (typeof address === 'string' || address == null) {
          reject(new Error('Failed to get port'));
        } else {
          resolve(address.port);
        }
      });
    });
  }

  afterEach((cb) => {
    if (server) {
      server.close(cb);
      server = undefined;
    } else {
      cb();
    }
  });

  it('should fetch UTF-8 HTML', async () => {
    const port = await createTestServer('text/html', TEST_HTML);
    const $ = await cheerio.fromURL(`http://localhost:${port}`);

    expect($.html()).toBe(
      `<html><head></head><body>${TEST_HTML}</body></html>`
    );
  });

  it('should fetch UTF-16 HTML', async () => {
    const port = await createTestServer(
      'text/html; charset=utf-16le',
      TEST_HTML_UTF16
    );
    const $ = await cheerio.fromURL(`http://localhost:${port}`);

    expect($.html()).toBe(
      `<html><head></head><body>${TEST_HTML}</body></html>`
    );
  });

  it('should parse XML based on Content-Type', async () => {
    const port = await createTestServer('text/xml', TEST_HTML);
    const $ = await cheerio.fromURL(`http://localhost:${port}`);

    expect($.html()).toBe(TEST_HTML);
  });
});
