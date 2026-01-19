---
sidebar_position: 3
description: An introduction to CSS selectors.
---

# Selecting Elements

Cheerio allows users to select elements from an HTML document using
[CSS selectors](https://developer.mozilla.org/en-US/docs/Glossary/CSS_Selector).
This allows you to select elements based on criteria such as their tag name,
class name, and attribute values. This guide provides an overview of how to use
CSS selectors to retrieve elements.

To select elements with Cheerio, you first need to import the library and load a
document. For example:

```js
import * as cheerio from 'cheerio';

// Load the document using any of the methods described in the "Loading Documents" section.
const $ = cheerio.load('<html>...</html>');
```

Once you have loaded the document, you can use the `$` function to select
elements. The `$` function works just like the `$` function in jQuery, and
allows you to select elements based on their tag name, class name, and attribute
values.

Here are some examples of how to use the `$` function to select elements:

- To select all the `<p>` elements in the document:

```js
const $p = $('p');
```

:::tip

The convention in Cheerio is to prefix the variable name with a $ to indicate
that it contains a Cheerio object. This is not required, but it is a good
practice to follow.

:::

- To select elements with a specific class name:

```js
const $selected = $('.selected');
```

- To select elements with a specific attribute value:

```js
const $selected = $('[data-selected=true]');
```

:::tip XML Namespaces

You can select with XML Namespaces but
[due to the CSS specification](https://www.w3.org/TR/2011/REC-css3-selectors-20110929/#attribute-selectors),
the colon (`:`) needs to be escaped for the selector to be valid.

```js
$('[xml\\:id="main"');
```

:::

- Selectors can be combined to select elements that match multiple criteria. For
  example, to select all `<p>` elements with the class `selected`:

```js
const $selected = $('p.selected');
```

- Further, you can use spaces (` `) to select elements that are descendants of
  other elements. For example, to select all `<p>` elements that are descendants
  of `<div>` elements:

```js
const $p = $('div p');
```

- You can also use the `>` character to select elements that are direct
  descendants of other elements. For example, to select all `<p>` elements that
  are direct descendants of `<div>` elements:

```js
const $p = $('div > p');
```

Please have a look at the documentation of Cheerio's underlying CSS selector
library, `css-select`, for
[a list of all supported selectors](https://github.com/fb55/css-select/blob/master/README.md#supported-selectors).
For example, to select `<p>` elements containing the word "hello":

```js
const $p = $('p:contains("hello")');
```

Cheerio also supports several jQuery-specific extensions that allow you to
select elements based on their position in the document. For example, to select
the first `<p>` element in the document:

```js
const $p = $('p:first');
```

Have a look at
[cheerio-select](https://github.com/cheeriojs/cheerio-select/blob/master/README.md),
the library that implements these extensions, to see what is available.

For further information, please also have a look at jQuery's guide on
[selecting elements](https://learn.jquery.com/using-jquery-core/selecting-elements/),
as well as
[MDN](https://developer.mozilla.org/en-US/docs/Glossary/CSS_Selector).

Finally, to add custom CSS pseudo-classes, have a look at the
[Extending Cheerio guide](/docs/advanced/extending-cheerio#adding-custom-css-pseudo-classes).
