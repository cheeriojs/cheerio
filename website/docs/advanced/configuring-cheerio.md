---
sidebar_position: 2
description: Configure Cheerio to work with different documents.
---

# Configuring Cheerio

In this guide, we'll cover how to configure Cheerio to work with different types
of documents, and how to use and configure the different parsers that ship with
the library.

## Parsing HTML with parse5

By default, Cheerio uses the [`parse5`](https://parse5.js.org/) parser for HTML
documents. `parse5` is an excellent project that rigorously conforms to the HTML
standard. However, if you need to modify parsing options for HTML input, you may
pass an extra object to `.load()`:

```js
const cheerio = require('cheerio');
const $ = cheerio.load('<noscript><h1>Nested Tag!</h1></noscript>', {
  scriptingEnabled: false,
});
```

For example, if you want the contents of `<noscript>` tags to be parsed as HTML,
you can set the `scriptingEnabled` option to false.

For a full list of options and their effects, have a look at
[the API documentation](/docs/api/interfaces/Parse5Options).

### Fragment Mode

By default, `parse5` treats documents it receives as full HTML documents and
will structure content in an `<html>` document element with nested `<head>` and
`<body>` tags.

```js
const $ = cheerio.load('<li>Apple</li><li>Banana</li>');

$.html(); // => '<html><head></head><body><li>Apple</li><li>Banana</li></body></html>'
```

`parse5` also supports a "fragment mode" that allows you to parse HTML
fragments, rather than complete documents. To use this mode, pass a boolean
indicating whether you are parsing a full document to the `.load()` method:

```js
// Note that we are passing `false`, as we are not parsing a full document.
const $ = cheerio.load('<li>Apple</li><li>Banana</li>', {}, false);

$.html(); // => '<li>Apple</li><li>Banana</li>'
```

This will parse the HTML fragment as a standalone document, rather than treating
it as a part of a larger document.

## Parsing XML with htmlparser2

By default, Cheerio uses `htmlparser2` for XML documents. `htmlparser2` is a
fast and memory-efficient parser that can handle both HTML and XML. To parse
XML, pass the `xml` option to `.load()`:

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

The options in the xml object are taken directly from htmlparser2, therefore any
options that can be used in htmlparser2 are valid in cheerio as well.

For a full list of options and their effects, see
[the API documentation](/docs/api/interfaces/HTMLParser2Options).

### Using `htmlparser2` for HTML

Some users may wish to parse markup with the `htmlparser2` library, and traverse
and manipulate the resulting structure with Cheerio. This may be the case for
those upgrading from pre-1.0 releases of Cheerio (which relied on
`htmlparser2`), for those dealing with invalid markup (because `htmlparser2` is
more forgiving[^1]), or for those operating in performance-critical situations
(because `htmlparser2` is often faster and the resulting DOM consumes less
memory).

[^1]:
    Note that "more forgiving" means `htmlparser2` has error-correcting
    mechanisms that aren't always a match for the standards observed by web
    browsers. This behavior may be useful when parsing non-HTML content.

To support these cases, you can simply disable `xmlMode` inside of the `xml`
option:

```js
const $ = cheerio.load('<ul id="fruits">...</ul>', {
  xml: {
    // Disable `xmlMode` to parse HTML with htmlparser2.
    xmlMode: false,
  },
});
```

`.load()` also accepts a `htmlparser2`-compatible data structure as its first
argument. Users may install `htmlparser2`, use it to parse input, and pass the
result to `.load()`:

```js
import * as htmlparser2 from 'htmlparser2';
const dom = htmlparser2.parseDocument(document, options);

const $ = cheerio.load(dom);
```

The caveat of this method is that this will still use `parse5`'s serializer, so
the resulting output will be HTML, not XML, and not respect any of the supplied
options. Disabling `xmlMode`, as shown above, is therefore the recommended
approach.

:::tip

You can also use Cheerio's _slim_ export, which always uses `htmlparser2`. This
avoids loading `parse5`, which saves some bytes eg. in browser environments:

```js
import * as cheerio from 'cheerio/lib/slim';
```

:::

## Conclusion

In this guide, we explored how to configure Cheerio for parsing HTML and XML
documents using `parse5` and `htmlparser2` respectively. We also discussed how
to modify parsing options and use `htmlparser2` directly.
