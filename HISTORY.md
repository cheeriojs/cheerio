# Cheerio releae notes

## 1.0.0-rc.1 (2017-05-27)

This release changes Cheerio's default parser to [the Parse5 HTML
parser](https://github.com/inikulin/parse5). Parse5 is an excellent project
that rigorously conforms to the HTML standard. It does not support XML, so
Cheerio continues to use [htmlparser2](https://github.com/fb55/htmlparser2/)
when working with XML documents.

This switch addresses many long-standing bugs in Cheerio, but some users may
experience slower behavior in performance-critical applications. In addition,
htmlparser2 is more forgiving of invalid markup which can be useful when input
sourced from a third party and cannot be corrected. For these reasons, this
release offers users the ability to continue using htmlparser2 through explicit
configuration.

### Migrating from 0.x

**Re-enabling htmlparser2** As noted above, the new Parse5 library may not be
desirable in all contexts. Cheerio continues to support the specification of
parsing options via the `cheerio.load` method. This release of Cheerio
introduces a new option named `useHtmlParser2`. Set it to `true` to trigger
Cheerio to use the same parser as available in prior releases.

Note also that specifying a non-default value for any other parsing options
will likewise trigger the use of htmlparser2.

`cheerio.load( html[, options ] )`` This method continues to produce
jQuery-like functions, bound to the provided input text. In prior releases, the
provided string was interpreted as a document fragment. This meant that in a
statement such as:

    var $ = cheerio.load('<p>Hello, <b>world</b>!</p>');

The resulting `$` function would operate on a tree whose root element was a
paragraph tag.

With this release of Cheerio, strings provided to the `load` method are
interpreted as documents. The same example will produce a `$` function that
operates on a full HTML document, including an `<html>` document element with
nested `<head>` and `<body>` tags. This mimics web browser behavior much more
closely, but may require alterations in existing code.
