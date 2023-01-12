# Welcome to the Cheerio documentation!

Cheerio is a fast, flexible, and lightweight JavaScript library that allows you
to parse and manipulate HTML and XML documents. It can be used on the server or
in a web browser, making it a versatile tool for working with HTML.

## Features

**&#10084; Proven syntax:** Cheerio implements a subset of core jQuery. Cheerio
removes all the DOM inconsistencies and browser cruft from the jQuery library,
revealing its truly gorgeous API.

**&#991; Blazingly fast:** Cheerio works with a very simple, consistent DOM
model. As a result parsing, manipulating, and rendering are incredibly
efficient.

**&#10049; Incredibly flexible:** Cheerio wraps around
[parse5](https://github.com/inikulin/parse5) parser and can optionally use
@fb55's forgiving [htmlparser2](https://github.com/fb55/htmlparser2/). Cheerio
can parse nearly any HTML or XML document. Cheerio works in both browser and
Node environments.

## Caveats

**Cheerio is not a web browser.** Cheerio parses markup and provides an API for
traversing/manipulating the resulting data structure. It does not interpret the
result as a web browser does. Specifically, it does _not_ produce a visual
rendering, apply CSS, load external resources, or execute JavaScript which is
common for a SPA (single page application). This makes Cheerio **much, much
faster than other solutions**. If your use case requires any of this
functionality, you should consider browser automation software like
[Puppeteer](https://github.com/puppeteer/puppeteer) and
[Playwright](https://github.com/microsoft/playwright) or DOM emulation projects
like [JSDom](https://github.com/jsdom/jsdom).
