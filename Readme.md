<h1 align="center">cheerio</h1>

<h5 align="center">The fast, flexible, and elegant library for parsing and manipulating HTML and XML.</h5>

<div align="center">
  <a href="https://github.com/cheeriojs/cheerio/actions/workflows/ci.yml">
    <img src="https://github.com/cheeriojs/cheerio/actions/workflows/ci.yml/badge.svg" alt="Build Status">
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

## Installation

`npm install cheerio`

## Features

**&#10084; Proven syntax:** Cheerio implements a subset of core jQuery. Cheerio
removes all the DOM inconsistencies and browser cruft from the jQuery library,
revealing its truly gorgeous API.

**&#991; Blazingly fast:** Cheerio works with a very simple, consistent DOM
model. As a result parsing, manipulating, and rendering are incredibly
efficient.

**&#10049; Incredibly flexible:** Cheerio wraps around
[parse5](https://github.com/inikulin/parse5) for parsing HTML and can optionally
use the forgiving [htmlparser2](https://github.com/fb55/htmlparser2/). Cheerio
can parse nearly any HTML or XML document. Cheerio works in both browser and
server environments.

## API

### Loading

First you need to load in the HTML. This step in jQuery is implicit, since
jQuery operates on the one, baked-in DOM. With Cheerio, we need to pass in the
HTML document.

```js
// ES6 or TypeScript:
import * as cheerio from 'cheerio';

// In other environments:
const cheerio = require('cheerio');

const $ = cheerio.load('<ul id="fruits">...</ul>');

$.html();
//=> <html><head></head><body><ul id="fruits">...</ul></body></html>
```

### Selectors

Once you've loaded the HTML, you can use jQuery-style selectors to find elements
within the document.

#### \$( selector, [context], [root] )

`selector` searches within the `context` scope which searches within the `root`
scope. `selector` and `context` can be a string expression, DOM Element, array
of DOM elements, or cheerio object. `root`, if provided, is typically the HTML
document string.

This selector method is the starting point for traversing and manipulating the
document. Like in jQuery, it's the primary method for selecting elements in the
document.

```js
$('.apple', '#fruits').text();
//=> Apple

$('ul .pear').attr('class');
//=> pear

$('li[class=orange]').html();
//=> Orange
```

### Rendering

When you're ready to render the document, you can call the `html` method on the
"root" selection:

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

If you want to render the
[`outerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML)
of a selection, you can use the `outerHTML` prop:

```js
$('.pear').prop('outerHTML');
//=> <li class="pear">Pear</li>
```

You may also render the text content of a Cheerio object using the `text`
method:

```js
const $ = cheerio.load('This is <em>content</em>.');
$('body').text();
//=> This is content.
```

### The "DOM Node" object

Cheerio collections are made up of objects that bear some resemblance to
[browser-based DOM nodes](https://developer.mozilla.org/en-US/docs/Web/API/Node).
You can expect them to define the following properties:

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

> This video tutorial is a follow-up to Nettut's "How to Scrape Web Pages with
> Node.js and jQuery", using cheerio instead of JSDOM + jQuery. This video shows
> how easy it is to use cheerio and how much faster cheerio is than JSDOM +
> jQuery.

## Cheerio in the real world

Are you using cheerio in production? Add it to the
[wiki](https://github.com/cheeriojs/cheerio/wiki/Cheerio-in-Production)!

## Sponsors

Does your company use Cheerio in production? Please consider
[sponsoring this project](https://github.com/cheeriojs/cheerio?sponsor=1)! Your
help will allow maintainers to dedicate more time and resources to its
development and support.

**Headlining Sponsors**

<!-- BEGIN SPONSORS: headliner -->

<a href="https://tidelift.com/subscription/pkg/npm-cheerio" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fgithub.com%2Ftidelift.png?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=0713e6ee5c7ab01e7559df695c1e8cd9" title="Tidelift" alt="Tidelift"></img>
          </a>
<a href="https://github.com/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fgithub.com%2Fgithub.png?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=a1e87ca289de84eb32ea85432cf8ad11" title="Github" alt="Github"></img>
          </a>
<a href="https://www.airbnb.com/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fgithub.com%2Fairbnb.png?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=384cad45e10faea516202ad10801f895" title="AirBnB" alt="AirBnB"></img>
          </a>

<!-- END SPONSORS -->

**Other Sponsors**

<!-- BEGIN SPONSORS: sponsor -->

<a href="https://cryptocasinos.com/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fcryptocasinos%2F99b168e%2Flogo.png?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=66c6bbd273ae37878a1153769aeb7957" title="CryptoCasinos" alt="CryptoCasinos"></img>
          </a>
<a href="https://www.casinoonlineaams.com" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fcasinoonlineaamscom%2Fc59b0fd%2Flogo.png?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=6f9d59f0947d7b55b0a4fbd06406d2fc" title="Casinoonlineaams.com" alt="Casinoonlineaams.com"></img>
          </a>
<a href="https://apify.com/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F24586296%3Fv%3D4%26s%3D128?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=73d130c03482028ce54fd0871484d6a8" title="Apify" alt="Apify"></img>
          </a>
<a href="https://freebets.ltd.uk/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Ffreebets%2Fe21c41b%2Flogo.png?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=c7a5b478fd31853084925dabf9b33208" title="freebets.ltd.uk" alt="freebets.ltd.uk"></img>
          </a>
<a href="https://casinoutansvensklicens.co/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fcasino-utan-svensk-licens3%2Ff7e9357%2Flogo.png?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=bbd28616e8de4d3e0609059e52db734b" title="Casino utan svensk licens" alt="Casino utan svensk licens"></img>
          </a>
<a href="https://coolspins.net/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fcasino-utan-svensk-licens1%2F63947bf%2Flogo.png?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=5adf54d459567730d1526f1d68a2c964" title="Casino Utan Svensk Licens" alt="Casino Utan Svensk Licens"></img>
          </a>
<a href="https://www.zenrows.com" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fzenrows%2F3199d4b%2Flogo.png?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=e38415a8afd74473287be5630a341033" title="ZenRows" alt="ZenRows"></img>
          </a>
<a href="https://scommessesportivemania.com/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fscommessesportivemania-com%2Fe6941a3%2Favatar.png?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=01163c3c0aa2f757ab641e6e44ff0e6d" title="Scommessesportivemania.com" alt="Scommessesportivemania.com"></img>
          </a>
<a href="https://casinosicuri.info/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fcasinosicuri-info%2F5dc691c%2Favatar.png?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=fd570730894e259b3af3a26a8fb3a8da" title="Casinosicuri.info" alt="Casinosicuri.info"></img>
          </a>

<!-- END SPONSORS -->

## Backers

[Become a backer](https://github.com/cheeriojs/cheerio?sponsor=1) to show your
support for Cheerio and help us maintain and improve this open source project.

<!-- BEGIN SPONSORS: backer -->

<a href="https://kafidoff.com" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fkafidoff-vasy%2Fd7ff85c%2Favatar.png?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=5f86412e7c79219385b275aaa4ee5e65" title="Vasy Kafidoff" alt="Vasy Kafidoff"></img>
          </a>
<a href="https://medium.com/norch" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Fimages.opencollective.com%2Fespenklem%2F6075b19%2Favatar.png?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=c864d312e848f4e1ec19480e96503c06" title="Espen Klem" alt="Espen Klem"></img>
          </a>
<a href="https://github.com/gauthamchandra" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F5430280%3Fu%3D1115bcd3ed7aa8b2a62ff28f62ee4c2b92729903%26v%3D4%26s%3D128?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=60101476ca98f2b4a3dd62f577a1ad66" title="Gautham Chandra" alt="Gautham Chandra"></img>
          </a>
<a href="https://jarrodldavis.com" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F235875%3Fv%3D4%26s%3D128?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=653fd0868005d83df43e78488589ad4a" title="Jarrod Davis" alt="Jarrod Davis"></img>
          </a>
<a href="http://www.dr-chuck.com/" target="_blank" rel="noopener noreferrer">
            <img height="128px" width="128px" src="https://humble.imgix.net/https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F1197222%3Fu%3Dd6dc85c064736ab851c6d9e3318dcdd1be00fb2c%26v%3D4%26s%3D128?ixlib=js-3.8.0&w=128&h=128&fit=fillmax&fill=solid&s=e68caf732c2bbe4fcd0a59bcb751bd4d" title="Charles Severance" alt="Charles Severance"></img>
          </a>

<!-- END SPONSORS -->

## Special Thanks

This library stands on the shoulders of some incredible developers. A special
thanks to:

**&#8226; @fb55 for htmlparser2 & css-select:** Felix has a knack for writing
speedy parsing engines. He completely re-wrote both @tautologistic's
`node-htmlparser` and @harry's `node-soupselect` from the ground up, making both
of them much faster and more flexible. Cheerio would not be possible without his
foundational work

**&#8226; @jQuery team for jQuery:** The core API is the best of its class and
despite dealing with all the browser inconsistencies the code base is extremely
clean and easy to follow. Much of cheerio's implementation and documentation is
from jQuery. Thanks guys.

**&#8226; @tj:** The style, the structure, the open-source"-ness" of this
library comes from studying TJ's style and using many of his libraries. This
dude consistently pumps out high-quality libraries and has always been more than
willing to help or answer questions. You rock TJ.

## License

MIT
