---
sidebar_position: 2
---

# Configuring Cheerio

Cheerio ships with two parsers, `parse5` and `htmlparser2`. The former is the
default for HTML, the latter the default for XML.

If you need to modify parsing options for XML input, you may pass an extra
object to `.load()`:

```js
const $ = cheerio.load('<ul id="fruits">...</ul>', {
  xml: {
    xmlMode: true,
    withStartIndices: true,
  },
});
```

The options in the `xml` object are taken directly from
[htmlparser2](https://github.com/fb55/htmlparser2/wiki/Parser-options),
therefore any options that can be used in `htmlparser2` are valid in cheerio as
well. When `xml` is set, the default options are:

```js
{
    xmlMode: true,
    decodeEntities: true, // Decode HTML entities.
    withStartIndices: false, // Add a `startIndex` property to nodes.
    withEndIndices: false, // Add an `endIndex` property to nodes.
}
```

For a full list of options and their effects, see
[domhandler](https://github.com/fb55/DomHandler) and
[htmlparser2's options](https://github.com/fb55/htmlparser2/wiki/Parser-options).

#### Using `htmlparser2`

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

To support these cases, `load` also accepts a `htmlparser2`-compatible data
structure as its first argument. Users may install `htmlparser2`, use it to
parse input, and pass the result to `load`:

```js
// Usage as of htmlparser2 version 6:
const htmlparser2 = require('htmlparser2');
const dom = htmlparser2.parseDocument(document, options);

const $ = cheerio.load(dom);
```

You can also use Cheerio's _slim_ export, which always uses `htmlparser2`. This
avoids loading `parse5`, which saves some bytes eg. in browser environments:

```js
const cheerio = require('cheerio/lib/slim');
```
