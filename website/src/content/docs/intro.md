---
sidebar_position: 1
sidebar_label: Introduction
---

# Welcome to Cheerio!

Cheerio parses HTML and XML, and gives you a jQuery-like API for traversing and
manipulating the result. This page takes you from installation to your first
scrape in about five minutes.

:::note[Cheerio is not a web browser]

Cheerio parses markup and provides an API for working with the resulting data
structure. It does not interpret that markup the way a browser does:
there is no visual rendering, no CSS, no loading of external resources, and no
JavaScript execution. That is what makes Cheerio **much faster** than
browser-based tools — but it also means content that a single-page app renders
on the client won't be there.

If you need any of that, reach for browser automation such as
[Puppeteer](https://github.com/puppeteer/puppeteer) or
[Playwright](https://github.com/microsoft/playwright), or a DOM emulation
project like [jsdom](https://github.com/jsdom/jsdom).

:::

## Installation

Cheerio runs on Node.js 22.19 or later. Once you have
[Node.js](https://nodejs.org/en/download/) installed, add Cheerio to your
project:

```bash
npm install cheerio
```

Then import it:

```js
import * as cheerio from 'cheerio';
```

If you prefer CommonJS, `require` works too:

```js
const cheerio = require('cheerio');
```

## Loading a document

Every Cheerio session starts by loading a document. The simplest way is `load`,
which takes a string of markup:

```js
const $ = cheerio.load('<h2 class="title">Hello world</h2>');
```

`load` returns a `$` function that you use to query the document, just like
jQuery's `$`.

Cheerio can also load documents from buffers, streams, and URLs — see
[loading documents](/docs/basics/loading) for the full list.

## Selecting elements

Call `$` with a [CSS selector](/docs/basics/selecting) to find elements. Here we
select the `<h2>` with the class `title` and read its text:

```js
$('h2.title').text(); // "Hello world"
```

## Traversing the DOM

`$` returns a `Cheerio` object — a list of matched elements with methods for
moving around the document. For example, `find` searches within the current
selection:

```js
$('h2.title').find('.subtitle').text();
```

There are methods for moving up, down, and sideways through the tree, plus a
range of filters. See [traversing the DOM](/docs/basics/traversing).

## Manipulating elements

The same methods that read values also write them. Passing an argument to
`text()` replaces the text content, and methods like `after()` insert new
markup:

```js
$('h2.title').text('Hello there!');

$('h2').after('<h3>How are you?</h3>');
```

Call `$.html()` at any point to serialize the document back to a string. See
[manipulating elements](/docs/basics/manipulation) for the full set of methods.
