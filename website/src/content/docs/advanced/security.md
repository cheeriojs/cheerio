---
sidebar_position: 3
description: Handling untrusted markup safely.
---

# Security

Cheerio is usually pointed at pages someone else controls, so it is worth being
explicit about what it does and does not protect you from.

Cheerio parses markup, lets you query and change the resulting tree, and
serializes it back to markup. It **never executes scripts, evaluates
expressions, or touches the network** — the one exception being
[`fromURL`](/docs/basics/loading#fromurl), which makes the request you asked for.

## Cheerio is not a sanitizer

This is the big one. Cheerio's output is *markup*, not *safe* markup. If you
load a page containing `<script>` or an `onerror` attribute, those survive
parsing and serialization intact — that is correct behaviour for a parser, and
it means the output of `$.html()` is exactly as trustworthy as the input.

```js
const $ = cheerio.load('<img src=x onerror="alert(1)">');

$.html(); // The onerror attribute is still there.
```

If you are going to render scraped markup in a browser, run it through a
dedicated sanitizer such as
[sanitize-html](https://www.npmjs.com/package/sanitize-html) or
[DOMPurify](https://github.com/cure53/DOMPurify) first.

Reaching for `text()` instead of `html()` narrows the problem but does not
remove it: `text()` strips the markup *structure*, yet the string it returns can
still contain `<`, `>`, and `"`. Dropping that into an HTML sink builds markup
right back up. Assign it somewhere that treats it as text — `textContent` in a
browser, `.text()` in Cheerio — or escape it for whatever context it lands in.

## Manipulation methods take raw HTML

`html()`, `append()`, `prepend()`, `before()`, `after()`, `replaceWith()`, and
`wrap()` all parse their argument as markup. Passing user input to any of them
injects whatever tags it contains:

```js
// If `name` is "<img src=x onerror=…>", you just injected an element.
$('#greeting').html(`Hello, ${name}`);

// `text()` escapes instead, so this is safe.
$('#greeting').text(`Hello, ${name}`);
```

Use `text()` when you mean text. Reach for the markup-parsing methods only with
content you construct or have sanitized.

## Selectors built from user input

Treat a selector from an untrusted source the way you would treat a regular
expression from an untrusted source: don't. A crafted selector can make the
engine do a lot of work, and it can match things you didn't intend.

Quoting the value is **not** enough. A `"` in the value closes the attribute
selector, and everything after it is parsed as more selector syntax:

```js
const id = 'x"], [data-id="secret';

// Becomes: [data-id="x"], [data-id="secret"] — two selectors, not one.
$(`[data-id="${id}"]`); // Matches the element the caller was never meant to see.
```

Cheerio has no `CSS.escape`, so the reliable fix is to keep the value out of
the selector entirely: match on a fixed selector, then compare the attribute as
data.

```js
const matches = $('[data-id]').filter((_, el) => $(el).attr('data-id') === id);
```

## Bound the input you accept

Parsing is proportional to input size, and Cheerio will happily try to parse a
500 MB response. If you accept markup from somewhere you don't control, cap the
size before handing it over — and when using `fromURL`, remember that the URL
itself decides what gets fetched, so validate it if it comes from a user
(otherwise you have an SSRF).

## Reporting a vulnerability

See
[SECURITY.md](https://github.com/cheeriojs/cheerio/blob/main/SECURITY.md) for
the reporting process, and
[THREAT_MODEL.md](https://github.com/cheeriojs/cheerio/blob/main/THREAT_MODEL.md)
for the full statement of what is and isn't considered a vulnerability.
