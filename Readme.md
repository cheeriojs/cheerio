<h1 align="center">cheerio</h1>

<h5 align="center">Fast, flexible & lean implementation of core jQuery designed specifically for the server.</h5>

<div align="center">
  <a href="https://github.com/cheeriojs/cheerio/actions?query=workflow%3ACI+branch%3Amain">
    <img src="https://img.shields.io/github/workflow/status/cheeriojs/cheerio/CI/main" alt="Build Status">
  </a>
  <a href="https://coveralls.io/github/cheeriojs/cheerio">
    <img src="https://img.shields.io/coveralls/github/cheeriojs/cheerio/main" alt="Coverage">
  </a>
  <a href="#backers">
    <img src="https://img.shields.io/opencollective/backers/cheerio" alt="OpenCollective backers">
  </a>
  <a href="#sponsors">
    <img src="https://img.shields.io/opencollective/sponsors/cheerio" alt="OpenCollective sponsors">
  </a>
</div>

<br>

[中文文档 (Chinese Readme)](https://github.com/cheeriojs/cheerio/wiki/Chinese-README)

```js
const cheerio = require('cheerio');
const $ = cheerio.load('<h2 class="title">Hello world</h2>');

$('h2.title').text('Hello there!');
$('h2').addClass('welcome');

$.html();
//=> <html><head></head><body><h2 class="title welcome">Hello there!</h2></body></html>
```

## Note

We are currently working on the 1.0.0 release of cheerio on the `main` branch. The source code for the last published version, `0.22.0`, can be found [here](https://github.com/cheeriojs/cheerio/tree/aa90399c9c02f12432bfff97b8f1c7d8ece7c307).

## Installation

`npm install cheerio`

## Features

**&#10084; Familiar syntax:**
Cheerio implements a subset of core jQuery. Cheerio removes all the DOM inconsistencies and browser cruft from the jQuery library, revealing its truly gorgeous API.

**&#991; Blazingly fast:**
Cheerio works with a very simple, consistent DOM model. As a result parsing, manipulating, and rendering are incredibly efficient.

**&#10049; Incredibly flexible:**
Cheerio wraps around [parse5](https://github.com/inikulin/parse5) parser and can optionally use @FB55's forgiving [htmlparser2](https://github.com/fb55/htmlparser2/). Cheerio can parse nearly any HTML or XML document.

## Cheerio is not a web browser

Cheerio parses markup and provides an API for traversing/manipulating the resulting data structure. It does not interpret the result as a web browser does. Specifically, it does _not_ produce a visual rendering, apply CSS, load external resources, or execute JavaScript which is common for a SPA (single page application). This makes Cheerio **much, much faster than other solutions**. If your use case requires any of this functionality, you should consider browser automation software like [Puppeteer](https://github.com/puppeteer/puppeteer) and [Playwright](https://github.com/microsoft/playwright) or DOM emulation projects like [JSDom](https://github.com/jsdom/jsdom).

## API

### Markup example we'll be using:

```html
<ul id="fruits">
  <li class="apple">Apple</li>
  <li class="orange">Orange</li>
  <li class="pear">Pear</li>
</ul>
```

This is the HTML markup we will be using in all of the API examples.

### Loading

First you need to load in the HTML. This step in jQuery is implicit, since jQuery operates on the one, baked-in DOM. With Cheerio, we need to pass in the HTML document.

This is the _preferred_ method:

```js
// ES6 or TypeScript:
import * as cheerio from 'cheerio';

// In other environments:
const cheerio = require('cheerio');

const $ = cheerio.load('<ul id="fruits">...</ul>');

$.html();
//=> <html><head></head><body><ul id="fruits">...</ul></body></html>
```

Similar to web browser contexts, `load` will introduce `<html>`, `<head>`, and `<body>` elements if they are not already present. You can set `load`'s third argument to `false` to disable this.

```js
const $ = cheerio.load('<ul id="fruits">...</ul>', null, false);

$.html();
//=> '<ul id="fruits">...</ul>'
```

Optionally, you can also load in the HTML by passing the string as the context:

```js
$('ul', '<ul id="fruits">...</ul>');
```

Or as the root:

```js
$('li', 'ul', '<ul id="fruits">...</ul>');
```

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

The options in the `xml` object are taken directly from [htmlparser2](https://github.com/fb55/htmlparser2/wiki/Parser-options), therefore any options that can be used in `htmlparser2` are valid in cheerio as well. When `xml` is set, the default options are:

```js
{
    xmlMode: true,
    decodeEntities: true, // Decode HTML entities.
    withStartIndices: false, // Add a `startIndex` property to nodes.
    withEndIndices: false, // Add an `endIndex` property to nodes.
}
```

For a full list of options and their effects, see [domhandler](https://github.com/fb55/DomHandler) and
[htmlparser2's options](https://github.com/fb55/htmlparser2/wiki/Parser-options).

#### Using `htmlparser2`

Cheerio ships with two parsers, `parse5` and `htmlparser2`. The
former is the default for HTML, the latter the default for XML.

Some users may wish to parse markup with the `htmlparser2` library, and
traverse/manipulate the resulting structure with Cheerio. This may be the case
for those upgrading from pre-1.0 releases of Cheerio (which relied on
`htmlparser2`), for those dealing with invalid markup (because `htmlparser2` is
more forgiving), or for those operating in performance-critical situations
(because `htmlparser2` may be faster in some cases). Note that "more forgiving"
means `htmlparser2` has error-correcting mechanisms that aren't always a match
for the standards observed by web browsers. This behavior may be useful when
parsing non-HTML content.

To support these cases, `load` also accepts a `htmlparser2`-compatible data
structure as its first argument. Users may install `htmlparser2`, use it to
parse input, and pass the result to `load`:

```js
// Usage as of htmlparser2 version 6:
const htmlparser2 = require('htmlparser2');
const dom = htmlparser2.parseDocument(document, options);

const $ = cheerio.load(dom);
```

If you want to save some bytes, you can use Cheerio's _slim_ export, which
always uses `htmlparser2`:

```js
const cheerio = require('cheerio/lib/slim');
```

### Selectors

Cheerio's selector implementation is nearly identical to jQuery's, so the API is very similar.

#### \$( selector, [context], [root] )

`selector` searches within the `context` scope which searches within the `root` scope. `selector` and `context` can be a string expression, DOM Element, array of DOM elements, or cheerio object. `root` is typically the HTML document string.

This selector method is the starting point for traversing and manipulating the document. Like jQuery, it's the primary method for selecting elements in the document.

```js
$('.apple', '#fruits').text();
//=> Apple

$('ul .pear').attr('class');
//=> pear

$('li[class=orange]').html();
//=> Orange
```

##### XML Namespaces

You can select with XML Namespaces but [due to the CSS specification](https://www.w3.org/TR/2011/REC-css3-selectors-20110929/#attribute-selectors), the colon (`:`) needs to be escaped for the selector to be valid.

```js
$('[xml\\:id="main"');
```

### Rendering

When you're ready to render the document, you can call the `html` method on the "root" selection:

```js
$.root().html();
//=>  <html>
//      <head></head>
//      <body>
//        <ul id="fruits">
//          <li class="apple">Apple</li>
//          <li class="orange">Orange</li>
//          <li class="pear">Pear</li>
//        </ul>
//      </body>
//    </html>
```

If you want to render the [`outerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML) of a selection, you can use the `html` utility functon:

```js
cheerio.html($('.pear'));
//=> <li class="pear">Pear</li>
```

You may also render the text content of a Cheerio object using the `text` static method:

```js
const $ = cheerio.load('This is <em>content</em>.');
cheerio.text($('body'));
//=> This is content.
```

### Plugins

Once you have loaded a document, you may extend the prototype or the equivalent `fn` property with custom plugin methods:

```js
const $ = cheerio.load('<html><body>Hello, <b>world</b>!</body></html>');
$.prototype.logHtml = function () {
  console.log(this.html());
};

$('body').logHtml(); // logs "Hello, <b>world</b>!" to the console
```

If you're using TypeScript, you should add a type definition for your new method:

```ts
declare module 'cheerio' {
  interface Cheerio<T> {
    logHtml(this: Cheerio<T>): void;
  }
}
```

### The "DOM Node" object

Cheerio collections are made up of objects that bear some resemblance to [browser-based DOM nodes](https://developer.mozilla.org/en-US/docs/Web/API/Node). You can expect them to define the following properties:

- `tagName`
- `parentNode`
- `previousSibling`
- `nextSibling`
- `nodeValue`
- `firstChild`
- `childNodes`
- `lastChild`

## Screencasts

[https://vimeo.com/31950192](https://vimeo.com/31950192)

> This video tutorial is a follow-up to Nettut's "How to Scrape Web Pages with Node.js and jQuery", using cheerio instead of JSDOM + jQuery. This video shows how easy it is to use cheerio and how much faster cheerio is than JSDOM + jQuery.

## Cheerio in the real world

Are you using cheerio in production? Add it to the [wiki](https://github.com/cheeriojs/cheerio/wiki/Cheerio-in-Production)!

## Sponsors

Does your company use Cheerio in production? Please consider [sponsoring this project](https://github.com/cheeriojs/cheerio?sponsor=1)! Your help will allow maintainers to dedicate more time and resources to its development and support.

<!-- BEGIN SPONSORS: sponsor -->

<a href="https://cryptocasinos.com/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fcryptocasinos%2F99b168e%2Flogo.png?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=5c862b89514b97911c56b703efceba0c" title="CryptoCasinos" alt="CryptoCasinos"></img>
          </a>
<a href="https://www.casinoonlineaams.com" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fcasinoonlineaamscom%2Fc59b0fd%2Flogo.png?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=f4ad018ea50d1cab6d2f3c47eff9580e" title="Casinoonlineaams.com" alt="Casinoonlineaams.com"></img>
          </a>
<a href="https://apify.com/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F24586296%3Fv%3D4%26s%3D128?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=eff582035ec78f28921aa8b2a8c6d20c" title="Apify" alt="Apify"></img>
          </a>
<a href="https://freebets.ltd.uk" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Ffreebets%2Fe21c41b%2Flogo.png?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=674d8250d81daaff54ee1c4145b254d0" title="Free Bets" alt="Free Bets"></img>
          </a>
<a href="https://casinoutansvensklicens.co/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fcasino-utan-svensk-licens3%2Ff7e9357%2Flogo.png?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=fa1d880ffb9d3095e39c3ad8133ab3b0" title="Casino utan svensk licens" alt="Casino utan svensk licens"></img>
          </a>
<a href="https://starwarscasinos.com/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fcasino-utan-svensk-licens1%2Ff3487ff%2Flogo.png?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=52d0cb779701427f42234148d6c46b41" title="Casino utan svensk licens" alt="Casino utan svensk licens"></img>
          </a>
<a href="https://www.casinoutanlicens.io/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fcasino-utan-svensk-licens2%2Fa3efb14%2Flogo.png?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=082dd6257d3f087021157e545b001b12" title="Casino utan svensk licens" alt="Casino utan svensk licens"></img>
          </a>
<a href="https://www.zenrows.com" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fzenrows%2F3199d4b%2Flogo.png?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=c0ab419ba46652a2e9053d74763a5ac2" title="ZenRows" alt="ZenRows"></img>
          </a>
<a href="https://scommessesportivemania.com/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fscommessesportivemania-com%2Fe6941a3%2Favatar.png?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=d4b9275b907e65d379e92df47c6396e6" title="Scommessesportivemania.com" alt="Scommessesportivemania.com"></img>
          </a>

<!-- END SPONSORS -->

## Backers

[Become a backer](https://github.com/cheeriojs/cheerio?sponsor=1) to show your support for Cheerio and help us maintain and improve this open source project.

<!-- BEGIN SPONSORS: backer -->

<a href="https://www.airbnb.com/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fairbnb%2Fd327d66%2Flogo.png?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=75f53daaf6503f0b7a4bfc9e0291f080" title="Airbnb" alt="Airbnb"></img>
          </a>
<a href="https://kafidoff.com" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fkafidoff-vasy%2Fd7ff85c%2Favatar.png?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=1cf69937546042e8d619ccc08eceb84b" title="Vasy Kafidoff" alt="Vasy Kafidoff"></img>
          </a>
<a href="https://medium.com/norch" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fespenklem%2F6075b19%2Favatar.png?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=e14ff28e878a10d43572a6756b82bdff" title="Espen Klem" alt="Espen Klem"></img>
          </a>
<a href="https://jarrodldavis.com" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F235875%3Fv%3D4%26s%3D128?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=0c9f32dcf50440fb88c92ec40a36e52b" title="Jarrod Davis" alt="Jarrod Davis"></img>
          </a>
<a href="https://nishantsingh.in" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F10304344%3Fu%3D2f98c0a745b5352c6e758b9a5bc7a9d9d4e3e969%26v%3D4%26s%3D128?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=40fdfafc2572d73a37dd6bfb86cf9b12" title="Nishant Singh" alt="Nishant Singh"></img>
          </a>
<a href="https://github.com/gauthamchandra" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F5430280%3Fu%3D1115bcd3ed7aa8b2a62ff28f62ee4c2b92729903%26v%3D4%26s%3D128?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=b220da777e47e4ce9f613cedcb240a99" title="Gautham Chandra" alt="Gautham Chandra"></img>
          </a>
<a href="http://www.dr-chuck.com/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F1197222%3Fu%3Dd6dc85c064736ab851c6d9e3318dcdd1be00fb2c%26v%3D4%26s%3D128?ixlib=js-3.6.0&w=128&h=128&fit=fillmax&fill=solid&s=386d461e371c52e262ad5ee66f6826fe" title="Charles Severance" alt="Charles Severance"></img>
          </a>

<!-- END SPONSORS -->

## Special Thanks

This library stands on the shoulders of some incredible developers. A special thanks to:

**&#8226; @FB55 for node-htmlparser2 & CSSSelect:**
Felix has a knack for writing speedy parsing engines. He completely re-wrote both @tautologistic's `node-htmlparser` and @harry's `node-soupselect` from the ground up, making both of them much faster and more flexible. Cheerio would not be possible without his foundational work

**&#8226; @jQuery team for jQuery:**
The core API is the best of its class and despite dealing with all the browser inconsistencies the code base is extremely clean and easy to follow. Much of cheerio's implementation and documentation is from jQuery. Thanks guys.

**&#8226; @visionmedia:**
The style, the structure, the open-source"-ness" of this library comes from studying TJ's style and using many of his libraries. This dude consistently pumps out high-quality libraries and has always been more than willing to help or answer questions. You rock TJ.

## License

MIT
