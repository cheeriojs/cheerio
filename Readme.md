# cheerio [![Build Status](https://secure.travis-ci.org/MatthewMueller/cheerio.png?branch=master)](http://travis-ci.org/MatthewMueller/cheerio)

Fast, flexible, and lean implementation of core jQuery designed specifically for the server.

## Introduction
Teach your server HTML.

    var cheerio = require("cheerio"),
        $ = cheerio.load("<h2 class = 'title'>Hello world</h2>");

    $('h2.title').text('Hello there!');
    $('h2').addClass('welcome');

    $.html();
    => <h2 class = "title welcome">Hello there!</h2>

## Installation
`npm install cheerio`

... or to install the package globally:

`npm install -g cheerio`

## Features
__&#10084; Familiar syntax:__
Cheerio implements a subset of core jQuery. Cheerio removes all the DOM inconsistencies and browser cruft from the jQuery library, revealing its truly gorgeous API.

__&#991; Blazingly fast:__
Cheerio works with a very simple, consistent DOM model. As a result parsing, manipulating, and rendering are incredibly efficient. Preliminary end-to-end benchmarks suggest that cheerio is about __8x__ faster than JSDOM.

__&#10049; Insanely flexible:__
Cheerio wraps around @tautologistics forgiving htmlparser. Cheerio can parse nearly any HTML or XML document.

## What about JSDOM?
I wrote cheerio because I found myself increasingly frustrated with JSDOM. For me, there were three main sticking points that I kept running into again and again:

__&#8226; JSDOM's built-in parser is too strict:__
  JSDOM's bundled HTML parser cannot handle many popular sites out there today.

__&#8226; JSDOM is too slow:__
Parsing big websites with JSDOM has a noticeable delay.

__&#8226; JSDOM feels too heavy:__
The goal of JSDOM is to provide an identical DOM environment as what we see in the browser. I never really needed all this, I just wanted a simple, familiar way to do HTML manipulation.

## When I would use JSDOM

Cheerio will not solve all your problems. I would still use JSDOM if I needed to work in a browser-like environment on the server, particularly if I wanted to automate functional tests.

## API

### Markup example we'll be using:

    <ul id = "fruits">
      <li class = "apple">Apple</li>
      <li class = "orange">Orange</li>
      <li class = "pear">Pear</li>
    </ul>

This is the HTML markup we will be using in all of the API examples.

### Loading
First you need to load in the HTML. This step in jQuery is implicit, since jQuery operates on the one, baked-in DOM. With Cheerio, we need to pass in the HTML document.

This is the _preferred_ method:

    var cheerio = require('cheerio'),
        $ = cheerio.load('<ul id = "fruits">...</ul>');

Optionally, you can also load in the HTML by passing the string as the context:

    $ = require('cheerio');
    $('ul', '<ul id = "fruits">...</ul>');

Or as the root:

    $ = require('cheerio');
    $('li', 'ul', '<ul id = "fruits">...</ul>');

You can also pass an extra object to `.load()` if you need to modify any
of the default parsing options:

    $ = cheerio.load('<ul id = "fruits">...</ul>', { ignoreWhitespace: false, xmlMode: true });

These parsing options are taken directly from htmlparser, therefore any options that can be used in htmlparser
are valid in cheerio as well. The default options are:

    { ignoreWhitespace: true, xmlMode: false, lowerCaseTags: false }

