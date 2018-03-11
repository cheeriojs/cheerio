<h1 align="center">cheerio</h1>

<h5 align="center">Fast, flexible & lean implementation of core jQuery designed specifically for the server.</h5>

<div align="center">
  <a href="http://travis-ci.org/cheeriojs/cheerio">
    <img src="https://secure.travis-ci.org/cheeriojs/cheerio.svg?branch=master" alt="Travis CI" />
  </a>
  <a href="https://coveralls.io/r/cheeriojs/cheerio">
    <img src="http://img.shields.io/coveralls/cheeriojs/cheerio.svg?branch=master&style=flat" alt="Coverage" />
  </a>
  <a href="https://gitter.im/cheeriojs/cheerio?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge">
    <img src="https://badges.gitter.im/Join%20Chat.svg" alt="Join the chat at https://gitter.im/cheeriojs/cheerio" />
  </a>
  <a href="#backers">
    <img src="https://opencollective.com/cheerio/backers/badge.svg" alt="OpenCollective backers"/>
  </a>
  <a href="#sponsors">
    <img src="https://opencollective.com/cheerio/sponsors/badge.svg" alt="OpenCollective sponsors"/>
  </a>
</div>

<br />

```js
const cheerio = require('cheerio')
const $ = cheerio.load('<h2 class="title">Hello world</h2>')

$('h2.title').text('Hello there!')
$('h2').addClass('welcome')

$.html()
//=> <html><head></head><body><h2 class="title welcome">Hello there!</h2></body></html>
```

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Table of contents&firsth1=true) -->
<details>
<summary>Table of contents</summary>

