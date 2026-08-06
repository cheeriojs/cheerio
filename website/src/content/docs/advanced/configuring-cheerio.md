---
sidebar_position: 2
description: Configure Cheerio to work with different documents.
---

# Configuring Cheerio

Cheerio ships with two parsers and picks between them based on the options you
pass to `.load()`:

- [`parse5`](https://parse5.js.org/) — the default for HTML. It rigorously
  conforms to the HTML standard, so it produces the same tree a browser would.
- [`htmlparser2`](https://github.com/fb55/htmlparser2) — the default for XML.
  It is faster, uses less memory, and is more forgiving of malformed markup.

This guide covers how to configure each of them.

## Parsing HTML with parse5

`parse5` is used automatically for HTML. To change how it parses, pass an
options object as the second argument to `.load()`:

```js
import * as cheerio from 'cheerio';

// With scripting disabled, the contents of <noscript> are parsed as HTML.
const $ = cheerio.load('<noscript><h1>Nested Tag!</h1></noscript>', {
  scriptingEnabled: false,
});
```

For a full list of options and their effects, have a look at
[the API documentation](/docs/api/interfaces/CheerioOptions).

### Fragment Mode

By default, `parse5` treats its input as a complete document and wraps the
content in `<html>`, `<head>`, and `<body>` elements — exactly as a browser
would:

```js
const $ = cheerio.load('<li>Apple</li><li>Banana</li>');

$.html(); // => '<html><head></head><body><li>Apple</li><li>Banana</li></body></html>'
```

Pass `false` as the third argument to parse the input as a fragment instead,
without adding the surrounding document structure:

```js
const $ = cheerio.load('<li>Apple</li><li>Banana</li>', {}, false);

$.html(); // => '<li>Apple</li><li>Banana</li>'
```

This is usually what you want when the input is a snippet of a larger page — a
table row or a list item, say — rather than a page of its own.

## Parsing XML with htmlparser2

To parse a document as XML, set the `xml` option. Cheerio then uses
`htmlparser2`, which — unlike `parse5` — will not add HTML-specific structure or
apply HTML parsing rules:

```js
const $ = cheerio.load('<ul id="fruits">...</ul>', {
  xml: true,
});
```

If you need to customize the parsing options for XML input, you may pass an
object as the `xml` option to `.load()`, with the options you want to change:

```js
const $ = cheerio.load('<ul id="fruits">...</ul>', {
  xml: {
    withStartIndices: true,
  },
});
```

When `xml` is set, the default options are:

```js
{
    xmlMode: true, // Enable htmlparser2's XML mode.
    decodeEntities: true, // Decode HTML entities.
    withStartIndices: false, // Add a `startIndex` property to nodes.
    withEndIndices: false, // Add an `endIndex` property to nodes.
}
```

These options are passed straight through to `htmlparser2`, so anything valid
there is valid here. For a full list, see
[the API documentation](/docs/api/interfaces/HTMLParser2Options).

### Using `htmlparser2` for HTML

You may want `htmlparser2` to parse HTML too — if you are upgrading from a
pre-1.0 release of Cheerio (which used it by default), if the browser parsing
rules `parse5` applies get in your way (`htmlparser2` is more forgiving[^1]), or
if you are in a performance-critical situation (it is faster and the resulting
DOM uses less memory).

[^1]:
    "More forgiving" means `htmlparser2` has error-correcting mechanisms that
    aren't always a match for the standards observed by web browsers. This
    behavior may be useful when parsing non-HTML content.

To do that, disable `xmlMode` inside the `xml` option:

```js
const $ = cheerio.load('<ul id="fruits">...</ul>', {
  xml: {
    // Disable `xmlMode` to parse HTML with htmlparser2.
    xmlMode: false,
  },
});
```

:::tip[The slim export]

If you never need `parse5`, import Cheerio's _slim_ export instead. It always
uses `htmlparser2` and leaves `parse5` out of the bundle entirely — worth doing
in browser environments:

```js
import * as cheerio from 'cheerio/slim';
```

:::

`.load()` also accepts an already-parsed, `htmlparser2`-compatible document as
its first argument:

```js
import * as htmlparser2 from 'htmlparser2';

const dom = htmlparser2.parseDocument(document, options);
const $ = cheerio.load(dom);
```

:::warning

This route still uses `parse5`'s serializer, so `$.html()` returns HTML rather
than XML and ignores the options you passed to `htmlparser2`. Disabling
`xmlMode` as shown above is the recommended approach.

:::
