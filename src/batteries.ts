export * from './index.js';

/* eslint-disable n/no-unsupported-features/node-builtins */

import type { CheerioAPI, CheerioOptions } from './index.js';
import { load } from './index.js';
import { flatten as flattenOptions, type InternalOptions } from './options.js';
import { adapter as htmlparser2Adapter } from 'parse5-htmlparser2-tree-adapter';

// eslint-disable-next-line n/file-extension-in-import
import { WritableStream as Htmlparser2Stream } from 'htmlparser2/lib/WritableStream';
import DomHandler from 'domhandler';
import { ParserStream as Parse5Stream } from 'parse5-parser-stream';
import {
  decodeBuffer,
  DecodeStream,
  type SnifferOptions,
} from 'encoding-sniffer';
import * as undici from 'undici';
import MIMEType from 'whatwg-mimetype';
import { type Writable, finished } from 'node:stream';

/**
 * Sniffs the encoding of a buffer, then creates a querying function bound to a
 * document created from the buffer.
 *
 * @param buffer - The buffer to sniff the encoding of.
 * @param options - The options to pass to Cheerio.
 * @returns The loaded document.
 */
export function loadBuffer(
  buffer: Buffer,
  options: DecodeStreamOptions = {}
): CheerioAPI {
  const opts = flattenOptions(options);
  const str = decodeBuffer(buffer, {
    defaultEncoding: opts?.xmlMode ? 'utf8' : 'windows-1252',
    ...options.encoding,
  });

  return load(str, opts);
}

function _stringStream(
  options: InternalOptions | undefined,
  cb: (err: Error | null | undefined, $: CheerioAPI) => void
): Writable {
  if (options && (options.xmlMode || options._useHtmlParser2)) {
    const handler: DomHandler = new DomHandler(
      (err) => cb(err, load(handler.root)),
      options
    );

    return new Htmlparser2Stream(handler, options);
  }

  const stream = new Parse5Stream({
    ...options,
    treeAdapter: htmlparser2Adapter,
  });

  finished(stream, (err) => cb(err, load(stream.document)));

  return stream;
}

/**
 * Creates a stream that parses a sequence of strings into a document.
 *
 * The stream is a `Writable` stream that accepts strings. When the stream is
 * finished, the callback is called with the loaded document.
 *
 * @param options - The options to pass to Cheerio.
 * @param cb - The callback to call when the stream is finished.
 * @returns The writable stream.
 */
export function stringStream(
  options: CheerioOptions,
  cb: (err: Error | null | undefined, $: CheerioAPI) => void
): Writable {
  return _stringStream(flattenOptions(options), cb);
}

export interface DecodeStreamOptions extends CheerioOptions {
  encoding?: SnifferOptions;
}

/**
 * Parses a stream of buffers into a document.
 *
 * The stream is a `Writable` stream that accepts buffers. When the stream is
 * finished, the callback is called with the loaded document.
 *
 * @param options - The options to pass to Cheerio.
 * @param cb - The callback to call when the stream is finished.
 * @returns The writable stream.
 */
export function decodeStream(
  options: DecodeStreamOptions,
  cb: (err: Error | null | undefined, $: CheerioAPI) => void
): Writable {
  const { encoding = {}, ...cheerioOptions } = options;
  const opts = flattenOptions(cheerioOptions);

  // Set the default encoding to UTF-8 for XML mode
  encoding.defaultEncoding ??= opts?.xmlMode ? 'utf8' : 'windows-1252';

  const decodeStream = new DecodeStream(encoding);
  const loadStream = _stringStream(opts, cb);

  decodeStream.pipe(loadStream);

  return decodeStream;
}

type UndiciStreamOptions = Parameters<typeof undici.stream>[1];

export interface CheerioRequestOptions extends DecodeStreamOptions {
  /** The options passed to `undici`'s `stream` method. */
  requestOptions?: UndiciStreamOptions;
}

const defaultRequestOptions: UndiciStreamOptions = {
  method: 'GET',
  // Allow redirects by default
  maxRedirections: 5,
  // NOTE: `throwOnError` currently doesn't work https://github.com/nodejs/undici/issues/1753
  throwOnError: true,
  // Set an Accept header
  headers: {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  },
};

/**
 * `fromURL` loads a document from a URL.
 *
 * By default, redirects are allowed and non-2xx responses are rejected.
 *
 * @param url - The URL to load the document from.
 * @param options - The options to pass to Cheerio.
 * @returns The loaded document.
 */
export async function fromURL(
  url: string | URL,
  options: CheerioRequestOptions = {}
): Promise<CheerioAPI> {
  const {
    requestOptions = defaultRequestOptions,
    encoding = {},
    ...cheerioOptions
  } = options;
  let undiciStream: Promise<undici.Dispatcher.StreamData> | undefined;

  // Add headers if none were supplied.
  requestOptions.headers ??= defaultRequestOptions.headers;

  const promise = new Promise<CheerioAPI>((resolve, reject) => {
    undiciStream = undici.stream(url, requestOptions, (res) => {
      const contentType = res.headers['content-type'];
      const mimeType = new MIMEType(contentType ?? 'text/html');

      if (!mimeType.isHTML() && !mimeType.isXML()) {
        throw new RangeError(
          `The content-type "${contentType}" is neither HTML nor XML.`
        );
      }

      // Forward the charset from the header to the decodeStream.
      encoding.transportLayerEncodingLabel = mimeType.parameters.get('charset');

      /*
       * If we allow redirects, we will have entries in the history.
       * The last entry will be the final URL.
       */
      const history = (
        res.context as
          | {
              history?: URL[];
            }
          | undefined
      )?.history;

      const opts = {
        encoding,
        // Set XML mode based on the MIME type.
        xmlMode: mimeType.isXML(),
        // Set the `baseURL` to the final URL.
        baseURL: history ? history[history.length - 1] : url,
        ...cheerioOptions,
      };

      return decodeStream(opts, (err, $) => (err ? reject(err) : resolve($)));
    });
  });

  // Let's make sure the request is completed before returning the promise.
  await undiciStream;

  return promise;
}
