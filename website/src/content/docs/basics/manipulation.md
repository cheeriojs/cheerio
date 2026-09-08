---
sidebar_position: 5
description: Methods to manipulate elements within a document.
---

# Manipulating the DOM

Once you've [selected](/docs/basics/selecting) some elements, Cheerio lets you
change them: attributes, classes, text, HTML, and the structure of the tree
itself.

Most methods here do double duty: called **without** an argument they read,
called **with** an argument they write. Writes always apply to every element in
the selection and return the selection, so they chain. Reads usually look at
only the first element — the exceptions are called out below.

When you're done, `$.html()` serializes the document back to a string.

## Modifying Element Attributes and Properties

[`attr()`](/docs/api/classes/Cheerio#attr) reads and writes HTML attributes —
the values literally present in the markup.
[`prop()`](/docs/api/classes/Cheerio#prop) reads and writes properties, the
values a browser would compute from those attributes. Both take a key, plus a
value when setting.

```js
// Set the 'src' attribute of an image element
$('img').attr('src', 'https://example.com/image.jpg');

// Set the 'checked' property of a checkbox element
$('input[type="checkbox"]').prop('checked', true);

// Get the 'href' attribute of a link element
const href = $('a').attr('href');

// Get the 'disabled' property of a button element
const isDisabled = $('button').prop('disabled');
```

That distinction matters most for URLs and booleans: `attr('href')` gives you
the raw string from the markup, while `prop('href')` resolves it against the
document's URL. `prop()` also exposes computed values that don't exist as
attributes at all — `style`, `tagName`, `innerHTML`, `outerHTML`,
`textContent`, and `innerText`.

```js
// Get the `style` object of an element
const style = $('div').prop('style');

// Get the resolved `src` URL of an image element
$('img').prop('src');

// Get the outerHTML of an element
const outerHTML = $('div').prop('outerHTML');

// Get the innerText of an element
const innerText = $('div').prop('innerText');
```

## Adding and Removing Classes

To add or remove classes from an element, you can use the
[`addClass()`](/docs/api/classes/Cheerio#addclass),
[`removeClass()`](/docs/api/classes/Cheerio#removeclass), and
[`toggleClass()`](/docs/api/classes/Cheerio#toggleclass) methods. All three
methods take a class name or a space-separated list of class names as an
argument. They modify all elements in the selection.

```js
// Add a class to an element
$('div').addClass('new-class');

// Add multiple classes to an element
$('div').addClass('new-class another-class');

// Remove a class from an element
$('div').removeClass('old-class');

// Remove multiple classes from an element
$('div').removeClass('old-class another-class');

// Toggle a class on an element (add if it doesn't exist, remove if it does)
$('div').toggleClass('active');
```

## Modifying the Text Content of an Element

To query or modify the text content of an element, you can use the
[`text()`](/docs/api/classes/Cheerio#text) method. Given a string as an
argument, it sets the text content of every element in the selection to the
given string. Without arguments, it returns the text content of every element
(including its descendants) in the selection, concatenated together.

```js
// Set the text content of an element
$('h1').text('Hello, World!');

// Get the text content of an element
const text = $('p').text();
```

:::warning[`text()` includes script and style content]

`text()` returns the raw `textContent`, which means the source of any
`<script>` and `<style>` elements in the selection ends up in the result.
`.prop('innerText')` skips those two, which is usually what you want — but note
that it works from the tree alone. Cheerio applies no CSS, so content hidden by
`display: none` or a `hidden` attribute is still included.

:::

## Modifying the HTML Content of an Element

To query or modify the HTML content of an element, you can use the
[`html()`](/docs/api/classes/Cheerio#html) method. Given an HTML string as an
argument, it sets the inner HTML of every element in the selection to the given
string. Without arguments, it returns the inner HTML of the _first_ element in
the selection.

```js
// Set the inner HTML of an element
$('div').html('<p>Hello, World!</p>');

// Get the inner HTML of an element
const html = $('div').html();
```

## Inserting New Elements

To insert new elements into a document, you can use the
[`append()`](/docs/api/classes/Cheerio#append),
[`prepend()`](/docs/api/classes/Cheerio#prepend),
[`before()`](/docs/api/classes/Cheerio#before), and
[`after()`](/docs/api/classes/Cheerio#after) methods. These modify every element
in the selection.

```js
// Append an element to the end of a parent element
$('ul').append('<li>Item</li>');

// Prepend an element to the beginning of a parent element
$('ul').prepend('<li>Item</li>');

// Insert an element before a target element
$('li').before('<li>Item</li>');

// Insert an element after a target element
$('li').after('<li>Item</li>');
```

Each of these has a mirrored counterpart —
[`appendTo()`](/docs/api/classes/Cheerio#appendto),
[`prependTo()`](/docs/api/classes/Cheerio#prependto),
[`insertBefore()`](/docs/api/classes/Cheerio#insertbefore), and
[`insertAfter()`](/docs/api/classes/Cheerio#insertafter) — which swap the roles
of the two sides: the selection is the content being inserted, and the argument
is the target. Use whichever reads better at the call site.

```js
// These two lines do the same thing
$('ul').append('<li>Item</li>');
$('<li>Item</li>').appendTo('ul');

// …as do these
$('h1').after('<p>Inserted element</p>');
$('<p>Inserted element</p>').insertAfter('h1');
```

## Wrapping and Unwrapping Elements

Sometimes you may want to wrap an element in another element, or remove the
element's parent element while keeping its children. To do this, you can use the
`wrap()`, `wrapInner()`, and `unwrap()` methods.

The [`wrap()`](/docs/api/classes/Cheerio#wrap) method takes a string or a
Cheerio object as an argument and wraps the element in the given element.

```js
// Wrap an element in a div
$('p').wrap('<div></div>');
```

The [`wrapInner()`](/docs/api/classes/Cheerio#wrapinner) method works like
`wrap()`, but wraps the element's _contents_ rather than the element itself.

```js
// <div>text</div> becomes <div><span>text</span></div>
$('div').wrapInner('<span></span>');
```

The [`unwrap()`](/docs/api/classes/Cheerio#unwrap) method removes the element's
parent element, while keeping the element and its children.

```js
// Unwrap an element
$('p').unwrap();
```

## Replacing Elements

To replace an element with another element, you can use the
[`replaceWith()`](/docs/api/classes/Cheerio#replacewith) method. It takes a
string or a Cheerio object as an argument and replaces each element in the
selection with the given element.

```js
// Replace an element with another element
$('li').replaceWith('<li>Item</li>');
```

When the argument is an existing element, every element in the selection but
the last one is replaced with a copy of it, as a node can only exist in one
place:

```js
const $item = $('<li>Item</li>');

// Every `li` is replaced; the last one receives `$item` itself
$('li').replaceWith($item);
```

Note that the `replaceWith()` method removes the element from the document and
replaces it with the given element or HTML string. If you want to keep the
element and modify its contents, you can use the `html()` or `text()` methods
instead.

## Removing Elements

To remove an element from a document, you can use the
[`remove()`](/docs/api/classes/Cheerio#remove) method. It removes each element
in the selection, and all of their children, from the document.

```js
// Remove an element from the document
$('li').remove();
```

To clear an element without removing it, use
[`empty()`](/docs/api/classes/Cheerio#empty). It removes everything inside each
element in the selection — child elements, text, and comments alike — leaving
the element itself in place.

```js
// <li><b>a</b> text</li> becomes <li></li>
$('li').empty();
```

## Where to go next

To pull many values out of a document at once rather than method by method, see
[the `extract` method](/docs/basics/extract). To add your own methods to the
`Cheerio` prototype, see
[Extending Cheerio](/docs/advanced/extending-cheerio#writing-plugins-for-cheerio).
