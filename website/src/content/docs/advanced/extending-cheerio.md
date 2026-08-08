---
sidebar_position: 999
description: Create custom pseudo-classes and plugins.
---

# Extending Cheerio

Cheerio has two extension points: you can teach its selector engine new
pseudo-classes, and you can add your own methods to the `Cheerio` prototype.

## Adding Custom CSS Pseudo-Classes

The `pseudos` option maps pseudo-class names to either a string or a function:

- A **string** is a selector the element must match to be selected.
- A **function** is called with the element as its first argument and the
  pseudo-class's parameter as its second. Return `true` to select the element.

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

Every loaded document has its own `Cheerio` prototype, reachable as `$.prototype`
or its alias `$.fn`. Adding a method there makes it available on every selection
from that document — and only that one, so plugins don't leak between documents.

```js
const $ = cheerio.load('<html><body>Hello, <b>world</b>!</body></html>');

$.fn.logHtml = function () {
  console.log(this.html());
};

$('body').logHtml(); // logs "Hello, <b>world</b>!" to the console
```

Inside the method, `this` is the current selection, so the full Cheerio API is
available to you.

If you're using TypeScript, declare the method so the compiler knows about it:

```ts
declare module 'cheerio' {
  interface Cheerio<T> {
    logHtml(this: Cheerio<T>): void;
  }
}
```
