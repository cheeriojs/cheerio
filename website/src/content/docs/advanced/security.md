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
[DOMPurify](https://github.com/cure53/DOMPurify) first. Extracting `text()`
rather than `html()` is also safe, since it carries no markup.

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

Cheerio's selector engine can be made to do a lot of work by a sufficiently
awkward selector, so treat selectors from untrusted sources the way you would
treat a regular expression from an untrusted source: don't. If you need to look
something up by a user-supplied value, put the value inside a quoted attribute
selector rather than concatenating it into selector syntax:

```js
$(`[data-id="${id}"]`); // The value is data, not syntax.
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
