Cheerio is a server-side library that speaks and understands HTML.

# cheerio

Fast, minimal jQuery-like API for Tautologic's forgiving htmlparser. Wrote this library because JSdom was too strict and too slow. Plus I only need basic selectors and basic DOM manipulation. Ran some preliminary tests and found that cheerio is about 8x faster than JSdom in parsing, manipulating, and rendering. 
  
## What about JSDOM?!
I decided to build this library because I had three frustrations with JSDOM:
- JSDOM's built-in parser is too strict. Cannot parse many "real-world" websites. Just try and parse Yahoo.com with JSDOM.
- JSDOM is too slow. Parsing big websites with JSDOM has noticeable delay.
- Feature-heavy. The goal of JSDOM is to provide an identical DOM environment as what we see in the browser. It's an ambitious goal and JSDOM is the closest out there, the fact that you can actually load the jQuery library on the server is amazing. The problem is many of these features aren't relevant on the server (AJAX, browser inconcistencies) and most of us don't need all these features. We need a library that understands HTML. A library that can parse, manipulate and traverse HTML blazingly fast and render with high accuracy. This is the goal of cheerio.
  
## API

### cheerio(html)
Initializes the library, parsing html and returning the DOM wrapping in the cheerio API. Typically this command will be run like this `$ = cheerio(html)`. Alternatively, you can run `$(selector, html)`. It is recommended that you use `cheerio(html)` if you are going to be working with extensively, because it only has to parse the html once.

### $(selector)
This will select your element from the DOM. This selection uses the wonderful *soupselect* library. Just like jQuery, you can manipulate and traverse the returned DOM element.

* Usage examples:
  * $(".header")
  * $("script")
  * $("#footer")
  * $("#footer a")
  * $("style[link=*.css]")
  * $(DOMElement)

* Future support:
  * $(".header, .footer")
  
> Note: In an effort to keep the library small, fancy selectors that can be replicated using the supported selectors will probably not be supported.

### Manipulation

#### $(selector).attr(attribute, value)
Gets an attribute from the selected element. If value is specified, it sets the attribute of the element and returns the selector.

#### $(selector).text()
Returns the text of an element.

#### $(selector).html()
Renders the html for the selected element

#### $(selector).remove()
Removes the element from the DOM

### Traversal

#### $(selector).each(fn)
Loops through each of the elements selected. Will issue the following callback `fn.call($(elem), elem, i)`. 

#### $(selector).children(i)
Returns a child element. If no index is specified, it will return all the children.

### Utilities

#### $.html()
Renders the entire DOM to HTML.

#### $.dom()
Returns a raw DOM object.



## License 

(The MIT License)

Copyright (c) 2011 Matt Mueller &lt;mattmuelle@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.