For a list of options and their effects, see [this](https://github.com/FB55/node-htmlparser/wiki/DOMHandler) and 
[this](https://github.com/FB55/node-htmlparser/wiki/Parser-options).

### Selectors

Cheerio's selector implementation is nearly identical to jQuery's, so the API is very similar.

#### $( selector, [context], [root] )
`selector` searches within the `context` scope which searches within the `root` scope. `selector` and `context` can be an string expression, DOM Element, array of DOM elements, or cheerio object. `root` is typically the HTML document string.

This selector method is the starting point for traversing and manipulating the document. Like jQuery, it's the primary method for selecting elements in the document, but unlike jQuery it's built on top of the soup-select library, not the Sizzle engine.

    $(".apple", '#fruits').text()
    => Apple

    $('ul .pear').attr('class')
    => pear

    $('li[class=orange]').html()
    => <li class = "orange">Orange</li>

See [cheerio-soupselect](https://github.com/MatthewMueller/cheerio-soupselect) for a list of all available selectors,
as well as more detailed documentation regarding what is supported and what isn't.

### Attributes
Methods for getting and modifying attributes.

#### .attr( name, value )
Method for getting and setting attributes. Gets the attribute value for only the first element in the matched set. If you set an attribute's value to `null`, you remove that attribute. You may also pass a `map` and `function` like jQuery.

    $('ul').attr('id')
    => fruits

    $('.apple').attr('id', 'favorite').html()
    => <li class = "apple" id = "favorite">Apple</li>

> See http://api.jquery.com/attr/ for more information

#### .removeAttr( name )
Method for removing attributes by `name`.

    $('.pear').removeAttr('class').html()
    => <li>Pear</li>

#### .hasClass( className )
Check to see if *any* of the matched elements have the given `className`.

    $('.pear').hasClass('pear')
    => true

    $('apple').hasClass('fruit')
    => false

    $('li').hasClass('pear')
    => true

#### .addClass( className )
Adds class(es) to all of the matched elements. Also accepts a `function` like jQuery.

    $('.pear').addClass('fruit').html()
    => <li class = "pear fruit">Pear</li>

    $('.apple').addClass('fruit red').html()
    => <li class = "apple fruit red">Apple</li>

> See http://api.jquery.com/addClass/ for more information.

#### .removeClass( [className] )
Removes one or more space-separated classes from the selected elements. If no `className` is defined, all classes will be removed. Also accepts a `function` like jQuery.

    $('.pear').removeClass('pear').html()
    => <li class = "">Pear</li>

    $('.apple').addClass('red').removeClass().html()
    => <li class = "">Apple</li>

> See http://api.jquery.com/removeClass/ for more information.


### Traversing

#### .find(selector)
Get a set of descendants filtered by `selector` of each element in the current set of matched elements.

    $('#fruits').find('li').size()
    => 3

#### .parent()
Gets the parent of the first selected element.

    $('.pear').parent().attr('id')
    => fruits

#### .next()
Gets the next sibling thats an element of the first selected element.

    $('.apple').next().hasClass('orange')
    => true

#### .prev()
Gets the previous sibling thats an element of the first selected element.

    $('.orange').prev().hasClass('apple')
    => true

#### .siblings()
Gets the first selected element's siblings, excluding itself.

    $('.pear').siblings().length
    => 2

#### .children( selector )
Gets the children of the first selected element.

    $('#fruits').children().length
    => 3

    $('#fruits').children('.pear').text()
    => Pear

#### .each( function(index, element) )
Iterates over a cheerio object, executing a function for each matched element. When the callback is fired, the function is fired in the context of the DOM element, so `this` refers to the current element, which is equivalent to the function parameter `element`.

    var fruits = [];

    $('li').each(function(i, elem) {
      fruits[i] = $(this).text();
    });

    fruits.join(', ');
    => Apple, Orange, Pear

#### .first()
Will select the first element of a cheerio object

    $('#fruits').children().first().text()
    => Apple

#### .last()
Will select the last element of a cheerio object

    $('#fruits').children().last().text()
    => Pear

### Manipulation
Methods for modifying the DOM structure.

#### .append( content, [content, ...] )
Inserts content as the *last* child of each of the selected elements.

    $('ul').append('<li class = "plum">Plum</li>')
    $.html()
    =>  <ul id = "fruits">
          <li class = "apple">Apple</li>
          <li class = "orange">Orange</li>
          <li class = "pear">Pear</li>
          <li class = "plum">Plum</li>
        </ul>

#### .prepend( content, [content, ...] )
Inserts content as the *first* child of each of the selected elements.

    $('ul').prepend('<li class = "plum">Plum</li>')
    $.html()
    =>  <ul id = "fruits">
          <li class = "plum">Plum</li>
          <li class = "apple">Apple</li>
          <li class = "orange">Orange</li>
          <li class = "pear">Pear</li>
        </ul>

#### .after( content, [content, ...] )
Insert content next to each element in the set of matched elements.

    $('.apple').after('<li class = "plum">Plum</li>')
    $.html()
    =>  <ul id = "fruits">
          <li class = "apple">Apple</li>
          <li class = "plum">Plum</li>
          <li class = "orange">Orange</li>
          <li class = "pear">Pear</li>
        </ul>

#### .before( content, [content, ...] )
Insert content previous to each element in the set of matched elements.

    $('.apple').before('<li class = "plum">Plum</li>')
    $.html()
    =>  <ul id = "fruits">
          <li class = "plum">Plum</li>
          <li class = "apple">Apple</li>
          <li class = "orange">Orange</li>
          <li class = "pear">Pear</li>
        </ul>

#### .remove( [selector] )
Removes the set of matched elements from the DOM and all their children. `selector` filters the set of matched elements to be removed.

    $('.pear').remove()
    $.html()
    =>  <ul id = "fruits">
          <li class = "apple">Apple</li>
          <li class = "orange">Orange</li>
        </ul>

#### .replaceWith( content )
Replaces matched elements with `content`.

    var plum = $('<li class = "plum">Plum</li>')
    $('.pear').replaceWith(plum)
    $.html()
    => <ul id = "fruits">
         <li class = "apple">Apple</li>
         <li class = "orange">Orange</li>
         <li class = "plum">Plum</li>
       </ul>      

#### .empty()
Empties an element, removing all it's children.

    $('ul').empty()
    $.html()
    =>  <ul id = "fruits"></ul>

#### .html( [htmlString] )
Gets an html content string from the first selected element. If `htmlString` is specified, each selected element's content is replaced by the new content.

    $('.orange').html()
    => <li class = "orange">Orange</li>

    $('#fruits').html('<li class = "mango">Mango</li>').html()
    =>  <ul id="fruits">
          <li class="mango">Mango</li>
        </ul>

#### .text( [textString] )
Get the combined text contents of each element in the set of matched elements, including their descendants.. If `textString` is specified, each selected element's content is replaced by the new text content.

    $('.orange').text()
    => Orange

    $('ul').text()
    =>  Apple
        Orange
        Pear

### Rendering
When you're ready to render the document, you can use `html` utility function:

    $.html()
    =>  <ul id = "fruits">
          <li class = "apple">Apple</li>
          <li class = "orange">Orange</li>
          <li class = "pear">Pear</li>
        </ul>

If you want to render just a piece of the document you can use selectors:

    $('.pear').html()
    => <li class = "pear">Pear</li>
### Miscellaneous
DOM element methods that don't fit anywhere else

#### .get( [index] )
Retrieve the DOM elements matched by the cheerio object. If no index is specified, it will get an array of all matched elements.

    $('li').get(0)
    => { raw: 'li class="apple"', ... }

    $('li').get()
    => [ {...}, {...}, {...} ]

#### .size()
Return the number of elements in the cheerio object. Same as `length`.

    $('li').size()
    => 3

#### .toArray()
Retrieve all the DOM elements contained in the jQuery set, as an array.

    $('li').toArray()
    => [ {...}, {...}, {...} ]
    
#### .clone() ####
Clone the cheerio object.

    var moreFruit = $('#fruits').clone()
    
### Utilities

#### $.dom()
Get the raw DOM of the parsed HTML document.

    $.dom()
    => [ { raw: 'ul id="fruits"',
        data: 'ul id="fruits"',
        type: 'tag',
        name: 'ul',
        attribs: { id: 'fruits' },
        children:
         [ [Object],
           [Object],
           [Object],
           [Object],
           [Object],
           [Object],
           [Object] ],
        parent: null,
        prev: null,
        next: null } ]

#### $.isArray( array )
Checks to see the passed argument is an array.

    $.isArray( $.dom() )
    => true

#### $.inArray( elem, arr )
Checks to see if the element is in the array

#### $.makeArray( obj )
Turns an array-like object (like $) into a native array.

#### $.each( obj, function(index, elem) )
Generic iterator function.

#### $.merge( one, two )
Merge the contents of two arrays together into the first array.

## Screencasts

http://vimeo.com/31950192

> This video tutorial is a follow-up to Nettut's "How to Scrape Web Pages with Node.js and jQuery", using cheerio instead of JSDOM + jQuery. This video shows how easy it is to use cheerio and how much faster cheerio is than JSDOM + jQuery.

## Testing

To run the test suite, download the repository, then within the cheerio directory, run:

    npm install .
    make test

This will download the development packages and run the test suite.
## Special Thanks

This library stands on the shoulders of some incredible developers. A special thanks to:

__&#8226; @tautologistics' node-htmlparser:__
This HTML parser can parse anything and produces really consistent results, even when the HTML string has errors. This man is a genius.

__&#8226; @harryf's node-soupselect:__
What an incredibly fast and precise CSS selector engine. I never really liked the feature-rich selector engines &#8212; I think this engine strikes a great balance.

__&#8226; @jQuery team:__
The core API is the best of it's class and despite dealing with all the browser inconsistencies the code base is extremely clean and easy to follow. Much of cheerio's implementation and documentation is from jQuery. Thanks guys.

__&#8226; @visionmedia:__
The style, the structure, the open-source"-ness" of this library comes from studying TJ's style and using many of his libraries. This dude consistently pumps out high-quality libraries and has always been more than willing to help or answer questions. You rock TJ.
## License

(The MIT License)

Copyright (c) 2012 Matt Mueller &lt;mattmuelle@gmail.com&gt;

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