- [Installation](#installation)
- [Features](#features)
- [Cheerio is not a web browser](#cheerio-is-not-a-web-browser)
- [Sponsors](#sponsors)
- [Backers](#backers)
- [API](#api)
  * [Markup example we'll be using:](#markup-example-well-be-using)
  * [Loading](#loading)
  * [Selectors](#selectors)
    + [$( selector, [context], [root] )](#-selector-context-root-)
      - [XML Namespaces](#xml-namespaces)
  * [Attributes](#attributes)
    + [.attr( name, value )](#attr-name-value-)
    + [.prop( name, value )](#prop-name-value-)
    + [.data( name, value )](#data-name-value-)
    + [.val( [value] )](#val-value-)
    + [.removeAttr( name )](#removeattr-name-)
    + [.hasClass( className )](#hasclass-classname-)
    + [.addClass( className )](#addclass-classname-)
    + [.removeClass( [className] )](#removeclass-classname-)
    + [.toggleClass( className, [switch] )](#toggleclass-classname-switch-)
    + [.is( selector )](#is-selector-)
    + [.is( element )](#is-element-)
    + [.is( selection )](#is-selection-)
    + [.is( function(index) )](#is-functionindex-)
  * [Forms](#forms)
    + [.serialize()](#serialize)
    + [.serializeArray()](#serializearray)
  * [Traversing](#traversing)
    + [.find(selector)](#findselector)
    + [.find(selection)](#findselection)
    + [.find(node)](#findnode)
    + [.parent([selector])](#parentselector)
    + [.parents([selector])](#parentsselector)
    + [.parentsUntil([selector][,filter])](#parentsuntilselectorfilter)
    + [.closest(selector)](#closestselector)
    + [.next([selector])](#nextselector)
    + [.nextAll([selector])](#nextallselector)
    + [.nextUntil([selector], [filter])](#nextuntilselector-filter)
    + [.prev([selector])](#prevselector)
    + [.prevAll([selector])](#prevallselector)
    + [.prevUntil([selector], [filter])](#prevuntilselector-filter)
    + [.slice( start, [end] )](#slice-start-end-)
    + [.siblings([selector])](#siblingsselector)
    + [.children([selector])](#childrenselector)
    + [.contents()](#contents)
    + [.each( function(index, element) )](#each-functionindex-element-)
    + [.map( function(index, element) )](#map-functionindex-element-)
    + [.filter( selector ) .filter( selection ) .filter( element ) .filter( function(index, element) )](#filter-selector---filter-selection---filter-element---filter-functionindex-element-)
    + [.not( selector ) .not( selection ) .not( element ) .not( function(index, elem) )](#not-selector---not-selection---not-element---not-functionindex-elem-)
    + [.has( selector ) .has( element )](#has-selector---has-element-)
    + [.first()](#first)
    + [.last()](#last)
    + [.eq( i )](#eq-i-)
    + [.get( [i] )](#get-i-)
    + [.index()](#index)
    + [.index( selector )](#index-selector-)
    + [.index( nodeOrSelection )](#index-nodeorselection-)
    + [.end()](#end)
    + [.add( selector [, context] )](#add-selector--context-)
    + [.add( element )](#add-element-)
    + [.add( elements )](#add-elements-)
    + [.add( html )](#add-html-)
    + [.add( selection )](#add-selection-)
    + [.addBack( [filter] )](#addback-filter-)
  * [Manipulation](#manipulation)
    + [.append( content, [content, ...] )](#append-content-content--)
    + [.appendTo( target )](#appendto-target-)
    + [.prepend( content, [content, ...] )](#prepend-content-content--)
    + [.prependTo( target )](#prependto-target-)
    + [.after( content, [content, ...] )](#after-content-content--)
    + [.insertAfter( target )](#insertafter-target-)
    + [.before( content, [content, ...] )](#before-content-content--)
    + [.insertBefore( target )](#insertbefore-target-)
    + [.remove( [selector] )](#remove-selector-)
    + [.replaceWith( content )](#replacewith-content-)
    + [.empty()](#empty)
    + [.html( [htmlString] )](#html-htmlstring-)
    + [.text( [textString] )](#text-textstring-)
    + [.wrap( content )](#wrap-content-)
    + [.css( [propertyName] ) .css( [ propertyNames] ) .css( [propertyName], [value] ) .css( [propertyName], [function] ) .css( [properties] )](#css-propertyname---css--propertynames---css-propertyname-value---css-propertyname-function---css-properties-)
  * [Rendering](#rendering)
  * [Miscellaneous](#miscellaneous)
    + [.toArray()](#toarray)
    + [.clone()](#clone)
  * [Utilities](#utilities)
    + [$.root](#root)
    + [$.contains( container, contained )](#contains-container-contained-)
    + [$.parseHTML( data [, context ] [, keepScripts ] )](#parsehtml-data--context---keepscripts--)
    + [$.load( html[, options ] )](#load-html-options--)
  * [Plugins](#plugins)
  * [The "DOM Node" object](#the-dom-node-object)
- [Screencasts](#screencasts)
- [Contributors](#contributors)
- [Testing](#testing)
- [Special Thanks](#special-thanks)
- [License](#license)

</details>
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

## Installation
`npm install cheerio`

## Features
__&#10084; Familiar syntax:__
Cheerio implements a subset of core jQuery. Cheerio removes all the DOM inconsistencies and browser cruft from the jQuery library, revealing its truly gorgeous API.

__&#991; Blazingly fast:__
Cheerio works with a very simple, consistent DOM model. As a result parsing, manipulating, and rendering are incredibly efficient. Preliminary end-to-end benchmarks suggest that cheerio is about __8x__ faster than JSDOM.

__&#10049; Incredibly flexible:__
Cheerio wraps around [parse5](https://github.com/inikulin/parse5) parser and can optionally use @FB55's forgiving [htmlparser2](https://github.com/fb55/htmlparser2/). Cheerio can parse nearly any HTML or XML document.

## Cheerio is not a web browser

Cheerio parses markup and provides an API for traversing/manipulating the resulting data structure. It does not interpret the result as a web browser does. Specifically, it does *not* produce a visual rendering, apply CSS, load external resources, or execute JavaScript. If your use case requires any of this functionality, you should consider projects like [PhantomJS](http://phantomjs.org/) or [JSDom](https://github.com/tmpvar/jsdom).

## Sponsors

Does your company use Cheerio in production? Please consider [sponsoring this project](https://opencollective.com/cheerio#sponsor). Your help will allow maintainers to dedicate more time and resources to its development and support.

<a href="https://opencollective.com/cheerio/sponsor/0/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/1/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/2/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/3/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/4/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/5/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/6/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/7/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/8/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/9/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/10/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/11/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/12/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/13/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/14/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/15/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/15/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/16/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/17/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/18/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/19/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/20/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/21/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/22/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/23/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/24/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/25/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/26/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/27/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/28/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/sponsor/29/website" target="_blank"><img src="https://opencollective.com/cheerio/sponsor/29/avatar.svg"></a>

## Backers

[Become a backer](https://opencollective.com/cheerio#backer) to show your support for Cheerio and help us maintain and improve this open source project.

<a href="https://opencollective.com/cheerio/backer/0/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/1/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/2/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/3/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/4/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/5/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/6/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/7/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/8/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/9/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/10/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/11/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/12/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/13/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/14/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/15/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/16/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/17/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/18/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/19/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/20/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/21/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/22/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/23/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/24/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/25/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/26/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/27/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/28/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/cheerio/backer/29/website" target="_blank"><img src="https://opencollective.com/cheerio/backer/29/avatar.svg"></a>

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
const cheerio = require('cheerio');
const $ = cheerio.load('<ul id="fruits">...</ul>');
```

Optionally, you can also load in the HTML by passing the string as the context:

```js
const $ = require('cheerio');
$('ul', '<ul id="fruits">...</ul>');
```

Or as the root:

```js
const $ = require('cheerio');
$('li', 'ul', '<ul id="fruits">...</ul>');
```

If you need to modify parsing options for XML input, you may pass an extra
object to `.load()`:

```js
const $ = cheerio.load('<ul id="fruits">...</ul>', {
    xml: {
      normalizeWhitespace: true,
    }
});
```

The options in the `xml` object are taken directly from [htmlparser2](https://github.com/fb55/htmlparser2/wiki/Parser-options), therefore any options that can be used in `htmlparser2` are valid in cheerio as well. The default options are:

```js
{
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: true,
    decodeEntities: true
}
```

For a full list of options and their effects, see [this](https://github.com/fb55/DomHandler) and
[htmlparser2's options](https://github.com/fb55/htmlparser2/wiki/Parser-options).

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
// Usage as of htmlparser2 version 3:
const htmlparser2 = require('htmlparser2');
const dom = htmlparser2.parseDOM(document, options);

const $ = cheerio.load(dom);
```

### Selectors

Cheerio's selector implementation is nearly identical to jQuery's, so the API is very similar.

#### $( selector, [context], [root] )
`selector` searches within the `context` scope which searches within the `root` scope. `selector` and `context` can be a string expression, DOM Element, array of DOM elements, or cheerio object. `root` is typically the HTML document string.

This selector method is the starting point for traversing and manipulating the document. Like jQuery, it's the primary method for selecting elements in the document, but unlike jQuery it's built on top of the CSSSelect library, which implements most of the Sizzle selectors.

```js
$('.apple', '#fruits').text()
//=> Apple

$('ul .pear').attr('class')
//=> pear

$('li[class=orange]').html()
//=> Orange
```

##### XML Namespaces
You can select with XML Namespaces but [due to the CSS specification](https://www.w3.org/TR/2011/REC-css3-selectors-20110929/#attribute-selectors), the colon (`:`) needs to be escaped for the selector to be valid.

```js
$('[xml\\:id="main"');
```

### Rendering
When you're ready to render the document, you can use the `html` utility function:

```js
$.html()
//=>  <ul id="fruits">
//      <li class="apple">Apple</li>
//      <li class="orange">Orange</li>
//      <li class="pear">Pear</li>
//    </ul>
```

If you want to return the outerHTML you can use `$.html(selector)`:

```js
$.html('.pear')
//=> <li class="pear">Pear</li>
```

By default, `html` will leave some tags open. Sometimes you may instead want to render a valid XML document. For example, you might parse the following XML snippet:

```xml
const $ = cheerio.load('<media:thumbnail url="http://www.foo.com/keyframe.jpg" width="75" height="50" time="12:05:01.123"/>');
```

... and later want to render to XML. To do this, you can use the 'xml' utility function:

```js
$.xml()
//=>  <media:thumbnail url="http://www.foo.com/keyframe.jpg" width="75" height="50" time="12:05:01.123"/>
```

You may also render the text content of a Cheerio object using the `text` static method:

```js
const $ = cheerio.load('This is <em>content</em>.')
$.text()
//=> This is content.
```

The method may be called on the Cheerio module itself--be sure to pass a collection of nodes!

```js
const $ = cheerio.load('<div>This is <em>content</em>.</div>')
cheerio.text($('div'))
//=> This is content.
```

### Plugins

Once you have loaded a document, you may extend the prototype or the equivalent `fn` property with custom plugin methods:

```js
const $ = cheerio.load('<html><body>Hello, <b>world</b>!</body></html>');
$.prototype.logHtml = function() {
  console.log(this.html());
};

$('body').logHtml(); // logs "Hello, <b>world</b>!" to the console
```

### The "DOM Node" object

Cheerio collections are made up of objects that bear some resemblence to [browser-based DOM nodes](https://developer.mozilla.org/en-US/docs/Web/API/Node). You can expect them to define the following properties:

- `tagName`
- `parentNode`
- `previousSibling`
- `nextSibling`
- `nodeValue`
- `firstChild`
- `childNodes`
- `lastChild`

## Screencasts

http://vimeo.com/31950192

> This video tutorial is a follow-up to Nettut's "How to Scrape Web Pages with Node.js and jQuery", using cheerio instead of JSDOM + jQuery. This video shows how easy it is to use cheerio and how much faster cheerio is than JSDOM + jQuery.

## Contributors

These are some of the contributors that have made cheerio possible:

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (CONTRIBUTORS) -->
| **Commits** | **Contributor** |
| --- | --- |
| 409 | [matthewmueller](https://github.com/matthewmueller) |
| 143 | [jugglinmike](https://github.com/jugglinmike) |
| 128 | [fb55](https://github.com/fb55) |
| 92  | [davidchambers](https://github.com/davidchambers) |
| 33  | [kpdecker](https://github.com/kpdecker) |
| 11  | [arb](https://github.com/arb) |
| 8   | [nleush](https://github.com/nleush) |
| 7   | [jlep](https://github.com/jlep) |
| 5   | [alexindigo](https://github.com/alexindigo) |
| 5   | [bensheldon](https://github.com/bensheldon) |
| 5   | [stevenvachon](https://github.com/stevenvachon) |
| 5   | [0xBADC0FFEE](https://github.com/0xBADC0FFEE) |
| 5   | [cvrebert](https://github.com/cvrebert) |
| 4   | [yields](https://github.com/yields) |
| 4   | [AMKohn](https://github.com/AMKohn) |
| 4   | [Maciek416](https://github.com/Maciek416) |
| 4   | [twolfson](https://github.com/twolfson) |
| 4   | [finspin](https://github.com/finspin) |
| 3   | [andineck](https://github.com/andineck) |
| 3   | [rwaldin](https://github.com/rwaldin) |
| 3   | [DianeLooney](https://github.com/DianeLooney) |
| 3   | [robashton](https://github.com/robashton) |
| 2   | [alexeyraspopov](https://github.com/alexeyraspopov) |
| 2   | [farhadi](https://github.com/farhadi) |
| 2   | [khoomeister](https://github.com/khoomeister) |
| 2   | [dandv](https://github.com/dandv) |
| 2   | [Delgan](https://github.com/Delgan) |
| 2   | [Rycochet](https://github.com/Rycochet) |
| 2   | [SamyPesse](https://github.com/SamyPesse) |
| 2   | [cyberthom](https://github.com/cyberthom) |
| 2   | [Torthu](https://github.com/Torthu) |
| 2   | [wvl](https://github.com/wvl) |
| 2   | [alexbardas](https://github.com/alexbardas) |
| 2   | [coderaiser](https://github.com/coderaiser) |
| 2   | [2020steve](https://github.com/2020steve) |
| 1   | [ashaindlin](https://github.com/ashaindlin) |
| 1   | [benatkin](https://github.com/benatkin) |
| 1   | [billyjanitsch](https://github.com/billyjanitsch) |
| 1   | [TrySound](https://github.com/TrySound) |
| 1   | [chriso](https://github.com/chriso) |
| 1   | [dYale](https://github.com/dYale) |
| 1   | [dandlezzz](https://github.com/dandlezzz) |
| 1   | [dhurlburtusa](https://github.com/dhurlburtusa) |
| 1   | [darrenscerri](https://github.com/darrenscerri) |
| 1   | [dekatron](https://github.com/dekatron) |
| 1   | [t3chnoboy](https://github.com/t3chnoboy) |
| 1   | [elias-winberg](https://github.com/elias-winberg) |
| 1   | [alFReD-NSH](https://github.com/alFReD-NSH) |
| 1   | [gabrielf](https://github.com/gabrielf) |
| 1   | [gkatsev](https://github.com/gkatsev) |
| 1   | [Dreamiko](https://github.com/Dreamiko) |
| 1   | [harish2704](https://github.com/harish2704) |
| 1   | [JaKXz](https://github.com/JaKXz) |
| 1   | [jhubble](https://github.com/jhubble) |
| 1   | [sotojuan](https://github.com/sotojuan) |
| 1   | [astorije](https://github.com/astorije) |
| 1   | [kevinsawicki](https://github.com/kevinsawicki) |
| 1   | [konstantin-popov](https://github.com/konstantin-popov) |
| 1   | [leonard-thieu](https://github.com/leonard-thieu) |
| 1   | [Meekohi](https://github.com/Meekohi) |
| 1   | [MichielDeMey](https://github.com/MichielDeMey) |
| 1   | [miduga](https://github.com/miduga) |
| 1   | [attomos](https://github.com/attomos) |
| 1   | [plward11](https://github.com/plward11) |
| 1   | [piamancini](https://github.com/piamancini) |
| 1   | [vprasanth](https://github.com/vprasanth) |
| 1   | [raoulmillais](https://github.com/raoulmillais) |
| 1   | [rgladwell](https://github.com/rgladwell) |
| 1   | [Trott](https://github.com/Trott) |
| 1   | [globin](https://github.com/globin) |
| 1   | [ryanbreen](https://github.com/ryanbreen) |
| 1   | [SBoudrias](https://github.com/SBoudrias) |
| 1   | [sindresorhus](https://github.com/sindresorhus) |
| 1   | [Autarc](https://github.com/Autarc) |
| 1   | [joepie91](https://github.com/joepie91) |
| 1   | [gitter-badger](https://github.com/gitter-badger) |
| 1   | [trshafer](https://github.com/trshafer) |
| 1   | [tp](https://github.com/tp) |
| 1   | [whodidthis](https://github.com/whodidthis) |
| 1   | [xavi-](https://github.com/xavi-) |
| 1   | [hotpxl](https://github.com/hotpxl) |
| 1   | [akant10](https://github.com/akant10) |
| 1   | [besteman](https://github.com/besteman) |
| 1   | [digihaven](https://github.com/digihaven) |
| 1   | [exoticknight](https://github.com/exoticknight) |
| 1   | [frankcash](https://github.com/frankcash) |
| 1   | [h7lin](https://github.com/h7lin) |
| 1   | [lessmind](https://github.com/lessmind) |
| 1   | [sufisaid](https://github.com/sufisaid) |
| 1   | [xiaohwan](https://github.com/xiaohwan) |

<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

## Cheerio in the real world

Are you using cheerio in production? Add it to the [wiki](https://github.com/cheeriojs/cheerio/wiki/Cheerio-in-Production)!

## Testing

To run the test suite, download the repository, then within the cheerio directory, run:

```shell
make setup
make test
```

This will download the development packages and run the test suite.

## Special Thanks

This library stands on the shoulders of some incredible developers. A special thanks to:

__&#8226; @FB55 for node-htmlparser2 & CSSSelect:__
Felix has a knack for writing speedy parsing engines. He completely re-wrote both @tautologistic's `node-htmlparser` and @harry's `node-soupselect` from the ground up, making both of them much faster and more flexible. Cheerio would not be possible without his foundational work

__&#8226; @jQuery team for jQuery:__
The core API is the best of its class and despite dealing with all the browser inconsistencies the code base is extremely clean and easy to follow. Much of cheerio's implementation and documentation is from jQuery. Thanks guys.

__&#8226; @visionmedia:__
The style, the structure, the open-source"-ness" of this library comes from studying TJ's style and using many of his libraries. This dude consistently pumps out high-quality libraries and has always been more than willing to help or answer questions. You rock TJ.

## License

MIT
