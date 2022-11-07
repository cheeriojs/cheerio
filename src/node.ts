export * from './index.js';

import type { CheerioAPI, CheerioOptions } from './index.js';
import { load } from './index.js';
import { flatten as flattenOptions, InternalOptions } from './options.js';
import { adapter as htmlparser2Adapter } from 'parse5-htmlparser2-tree-adapter';

// eslint-disable-next-line node/file-extension-in-import
import { WritableStream as Htmlparser2Stream } from 'htmlparser2/lib/WritableStream';
import DomHandler from 'domhandler';
import { ParserStream as Parse5Stream } from 'parse5-parser-stream';
import { DecodeStream, type SnifferOptions } from 'encoding-sniffer';
import * as undici from 'undici';
import MIMEType from 'whatwg-mimetype';
import { type Writable, finished } from 'node:stream';

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

export function stringStream(
  options: CheerioOptions,
  cb: (err: Error | null | undefined, $: CheerioAPI) => void
): Writable {
  return _stringStream(flattenOptions(options), cb);
}

export interface DecodeStreamOptions extends CheerioOptions {
  encoding?: SnifferOptions;
}

export function decodeStream(
  options: DecodeStreamOptions,
  cb: (err: Error | null | undefined, $: CheerioAPI) => void
): Writable {
  const { encoding = {}, ...cheerioOptions } = options;
  const opts = flattenOptions(cheerioOptions);

  // Set the encoding to UTF8 for XML mode
  encoding.defaultEncoding ??= opts?.xmlMode ? 'utf8' : 'windows-1252';

  const decodeStream = new DecodeStream(encoding);
  const loadStream = _stringStream(opts, cb);

  decodeStream.pipe(loadStream);

  return decodeStream;
}

interface CheerioRequestOptions extends DecodeStreamOptions {
  requestOptions?: Parameters<typeof undici.stream>[1];
}

// Get a document from a URL
export async function request(
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  url: string | URL,
  options: CheerioRequestOptions = {}
): Promise<CheerioAPI> {
  const {
    requestOptions = { method: 'GET' },
    encoding = {},
    ...cheerioOptions
  } = options;
  let undiciStream: Promise<undici.Dispatcher.StreamData> | undefined;

  requestOptions.method ??= 'GET';

  const promise = new Promise<CheerioAPI>((resolve, reject) => {
    undiciStream = undici.stream(url, requestOptions, (res) => {
      // TODO Add support for handling status codes, such as redirects.
      if (!res.statusCode) {
        throw new Error(`Received ${res.statusCode}`);
      }

      const contentType = res.headers['content-type'];
      const mimeType = new MIMEType(contentType ?? 'text/html');

      if (!mimeType.isHTML() && !mimeType.isXML()) {
        throw new RangeError(
          `The content-type "${contentType}" is neither HTML nor XML.`
        );
      }

      // Forward the charset from the header to the decodeStream.
      encoding.transportLayerEncodingLabel ??=
        mimeType.parameters.get('charset');

      const opts = {
        ...flattenOptions(cheerioOptions),
        encoding,
        // Set XML mode based on the MIME type.
        xmlMode: mimeType.isXML(),
        // TODO: Set the baseURL based on the final URL.
        baseURL: (res.context as any)?.url,
      };

      return decodeStream(opts, (err, $) => (err ? reject(err) : resolve($)));
    });
  });

  // Let's make sure the request is completed before returning the promise.
  await undiciStream;

  return promise;
}