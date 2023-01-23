---
sidebar_position: 999
description: Create custom pseudo-classes and plugins.
---

# Extending Cheerio

Cheerio already provides many ways of working with documents, but sometimes you
may want to add custom functionality. This guide will cover two approaches:
adding custom CSS pseudo elements and writing plugins for Cheerio.

## Adding Custom CSS Pseudo-Classes

The `pseudos` option is the extension point for adding pseudo-classes. It is a
map from names to either strings of functions.

- A string value is a selector that the element must match to be selected.
- A function is called with the element as its first argument, and optional
  parameters as the second. If it returns true, the element is selected.

Here is an example of using the pseudos option:

```js
const $ = cheerio.load('<div class="foo"></div><div data-bar="boo"></div>', {
  pseudos: {
    // `:foo` is an alias for `div.foo`
    foo: 'div.foo',
    // `:bar(val)` is equivalent to `[data-bar=val s]`
    bar: (el, val) => el.attribs['data-bar'] === val,
  },
});

$(':foo').length; // 1
$('div:bar(boo)').length; // 1
$('div:bar(baz)').length; // 0
```

## Writing Plugins for Cheerio

Once you have loaded a document, you may extend the prototype or the equivalent
`fn` property with custom plugin methods. Here is an example:

```js
const $ = cheerio.load('<html><body>Hello, <b>world</b>!</body></html>');
$.prototype.logHtml = function () {
  console.log(this.html());
};

$('body').logHtml(); // logs "Hello, <b>world</b>!" to the console
```

If you're using TypeScript, you should add a type definition for your new
method:

```ts
declare module 'cheerio' {
  interface Cheerio<T> {
    logHtml(this: Cheerio<T>): void;
  }
}
```
