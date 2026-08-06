---
sidebar_position: 2
description: A walkthrough of different loading methods.
---

# Loading Documents

Before you can query a document, Cheerio has to parse it. Which method you reach
for depends on where the markup comes from and whether you know its character
encoding.

:::tip

If you're coming from jQuery, this step is new. jQuery operates on the one
baked-in DOM of the page it runs on; with Cheerio you pass in the document
yourself.

:::

| Method                          | Input                  | Use it when                                     |
| ------------------------------- | ---------------------- | ----------------------------------------------- |
| [`load`](#load)                 | string                 | You already have the markup as a string.        |
| [`loadBuffer`](#loadbuffer)     | `Buffer`               | You have raw bytes and the encoding is unknown. |
| [`stringStream`](#stringstream) | stream of decoded text | You're streaming and already know the encoding. |
| [`decodeStream`](#decodestream) | stream of raw bytes    | You're streaming and the encoding is unknown.   |
| [`fromURL`](#fromurl)           | URL                    | You want Cheerio to fetch the page for you.     |

The methods that accept bytes — `loadBuffer` and `decodeStream` — run the
[HTML encoding sniffing algorithm](https://html.spec.whatwg.org/multipage/parsing.html#determining-the-character-encoding),
so they will pick up a `<meta charset>` or a byte order mark. Prefer them
whenever you can't be sure the source is UTF-8.

:::danger[Browser environments]

Only `load` is available in the browser. `loadBuffer`, `stringStream`,
`decodeStream`, and `fromURL` rely on Node.js APIs and are not included in the
browser build.

:::

## `load`

`load` takes a string containing the document and returns a `$` function you can
use to traverse and manipulate it.

```js
import * as cheerio from 'cheerio';

const $ = cheerio.load('<h1>Hello, world!</h1>');

console.log($('h1').text());
// Output: Hello, world!
```

:::tip[Parsing fragments]

Like a browser, `load` adds `<html>`, `<head>`, and `<body>` elements if they
aren't already present. Pass `false` as the third argument to parse the input as
a fragment instead:

```js
const $ = cheerio.load('<ul id="fruits">...</ul>', null, false);

$.html();
//=> '<ul id="fruits">...</ul>'
```

See [Configuring Cheerio](/docs/advanced/configuring-cheerio#fragment-mode) for
details.

:::

Learn more about the `load` method in the
[API documentation](/docs/api/variables/load).

## `loadBuffer`

`loadBuffer` works like `load`, but takes a `Buffer` instead of a string. Cheerio
determines the encoding from the bytes themselves, which makes it the right
choice for files and network responses whose encoding you don't control.

```js
import * as cheerio from 'cheerio';
import * as fs from 'node:fs';

// The file may be UTF-8, ISO-8859-1, … — Cheerio works it out.
const $ = cheerio.loadBuffer(fs.readFileSync('document.html'));

console.log($('title').text());
```

Learn more about the `loadBuffer` method in the
[API documentation](/docs/api/functions/loadBuffer).

## `stringStream`

`stringStream` returns a writable stream that parses the document as it arrives.
Use it when the encoding is already known, so the stream can be decoded to text
before Cheerio sees it.

```js
import * as cheerio from 'cheerio';
import * as fs from 'node:fs';

const writeStream = cheerio.stringStream({}, (err, $) => {
  if (err) {
    // Handle error
    return;
  }

  console.log($('title').text());
});

fs.createReadStream('document.html', { encoding: 'utf8' }).pipe(writeStream);
```

The first argument holds [Cheerio's options](/docs/api/interfaces/CheerioOptions);
the second is a callback that receives the finished document.

Learn more about the `stringStream` method in the
[API documentation](/docs/api/functions/stringStream).

## `decodeStream`

`decodeStream` is the streaming counterpart to `loadBuffer`: it accepts raw bytes
and runs the encoding sniffing algorithm before parsing. Reach for it when
streaming a document of unknown encoding.

```js
import * as cheerio from 'cheerio';
import * as fs from 'node:fs';

const writeStream = cheerio.decodeStream({}, (err, $) => {
  if (err) {
    // Handle error
    return;
  }

  console.log($('title').text());
});

// Note: no `encoding` option — the bytes are passed through as-is.
fs.createReadStream('document.html').pipe(writeStream);
```

Learn more about the `decodeStream` method in the
[API documentation](/docs/api/functions/decodeStream).

## `fromURL`

`fromURL` is the one loader that fetches for you. It is asynchronous, so `await`
the result:

```js
import * as cheerio from 'cheerio';

const $ = await cheerio.fromURL('https://example.com');
```

It does rather more than a bare `fetch` would, and the details are worth
knowing:

- **Redirects** are followed, up to five of them.
- **Non-2xx responses reject** with an `undici` `ResponseError` carrying the
  status code, rather than handing you an error page to parse.
- **Non-markup responses reject** with a `RangeError`. If the `Content-Type` is
  neither HTML nor XML, `fromURL` refuses rather than parsing a PDF as HTML.
- **XML mode is chosen for you** from that same `Content-Type`, so an
  `application/xml` response is parsed as XML without your asking.
- **The encoding** comes from the `charset` parameter of the `Content-Type` when
  present, and from sniffing the bytes otherwise.
- **`baseURI` is set to the final URL** — after redirects. That is what lets
  `prop('href')` and [`extract`](/docs/basics/extract) hand you absolute links.

### Customizing the request

Pass `requestOptions` to control the request. These go to
[`undici`'s `stream` method](https://undici.nodejs.org/#/docs/api/Dispatcher?id=dispatcherstreamoptions-factory-callback):

```js
const $ = await cheerio.fromURL('https://example.com', {
  requestOptions: {
    method: 'GET',
    headers: {
      'user-agent': 'my-scraper/1.0 (+https://example.com/bot)',
    },
  },
});
```

:::warning[`requestOptions` replaces the defaults, it doesn't merge with them]

Supplying `requestOptions` discards the defaults entirely, so you must include
`method` yourself — omitting it fails with `method must be a string`. Custom
`headers` likewise replace the default `Accept` header rather than adding to it.

:::

Learn more about the `fromURL` method in the
[API documentation](/docs/api/functions/fromURL), and see
[Security](/docs/advanced/security) before pointing it at a URL that came from a
user.
