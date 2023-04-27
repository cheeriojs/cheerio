---
sidebar_position: 4
description: Traverse the DOM tree and filter elements.
---

# Traversing the DOM

Traversing a document with Cheerio allows you to select and manipulate specific
elements within the document. Whether you want to move up and down the DOM tree,
move sideways within the tree, or filter elements based on certain criteria,
Cheerio provides a range of methods to help you do so.

In this guide, we will go through the various methods available in Cheerio for
traversing and filtering elements. We will cover methods for moving down the DOM
tree, moving up the DOM tree, moving sideways within the tree, and filtering
elements. By the end of this guide, you will have a good understanding of how to
use these methods to select and manipulate elements within a document using
Cheerio.

:::tip

This guide is intended to give you an overview of the various methods available
in Cheerio for traversing and filtering elements. For a more detailed reference
of these methods, see the [API documentation](/docs/api/classes/Cheerio).

:::

## Moving Down the DOM Tree

Cheerio provides several methods for moving down the DOM tree and selecting
elements that are children or descendants of the current selection.

### `find`

The [`find` method](/docs/api/classes/Cheerio#find) allows you to locate
specific elements within a selection. It takes a CSS selector as an argument and
returns a new selection containing all elements that match the selector within
the current selection.

Here's an example of using `find` to select all `<li>` elements within a `<ul>`
element:

```js live noInline
const $ = cheerio.load(
  `<ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>`
);

const listItems = $('ul').find('li');
render(`List item count: ${listItems.length}`);
```

### `children`

The [`children` method](/docs/api/classes/Cheerio#children) allows you to select
the direct children of an element. It returns a new selection containing all
direct children of the current selection.

Here's an example of using `children` to select all `<li>` elements within a
`<ul>` element:

```js live noInline
const $ = cheerio.load(
  `<ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>`
);

const listItems = $('ul').children('li');
render(`List item count: ${listItems.length}`);
```

### `contents`

The [`contents` method](/docs/api/classes/Cheerio#contents) allows you to select
all children of an element, including text and comment nodes. It returns a new
selection containing all children of the current selection.

Here's an example of using `contents` to select all children of a `<div>`
element:

```js live noInline
const $ = cheerio.load(
  `<div>
    Text <p>Paragraph</p>
  </div>`
);

const contents = $('div').contents();
render(`Contents count: ${contents.length}`);
```

## Moving Up the DOM Tree

Cheerio provides several methods for moving up the DOM tree and selecting
elements that are ancestors of the current selection.

### `parent`

The [`parent` method](/docs/api/classes/Cheerio#parent) allows you to select the
parent element of a selection. It returns a new selection containing the parent
element of each element in the current selection.

Here's an example of using `parent` to select the parent `<ul>` element of a
`<li>` element:

```js live noInline
const $ = cheerio.load(
  `<ul>
    <li>Item 1</li>
  </ul>`
);

const list = $('li').parent();
render(list.prop('tagName'));
```

### `parents` and `parentsUntil`

The [`parents` method](/docs/api/classes/Cheerio#parents) allows you to select
all ancestor elements of a selection, up to the root element. It returns a new
selection containing all ancestor elements of the current selection.

The [`parentsUntil` method](/docs/api/classes/Cheerio#parentsuntil) is similar
to `parents`, but allows you to specify an ancestor element as a stop point. It
returns a new selection containing all ancestor elements of the current
selection up to (but not including) the specified ancestor.

Here's an example of using `parents` and `parentsUntil` to select ancestor
elements of a `<li>` element:

```js live noInline
const $ = cheerio.load(
  `<div>
    <ul>
      <li>Item 1</li>
    </ul>
  </div>`
);

const ancestors = $('li').parents();
const ancestorsUntil = $('li').parentsUntil('div');

render(
  `Ancestor count (also includes <body> and <html>): ${ancestors.length} | Ancestor count (until <div>): ${ancestorsUntil.length}`
);
```

### `closest`

The [`closest` method](/docs/api/classes/Cheerio#closest) allows you to select
the closest ancestor matching a given selector. It returns a new selection
containing the closest ancestor element that matches the selector. If no
matching ancestor is found, the method returns an empty selection.

Here's an example of using `closest` to select the closest ancestor `<ul>`
element of a `<li>` element:

```js live noInline
const $ = cheerio.load(
  `<div>
    <ul>
      <li>Item 1</li>
    </ul>
  </div>`
);

const list = $('li').closest('ul');
render(list.prop('tagName'));
```

## Moving Sideways Within the DOM Tree

Cheerio provides several methods for moving sideways within the DOM tree and
selecting elements that are siblings of the current selection.

### `next` and `prev`

The [`next` method](/docs/api/classes/Cheerio#next) allows you to select the
next sibling element of a selection. It returns a new selection containing the
next sibling element (if there is one). If the given selection contains multiple
elements, `next` includes the next sibling for each one.

The [`prev` method](/docs/api/classes/Cheerio#prev) is similar to `next`, but
allows you to select the previous sibling element. It returns a new selection
containing the previous sibling element for each element in the given selection.

Here's an example of using `next` and `prev` to select sibling elements of a
`<li>` element:

```js live noInline
const $ = cheerio.load(
  `<ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>`
);

const nextItem = $('li:first').next();
const prevItem = $('li:eq(1)').prev();

render(`Next: ${nextItem.text()} | Prev: ${prevItem.text()}`);
```

## `nextAll`, `prevAll`, and `siblings`

The [`nextAll` method](/docs/api/classes/Cheerio#nextall) allows you to select
all siblings after the current element. It returns a new selection containing
all sibling elements after each element in the current selection.

The [`prevAll` method](/docs/api/classes/Cheerio#prevall) is similar to nextAll,
but allows you to select all siblings before the current element. It returns a
new selection containing all sibling elements before each element in the current
selection.

The [`siblings` method](/docs/api/classes/Cheerio#siblings) allows you to select
all siblings of a selection. It returns a new selection containing all sibling
elements of each element in the current selection.

Here's an example of using `nextAll`, `prevAll`, and `siblings` to select
sibling elements of a `<li>` element:

```js live noInline
const $ = cheerio.load(
  `<ul>
    <li>[1]</li>
    <li>[2]</li>
    <li>[3]</li>
  </ul>`
);

const nextAll = $('li:first').nextAll();
const prevAll = $('li:last').prevAll();
const siblings = $('li:eq(1)').siblings();

render(
  `Next All: ${nextAll.text()} | Prev All: ${prevAll.text()} | Siblings: ${siblings.text()}`
);
```

### `nextUntil` and `prevUntil`

The [`nextUntil` method](/docs/api/classes/Cheerio#nextuntil) allows you to
select all siblings after the current element up to a specified sibling. It
takes a selector or a sibling element as an argument and returns a new selection
containing all sibling elements after the current element up to (but not
including) the specified element.

The [`prevUntil` method](/docs/api/classes/Cheerio#prevuntil) is similar to
`nextUntil`, but allows you to select all siblings before the current element up
to a specified sibling. It takes a selector or a sibling element as an argument
and returns a new selection containing all sibling elements before the current
element up to (but not including) the specified element.

Here's an example of using `nextUntil` and `prevUntil` to select sibling
elements of a `<li>` element:

```js live noInline
const $ = cheerio.load(
  `<ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>`
);

const nextUntil = $('li:first').nextUntil('li:last-child');
const prevUntil = $('li:last').prevUntil('li:first-child');

render(`Next: ${nextUntil.text()} | Prev: ${prevUntil.text()}`);
```

## Filtering elements

Cheerio provides several methods for filtering elements within a selection.

:::tip

Most of these filters also exist as selectors. For example, the `first` method
is available as the `:first` selector. Users are encouraged to use the selector
syntax when possible, as it is more performant.

:::

### `eq`

The [`eq` method](/docs/api/classes/Cheerio#eq) allows you to select an element
at a specified index within a selection. It takes an index as an argument and
returns a new selection containing the element at the specified index.

Here's an example of using `eq` to select the second `<li>` element within a
`<ul>` element:

```js live noInline
const $ = cheerio.load(
  `<ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>`
);

const secondItem = $('li').eq(1);
render(secondItem.text());
```

### `filter` and `not`

The [`filter` method](/docs/api/classes/Cheerio#filter) allows you to select
elements that match a given selector. It takes a selector as an argument and
returns a new selection containing only those elements that match the selector.

The [`not` method](/docs/api/classes/Cheerio#not) is similar to `filter`, but
allows you to select elements that do not match a given selector. It takes a
selector as an argument and returns a new selection containing only those
elements that do not match the selector.

Here's an example of using `filter` and `not` to select `<li>` elements within a
`<ul>` element:

```js live noInline
const $ = cheerio.load(
  `<ul>
    <li class="item">Item 1</li>
    <li>Item 2</li>
  </ul>`
);

const matchingItems = $('li').filter('.item');
const nonMatchingItems = $('li').not('.item');

render(
  `Matching: ${matchingItems.text()} | Non-matching: ${nonMatchingItems.text()}`
);
```

### `has`

The [`has` method](/docs/api/classes/Cheerio#has) allows you to select elements
that contain an element matching a given selector. It takes a selector as an
argument and returns a new selection containing only those elements that contain
an element matching the selector.

Here's an example of using `has` to select `<li>` elements within a `<ul>`
element that contain a `<strong>` element:

```js live noInline
const $ = cheerio.load(
  `<ul>
    <li>Item 1</li>
    <li>
      <strong>Item 2</strong>
    </li>
  </ul>`
);

const matchingItems = $('li').has('strong');
render(matchingItems.length);
```

### `first` and `last`

The [`first` method](/docs/api/classes/Cheerio#first) allows you to select the
first element in a selection. It returns a new selection containing the first
element.

The [`last` method](/docs/api/classes/Cheerio#last) is similar to `first`, but
allows you to select the last element in a selection. It returns a new selection
containing the last element.

Here's an example of using `first` and `last` to select elements within a `<ul>`
element:

```js live noInline
const $ = cheerio.load(
  `<ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>`
);

const firstItem = $('li').first();
const lastItem = $('li').last();

render(`First: ${firstItem.text()} | Last: ${lastItem.text()}`);
```

## Conclusion

Cheerio provides a range of methods for traversing and filtering elements within
a document. These methods allow you to move up and down the DOM tree, move
sideways within the tree, and filter elements based on various criteria. By
using these methods, you can easily select and manipulate elements within a
document using Cheerio.
