export * from './index.js';

import type { CheerioAPI, CheerioOptions } from './index.js';
import { load } from './index.js';
import { flatten as flattenOptions } from './options.js';
import { adapter as htmlparser2Adapter } from 'parse5-htmlparser2-tree-adapter';

// eslint-disable-next-line node/file-extension-in-import
import { WritableStream as Htmlparser2Stream } from 'htmlparser2/lib/WritableStream';
import DomHandler from 'domhandler';
import { ParserStream as Parse5Stream } from 'parse5-parser-stream';
import { DecodeStream } from 'encoding-sniffer';
import { type Writable, finished } from 'node:stream';

export function stream(
  options: CheerioOptions,
  cb: (err: Error | null | undefined, $: CheerioAPI) => void
): Writable {
  const opts = flattenOptions(options);

  if (opts && (opts.xmlMode || opts._useHtmlParser2)) {
    const handler: DomHandler = new DomHandler(
      (err) => cb(err, load(handler.root)),
      opts
    );

    return new Htmlparser2Stream(handler, opts);
  }

  const stream = new Parse5Stream({ ...opts, treeAdapter: htmlparser2Adapter });

  finished(stream, (err) => cb(err, load(stream.document)));

  return stream;
}

// Get a document from a URL
export async function request(
  url: string | URL,
  options: CheerioOptions
): Promise<CheerioAPI> {
  const opts = flattenOptions(options);
  const str = stream(opts, (err, $) => {
    if (err) {
      throw err;
    }
  });

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
    },
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  str.write(res.body);
  str.end();

  return stream;
}
