---
sidebar_position: 2
description: A walkthrough of different loading methods.
---

# Loading Documents

In this guide, we'll take a look at how to load documents with Cheerio and when
to use the different loading methods.

:::tip

If you're familiar with jQuery, then this step will be new to you. jQuery
operates on the one, baked-in DOM. With Cheerio, we need to pass in the HTML
document.

:::

:::danger Availability of methods

Only the `load` method is available by default. If you are using current NodeJS
version, other methods will be available if you use an ES Module imports (your
file has a `.mjs` extension, or you have `type: "module"` in your
`package.json`). You can also directly import or require
`cheerio/lib/batteries`.

<details>
<summary>Why is that the case?</summary>

The methods that are not available by default have dependencies that use the
[`node:` protocol](https://nodejs.org/api/esm.html#node-imports). This protocol
is only supported for ES Modules in Node 12. To maintain compatibility with Node
12, we only provide methods besides `load` when you use an ES Module import.

</details>

:::

## `load`

The load method is the most basic way to parse an HTML or XML document with
Cheerio. It takes a string containing the document as its argument and returns a
Cheerio object that you can use to traverse and manipulate the document.

Here's an example of how to use the load method:

```js
import * as cheerio from 'cheerio';

const $ = cheerio.load('<html><body><h1>Hello, world!</h1></body></html>');

console.log($('title').text());
// Output: Hello, world!
```

:::tip

Similar to web browser contexts, `load` will introduce `<html>`, `<head>`, and
`<body>` elements if they are not already present. You can set `load`'s third
argument to `false` to disable this.

```js
const $ = cheerio.load('<ul id="fruits">...</ul>', null, false);

$.html();
//=> '<ul id="fruits">...</ul>'
```

:::

Learn more about the `load` method in the [API documentation](/docs/api/#load).

## `loadBuffer`

The `loadBuffer` method is similar to the `load` method, but it takes a buffer
containing the document as its argument instead of a string. Cheerio will run
the HTML encoding sniffing algorithm to determine the encoding of the document.
This is useful when you have the document in binary form, such as when you're
reading it from a file or receiving it over a network connection.

Here's an example of how to use the `loadBuffer` method:

```js
import * as cheerio from 'cheerio';
import * as fs from 'fs';

const buffer = fs.readFileSync('document.html');

const $ = cheerio.loadBuffer(buffer);

console.log($('title').text());
// Output: Hello, world!
```

Learn more about the `loadBuffer` method in the
[API documentation](/docs/api/#loadbuffer).

## `stringStream`

When loading an HTML document from a stream and the encoding is known, you can
use the `stringStream` method to parse it into a Cheerio object.

```js
import * as cheerio from 'cheerio';
import * as fs from 'fs';

const writeStream = cheerio.stringStream({}, (err, $) => {
  if (err) {
    // Handle error
  }

  console.log($('title').text());
  // Output: Hello, world!
});

fs.createReadStream('document.html', { encoding: 'utf8' }).pipe(writeStream);
```

Learn more about the `stringStream` method in the
[API documentation](/docs/api/#stringstream).

## `decodeStream`

When loading an HTML document from a stream and the encoding is not known, you
can use the `decodeStream` method to parse it into a Cheerio object. This method
runs the HTML encoding sniffing algorithm to determine the encoding of the
document.

Here's an example of how to use the `decodeStream` method:

```js
import * as cheerio from 'cheerio';
import * as fs from 'fs';

const writeStream = cheerio.decodeStream({}, (err, $) => {
  if (err) {
    // Handle error
  }

  console.log($('title').text());
  // Output: Hello, world!
});

fs.createReadStream('document.html').pipe(writeStream);
```

Learn more about the `decodeStream` method in the
[API documentation](/docs/api/#decodestream).

## `fromURL`

The `fromURL` method allows you to load a document from a URL. This method is
asynchronous, so you need to use `await` (or a `then` block) to access the
resulting Cheerio object.

```js
import * as cheerio from 'cheerio';

const $ = await cheerio.fromURL('https://example.com');
```

Learn more about the `fromURL` method in the
[API documentation](/docs/api/#fromurl).

## Conclusion

Cheerio provides several methods for loading HTML documents and parsing them
into a DOM structure. These methods are useful for different scenarios,
depending on the type and source of the HTML data. Users are encouraged to read
through each of these methods and pick the one that best suits their needs.

<!-- Based on ChatGPT with the prompt: Write a guide in Markdown for loading documents with Cheerio, explaining when to use `load`, `loadBuffer`, `stringStream`, `decodeStream`, and `fromURL`. Methods that deal with binary data run the HTML encoding sniffing algorithm and are recommended when the encoding is not known. The guide should be ready to be published on Cheerio's website. Use modern JavaScript with imports in the examples. -->
