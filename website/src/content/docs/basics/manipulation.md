---
sidebar_position: 5
description: Methods to manipulate elements within a document.
---

# Manipulating the DOM

Now that you have learned the basics of using Cheerio and have gained some
experience with loading and traversing documents, it's time to dive deeper into
manipulating elements. Whether you want to modify element attributes and
properties, add and remove classes, modify text and HTML content, or insert and
remove elements, Cheerio provides a range of methods to help you do so.

In this guide, we will focus specifically on manipulating elements within a
document using Cheerio. We will cover methods for modifying element attributes
and properties, adding and removing classes, modifying text and HTML content,
inserting and removing elements, and handling errors and debugging. By the end
of this guide, you will have a good understanding of how to use these methods to
manipulate elements within a document using Cheerio.

## Modifying Element Attributes and Properties

To modify the attributes and properties of a single element, you can use the
[`attr()`](/docs/api/classes/Cheerio#attr) and
[`prop()`](/docs/api/classes/Cheerio#prop) methods, respectively. Both methods
take a key and a value as arguments, and allow you to get and set the attribute
or property. When setting, they apply to all elements in the selection; when
getting, they return a single value corresponding to the first element in the
selection.

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

`prop()` is not limited to simple values like strings and booleans. You can also
use it to get complex properties like the `style` object, or to resolve `href`
or `src` URLs of supported elements. You can also use it to get the `tagName`,
`innerHTML`, `outerHTML`, `textContent`, and `innerText` properties of a single
element.

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

:::tip Note

`text()` returns the `textContent` of all passed elements. The result will
include the contents of `<script>` and `<style>` elements. To avoid this, use
`.prop('innerText')` instead.

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

The [`insertAfter()`](/docs/api/classes/Cheerio#insertafter) and
[`insertBefore()`](/docs/api/classes/Cheerio#insertbefore) methods allow you to
insert an element before or after a target element, respectively. Both methods
take a string or a Cheerio object as an argument and insert the given element
before or after the target element.

```js
const $ = require('cheerio');

// Insert an element after a target element
$('<p>Inserted element</p>').insertAfter('h1');

// Insert an element before a target element
$('<p>Inserted element</p>').insertBefore('h1');
```

The [`prependTo()`](/docs/api/classes/Cheerio#prependto) and
[`appendTo()`](/docs/api/classes/Cheerio#appendto) methods allow you to prepend
or append an element to a parent element, respectively. Both methods take a
string or a Cheerio object as an argument and insert the element at the
beginning or end of the given parent element.

```js
const $ = require('cheerio');

// Prepend an element to a parent element
$('<p>Inserted element</p>').prependTo('div');

// Append an element to a parent element
$('<p>Inserted element</p>').appendTo('div');
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

The [`wrapInner()`](/docs/api/classes/Cheerio#wrapinner) method works similar to
wrap(), but instead of wrapping the element itself, it wraps the element's inner
HTML in the given element.

```js
// Wrap the inner HTML of an element in a div
$('div').wrapInner('<div></div>');
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

Alternatively, you can remove the children of an element from the document,
without removing the element itself, using the
[`empty()`](/docs/api/classes/Cheerio#empty) method. It removes the children
(but not text nodes or comments) of each element in the selection from the
document.

```js
// Remove an element's children from the document
$('li').empty();
```

## Conclusion

We learned how to manipulate elements within a document using Cheerio. We can
modify element attributes and properties, add and remove classes, modify text
and HTML content, insert and remove elements, and handle errors and debug our
code. With these tools, you can easily manipulate a document to suit your needs.
