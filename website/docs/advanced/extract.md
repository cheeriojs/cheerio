---
sidebar_label: The `extract` method
sidebar_position: 1
description: Extract multiple values at once.
---

# Extracting Data with the `extract` Method

The `extract` method in Cheerio allows you to extract data from an HTML document
and store it in an object. The method takes a `map` object as a parameter, where
the keys are the names of the properties to be created on the object, and the
values are the selectors or descriptors to be used to extract the values.

To use the `extract` method, you first need to import the library and load an
HTML document. For example:

```js
import * as cheerio from 'cheerio';

const $ = cheerio.load(`
  <ul>
    <li>One</li>
    <li>Two</li>
    <li class="blue sel">Three</li>
    <li class="red">Four</li>
  </ul>
`);
```

Once you have loaded the document, you can use the `extract` method on the
loaded object to extract data from the document.

Here are some examples of how to use the `extract` method:

```js
// Extract the text content of the first .red element
const data = $.extract({
  red: '.red',
});
```

This will return an object with a `red` property, whose value is the text
content of the first `.red` element.

To extract the text content of all `.red` elements, you can wrap the selector in
an array:

```js
// Extract the text content of all .red elements
const data = $.extract({
  red: ['.red'],
});
```

This will return an object with a `red` property, whose value is an array of the
text content of all `.red` elements.

To be more specific about what you'd like to extract, you can pass an object
with a `selector` and a `value` property. For example, to extract the text
content of the first `.red` element and the `href` attribute of the first `a`
element:

```js
const data = $.extract({
  red: '.red',
  links: {
    selector: 'a',
    value: 'href',
  },
});
```

The `value` property can be used to specify the name of the property to extract
from the selected elements. In this case, we are extracting the `href` attribute
from the `<a>` elements. This uses Cheerio's
[`prop` method](/docs/api/classes/Cheerio#prop) under the hood.

`value` defaults to `textContent`, which extracts the text content of the
element.

As an attribute with special logic inside the `prop` method, `href`s will be
resolved relative to the document's URL. The document's URL will be set
automatically when using `fromURL` to load the document. Otherwise, use the
`baseURL` option to specify the documents URL.

There are many props available here; have a look at the
[`prop` method](/docs/api/classes/Cheerio#prop) for details. For example, to
extract the `outerHTML` of all `.red` elements:

```js
const data = $.extract({
  red: [
    {
      selector: '.red',
      value: 'outerHTML',
    },
  ],
});
```

You can also extract data from multiple nested elements by specifying an object
as the `value`. For example, to extract the text content of all `.red` elements
and the first `.blue` element in the first `<ul>` element, and the text content
of all `.sel` elements in the second `<ul>` element:

```js
const data = $.extract({
  ul1: {
    selector: 'ul:first',
    value: {
      red: ['.red'],
      blue: '.blue',
    },
  },
  ul2: {
    selector: 'ul:eq(2)',
    value: {
      sel: ['.sel'],
    },
  },
});
```

This will return an object with `ul1` and `ul2` properties. The `ul1` property
will be an object with a `red` property, whose value is an array of the text
content of all `.red` elements in the first ul element, and a `blue` property.
The `ul2` property will be an object with a `sel` property, whose value is an
array of the text content of all `.sel` elements in the second `<ul>` element.

Finally, you can pass a function as the `value` property. The function will be
called with each of the selected elements, and the `key` of the property:

```js
const data = $.extract({
  links: [
    {
      selector: 'a',
      value: (el, key) => {
        const href = $(el).attr('href');
        return `${key}=${href}`;
      },
    },
  ],
});
```

This will extract the `href` attribute of all `<a>` elements and return a string
in the form `links=href_value` for each element, where `href_value` is the value
of the `href` attribute. The returned object will have a `links` property whose
value is an array of these strings.

## Putting it all together

Let's fetch the latest release of Cheerio from GitHub and extract the release
date and the release notes from the release page:

```js
import * as cheerio from 'cheerio';

const $ = await cheerio.fromURL(
  'https://github.com/cheeriojs/cheerio/releases'
);

const data = $.extract({
  releases: [
    {
      // First, we select individual release sections.
      selector: 'section',
      // Then, we extract the release date, name, and notes from each section.
      value: {
        // Selectors are executed whitin the context of the selected element.
        name: 'h2',
        date: {
          selector: 'relative-time',
          // The actual date of the release is stored in the `datetime` attribute.
          value: 'datetime',
        },
        notes: {
          selector: '.markdown-body',
          // We are looking for the HTML content of the element.
          value: 'innerHTML',
        },
      },
    },
  ],
});
```
