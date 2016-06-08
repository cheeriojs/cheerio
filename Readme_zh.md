===================以下是中文部分==================

# cheerio [![Build Status](https://secure.travis-ci.org/cheeriojs/cheerio.svg?branch=master)](http://travis-ci.org/cheeriojs/cheerio) [![Coverage](http://img.shields.io/coveralls/cheeriojs/cheerio.svg?branch=master&style=flat)](https://coveralls.io/r/cheeriojs/cheerio) [![Join the chat at https://gitter.im/cheeriojs/cheerio](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/cheeriojs/cheerio?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<!-- Fast, flexible, and lean implementation of core jQuery designed specifically for the server. -->
快速，灵活并且精简的专门针对服务器的核心JQuery实现
<!-- ## Introduction -->
## 介绍
<!-- Teach your server HTML. -->
让你的服务端HTML代码这样写.
```js
var cheerio = require('cheerio'),
    $ = cheerio.load('<h2 class="title">Hello world</h2>');

$('h2.title').text('Hello there!');
$('h2').addClass('welcome');

$.html();
//=> <h2 class="title welcome">Hello there!</h2>
```

<!-- ## Installation -->
## 安装
`npm install cheerio`

<!-- ## Features -->
## 特点
<!-- __&#10084; Familiar syntax:__ -->
__&#10084; 相似的语法:__
<!-- Cheerio implements a subset of core jQuery. Cheerio removes all the DOM inconsistencies and browser cruft from the jQuery library, revealing its truly gorgeous API. -->
cheerio工具是核心jQuery的子集。cheerio会从jQuery库中删除所有DOM矛盾和浏览器的讨厌部分,展示她真正华丽的API。

<!-- __&#991; Blazingly fast:__ -->
__&#991; 非常快:__
<!-- Cheerio works with a very simple, consistent DOM model. As a result parsing, manipulating, and rendering are incredibly efficient. Preliminary end-to-end benchmarks suggest that cheerio is about __8x__ faster than JSDOM. -->
cheerio使用一个非常简单的、一致的DOM模型。作为一个结果分析、处理和呈现的工具非常有效。初步的端到端基准表明其速度是JSDOM的__8x__倍。

<!-- __&#10049; Incredibly flexible:__ -->
__&#10049; 非常的灵活:__
<!-- Cheerio wraps around @FB55's forgiving [htmlparser2](https://github.com/fb55/htmlparser2/). Cheerio can parse nearly any HTML or XML document. -->
cheerio基于 @FB55's forgiving [htmlparser2](https://github.com/fb55/htmlparser2/)。cheerio可以解析几乎任何HTML或XML文档。

<!-- ## What about JSDOM? -->
## 关于JSDOM?
<!-- I wrote cheerio because I found myself increasingly frustrated with JSDOM. For me, there were three main sticking points that I kept running into again and again: -->
我写cheerio主要是因为我发现我自己对JSDOM非常失望。对我来说,主要有三个点让我一直耿耿于怀:

<!-- __&#8226; JSDOM's built-in parser is too strict:__ -->
__&#8226; JSDOM's built-in parser 太严格:__
  
  JSDOM捆绑的HTML解析器不能处理今天许多流行的网站。

<!-- __&#8226; JSDOM is too slow:__ -->
__&#8226; JSDOM 太慢了:__
<!-- Parsing big websites with JSDOM has a noticeable delay. -->
解析大网站JSDOM有明显的延迟。

<!-- __&#8226; JSDOM feels too heavy:__ -->
__&#8226; JSDOM 感觉太笨重了:__
<!-- The goal of JSDOM is to provide an identical DOM environment as what we see in the browser. I never really needed all this, I just wanted a simple, familiar way to do HTML manipulation. -->
JSDOM的目标是提供一个相同DOM环境正如我们在浏览器中所看到的。我从未真正需要所有这些,我只是想要一个简单,熟悉HTML操作方法。

<!-- ## When I would use JSDOM -->
## 我什么时候会使用JSDOM

<!-- Cheerio will not solve all your problems. I would still use JSDOM if I needed to work in a browser-like environment on the server, particularly if I wanted to automate functional tests. -->
cheerio不能解决你所有的问题。我仍然会使用JSDOM如果我需要工作在服务器上的浏览器环境中,特别是如果我想自动化功能测试。
## API

<!-- ### Markup example we'll be using: -->
### 我们会一直使用以下例子:

```html
<ul id="fruits">
  <li class="apple">Apple</li>
  <li class="orange">Orange</li>
  <li class="pear">Pear</li>
</ul>
```

<!-- This is the HTML markup we will be using in all of the API examples. -->
这是在所有的API例子中一直要使用的HTML例子。

<!-- ### Loading -->
### 加载

<!-- First you need to load in the HTML. This step in jQuery is implicit, since jQuery operates on the one, baked-in DOM. With Cheerio, we need to pass in the HTML document. -->
首先你需要加载HTML。jQuery的这一步是隐式的,因为一个jQuery运行,常用DOM。在cheerio中,我们需要通过在HTML文档。

<!-- This is the _preferred_ method: -->
这是首选的方法:

```js
var cheerio = require('cheerio'),
    $ = cheerio.load('<ul id="fruits">...</ul>');
```

<!-- Optionally, you can also load in the HTML by passing the string as the context: -->
根据情况,您还可以通过环境加载HTML字符串:

```js
$ = require('cheerio');
$('ul', '<ul id="fruits">...</ul>');
```

<!-- Or as the root: -->
或作为根:

```js
$ = require('cheerio');
$('li', 'ul', '<ul id="fruits">...</ul>');
```

<!-- You can also pass an extra object to `.load()` if you need to modify any -->
<!-- of the default parsing options: -->
如果你需要修改默认的解析选项你也可以传给`.load()`一个额外的对象:

```js
$ = cheerio.load('<ul id="fruits">...</ul>', {
    normalizeWhitespace: true,
    xmlMode: true
});
```

<!-- These parsing options are taken directly from [htmlparser2](https://github.com/fb55/htmlparser2/wiki/Parser-options), therefore any options that can be used in `htmlparser2` are valid in cheerio as well. The default options are: -->
这些解析选项直接取自[htmlparser2](https://github.com/fb55/htmlparser2/wiki/Parser-options),因此也可以在cheerio中使用任何在`htmlparser2`中有效的选项。默认的选项是:

```js
{
    normalizeWhitespace: false,
    xmlMode: false,
    decodeEntities: true
}

```

<!-- For a full list of options and their effects, see [this](https://github.com/fb55/DomHandler) and -->
<!-- [htmlparser2's options](https://github.com/fb55/htmlparser2/wiki/Parser-options). -->
至于一个完整的选项列表和他们的影响,看 [this](https://github.com/fb55/DomHandler)和
[htmlparser2's options](https://github.com/fb55/htmlparser2/wiki/Parser-options).

<!-- ### Selectors -->
### 选择器

<!-- Cheerio's selector implementation is nearly identical to jQuery's, so the API is very similar. -->
cheerio和jQuery选择器的实现几乎是相同的,所以API非常相似。

#### $( selector, [context], [root] )
<!-- `selector` searches within the `context` scope which searches within the `root` scope. `selector` and `context` can be a string expression, DOM Element, array of DOM elements, or cheerio object. `root` is typically the HTML document string. -->

<!-- This selector method is the starting point for traversing and manipulating the document. Like jQuery, it's the primary method for selecting elements in the document, but unlike jQuery it's built on top of the CSSSelect library, which implements most of the Sizzle selectors. -->
`selector` 在 `root` 的范围内搜索 `context` 。`selector`和`context`可以是一个字符串表达式,DOM元素,DOM元素的数组,或cheerio对象。`root` 通常是HTML文档字符串。

这个选择器方法的出发点是遍历和操作文档。就像jQuery,它是选择文档中元素的主要方法,但不像jQuery它基于CSSSelect库来实现大部分的选择器。

```js
$('.apple', '#fruits').text()
//=> Apple

$('ul .pear').attr('class')
//=> pear

$('li[class=orange]').html()
//=> Orange
```

<!-- ### Attributes -->
### 属性
<!-- Methods for getting and modifying attributes. -->
获取和修改属性的方法。

#### .attr( name, value )
<!-- Method for getting and setting attributes. Gets the attribute value for only the first element in the matched set. If you set an attribute's value to `null`, you remove that attribute. You may also pass a `map` and `function` like jQuery. -->
获取和设置属性的方法。获取匹配集合中的第一个元素的属性值。如果您将属性值设置为空，您将删除该属性。你也可以像jQuery函数一样通过`map` 和 `function`来设置。

```js
$('ul').attr('id')
//=> fruits

$('.apple').attr('id', 'favorite').html()
//=> <li class="apple" id="favorite">Apple</li>
```

> See http://api.jquery.com/attr/ for more information

#### .prop( name, value )
<!-- Method for getting and setting properties. Gets the property value for only the first element in the matched set. -->
获取和设置属性的方法。获取唯一匹配集的第一元素的属性值。

```js
$('input[type="checkbox"]').prop('checked')
//=> false

$('input[type="checkbox"]').prop('checked', true).val()
//=> ok
```

> See http://api.jquery.com/prop/ for more information

#### .data( name, value )
<!-- Method for getting and setting data attributes. Gets or sets the data attribute value for only the first element in the matched set. -->
获取和设置数据属性的方法。获取或设置仅在匹配集合中的第一个元素的数据属性值。

```js
$('<div data-apple-color="red"></div>').data()
//=> { appleColor: 'red' }

$('<div data-apple-color="red"></div>').data('apple-color')
//=> 'red'

var apple = $('.apple').data('kind', 'mac')
apple.data('kind')
//=> 'mac'
```

> See http://api.jquery.com/data/ for more information

#### .val( [value] )
<!-- Method for getting and setting the value of input, select, and textarea. Note: Support for `map`, and `function` has not been added yet. -->
用于获取和设置值输入，选择，和文本的方法。注：支持`map`,  `function`尚未加入。

```js
$('input[type="text"]').val()
//=> input_text

$('input[type="text"]').val('test').html()
//=> <input type="text" value="test"/>
```

#### .removeAttr( name )
<!-- Method for removing attributes by `name`. -->
通过`name`属性移除元素

```js
$('.pear').removeAttr('class').html()
//=> <li>Pear</li>
```

#### .hasClass( className )
<!-- Check to see if *any* of the matched elements have the given `className`. -->
检查任何一个匹配的元素中是否有` className `。

```js
$('.pear').hasClass('pear')
//=> true

$('apple').hasClass('fruit')
//=> false

$('li').hasClass('pear')
//=> true
```

#### .addClass( className )
<!-- Adds class(es) to all of the matched elements. Also accepts a `function` like jQuery. -->
在所有匹配的元素中添加类。也像jQuery函数一样接受`function`。

```js
$('.pear').addClass('fruit').html()
//=> <li class="pear fruit">Pear</li>

$('.apple').addClass('fruit red').html()
//=> <li class="apple fruit red">Apple</li>
```

> See http://api.jquery.com/addClass/ for more information.

#### .removeClass( [className] )
<!-- Removes one or more space-separated classes from the selected elements. If no `className` is defined, all classes will be removed. Also accepts a `function` like jQuery. -->
从选定的元素中删除一个或多个空格分隔的类。如果` className `是未定义的(未传参数)，所有的类将被删除。也像jQuery函数一样接受`function`。

```js
$('.pear').removeClass('pear').html()
//=> <li class="">Pear</li>

$('.apple').addClass('red').removeClass().html()
//=> <li class="">Apple</li>
```

> See http://api.jquery.com/removeClass/ for more information.

#### .toggleClass( className, [switch] )
<!-- Add or remove class(es) from the matched elements, depending on either the class's presence or the value of the switch argument. Also accepts a `function` like jQuery. -->
从匹配的元素中添加或删除类，这取决于类的存在或切换参数的值。也像jQuery函数一样接受`function`。

```js
$('.apple.green').toggleClass('fruit green red').html()
//=> <li class="apple fruit red">Apple</li>

$('.apple.green').toggleClass('fruit green red', true).html()
//=> <li class="apple green fruit red">Apple</li>
```

> See http://api.jquery.com/toggleClass/ for more information.

#### .is( selector )
#### .is( element )
#### .is( selection )
#### .is( function(index) )
<!-- Checks the current list of elements and returns `true` if _any_ of the elements match the selector. If using an element or Cheerio selection, returns `true` if _any_ of the elements match. If using a predicate function, the function is executed in the context of the selected element, so `this` refers to the current element. -->
检查元素如果任何元素匹配了选择器就返回`true`。如果使用一个元素或Cheerio选择,则元素匹配就返回`真`。如果使用谓词函数，该函数将在选定的元素的上下文中执行，所以`this`是指当前元素。

### Forms

#### .serializeArray()

<!-- Encode a set of form elements as an array of names and values. -->
将一组表单元素编码为一组名称和值。

```js
$('<form><input name="foo" value="bar" /></form>').serializeArray()
//=> [ { name: 'foo', value: 'bar' } ]
```

### Traversing

#### .find(selector)
#### .find(selection)
#### .find(node)
<!-- Get the descendants of each element in the current set of matched elements, filtered by a selector, jQuery object, or element. -->
通过过滤选择器，jQuery对象或元素，获取每个匹配元素的后代。

```js
$('#fruits').find('li').length
//=> 3
$('#fruits').find($('.apple')).length
//=> 1
```

#### .parent([selector])
<!-- Get the parent of each element in the current set of matched elements, optionally filtered by a selector. -->
在当前集合中的每个元素的父元素中，选择一个选择器进行筛选。

```js
$('.pear').parent().attr('id')
//=> fruits
```

#### .parents([selector])
Get a set of parents filtered by `selector` of each element in the current set of match elements.
```js
$('.orange').parents().length
// => 2
$('.orange').parents('#fruits').length
// => 1
```

#### .parentsUntil([selector][,filter])
<!-- Get the ancestors of each element in the current set of matched elements, up to but not including the element matched by the selector, DOM node, or cheerio object. -->
获取匹配元素的祖先元素直到碰到匹配的选择器DOM节点或cheerio对象。

```js
$('.orange').parentsUntil('#food').length
// => 1
```

#### .closest(selector)
<!-- For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree. -->
集合中的每个元素，获得选择器匹配元素的第一个匹配的祖先元素。

```js
$('.orange').closest()
// => []
$('.orange').closest('.apple')
// => []
$('.orange').closest('li')
// => [<li class="orange">Orange</li>]
$('.orange').closest('#fruits')
// => [<ul id="fruits"> ... </ul>]
```

#### .next([selector])
<!-- Gets the next sibling of the first selected element, optionally filtered by a selector. -->
通过一个选择器筛选获取第一选定元素的下一个兄弟姐妹。

```js
$('.apple').next().hasClass('orange')
//=> true
```

#### .nextAll([selector])
<!-- Gets all the following siblings of the first selected element, optionally filtered by a selector. -->
通过一个选择器筛选来获取所有下列第一选择元素的兄弟姐妹
```js
$('.apple').nextAll()
//=> [<li class="orange">Orange</li>, <li class="pear">Pear</li>]
$('.apple').nextAll('.orange')
//=> [<li class="orange">Orange</li>]
```

#### .nextUntil([selector], [filter])
<!-- Gets all the following siblings up to but not including the element matched by the selector, optionally filtered by another selector. -->
得到所有下面的兄弟姐妹，但不包括由选择器匹配的元素，可以选择由另一个选择器筛选。

```js
$('.apple').nextUntil('.pear')
//=> [<li class="orange">Orange</li>]
```

#### .prev([selector])
<!-- Gets the previous sibling of the first selected element optionally filtered by a selector. -->
获取选定元素的前一个兄弟姐妹，可以选择一个选择器筛选。

```js
$('.orange').prev().hasClass('apple')
//=> true
```

#### .prevAll([selector])
<!-- Gets all the preceding siblings of the first selected element, optionally filtered by a selector. -->
获取所选元素的所有前一个兄弟姐妹，选择一个选择器进行筛选。

```js
$('.pear').prevAll()
//=> [<li class="orange">Orange</li>, <li class="apple">Apple</li>]
$('.pear').prevAll('.orange')
//=> [<li class="orange">Orange</li>]
```

#### .prevUntil([selector], [filter])
<!-- Gets all the preceding siblings up to but not including the element matched by the selector, optionally filtered by another selector. -->
得到所有的前一个兄弟姐妹，但不包括由选择器匹配的元素，选择另一个选择器筛选。

```js
$('.pear').prevUntil('.apple')
//=> [<li class="orange">Orange</li>]
```

#### .slice( start, [end] )
<!-- Gets the elements matching the specified range -->
获取指定范围匹配的元素

```js
$('li').slice(1).eq(0).text()
//=> 'Orange'

$('li').slice(1, 2).length
//=> 1
```

#### .siblings([selector])
<!-- Gets the first selected element's siblings, excluding itself. -->
获取第一选定元素的兄弟姐妹，不包括它自己。

```js
$('.pear').siblings().length
//=> 2

$('.pear').siblings('.orange').length
//=> 1

```

#### .children([selector])
<!-- Gets the children of the first selected element. -->
获取第一选定元素的孩子元素。

```js
$('#fruits').children().length
//=> 3

$('#fruits').children('.pear').text()
//=> Pear
```

#### .contents()
<!-- Gets the children of each element in the set of matched elements, including text and comment nodes. -->
获取匹配元素集合中的每个元素的孩子元素，包括文本和注释节点。

```js
$('#fruits').contents().length
//=> 3
```

#### .each( function(index, element) )
<!-- Iterates over a cheerio object, executing a function for each matched element. When the callback is fired, the function is fired in the context of the DOM element, so `this` refers to the current element, which is equivalent to the function parameter `element`. To break out of the `each` loop early, return with `false`. -->
遍历一个cheerio对象，为每一个匹配元素的执行函数。当回调被解雇，功能是在DOM元素的上下文被解雇，所以`这`指向当前元素，这相当于函数的参数`element`。要提前打破的`each`循环，那么返回`false`。

```js
var fruits = [];

$('li').each(function(i, elem) {
  fruits[i] = $(this).text();
});

fruits.join(', ');
//=> Apple, Orange, Pear
```

#### .map( function(index, element) )
<!-- Pass each element in the current matched set through a function, producing a new Cheerio object containing the return values. The function can return an individual data item or an array of data items to be inserted into the resulting set. If an array is returned, the elements inside the array are inserted into the set. If the function returns null or undefined, no element will be inserted. -->
通过每个在匹配函数产生的匹配集合中的匹配元素，产生一个新的包含返回值的cheerio对象。该函数可以返回一个单独的数据项或一组数据项被插入到所得到的集合中。如果返回一个数组，数组中的元素插入到集合中。如果函数返回空或未定义，则将插入任何元素。

```js
$('li').map(function(i, el) {
  // this === el
  return $(this).text();
}).get().join(' ');
//=> "apple orange pear"
```

#### .filter( selector ) <br /> .filter( selection ) <br /> .filter( element ) <br /> .filter( function(index) )

<!-- Iterates over a cheerio object, reducing the set of selector elements to those that match the selector or pass the function's test. When a Cheerio selection is specified, return only the elements contained in that selection. When an element is specified, return only that element (if it is contained in the original selection). If using the function method, the function is executed in the context of the selected element, so `this` refers to the current element. -->
遍历一个cheerio对象，降低通过选择器匹配的元素，或传递函数的测试的选择器元素组。当一个cheerio的选择是特定的，只返回元素的选择。当指定元素时，返回该元素（如果它包含在原始选择中）。如果使用该函数方法，该函数将在选定的元素的上下文中执行，所以`this`是指当前元素。

Selector:

```js
$('li').filter('.orange').attr('class');
//=> orange
```

Function:

```js
$('li').filter(function(i, el) {
  // this === el
  return $(this).attr('class') === 'orange';
}).attr('class')
//=> orange
```

#### .not( selector ) <br /> .not( selection ) <br /> .not( element ) <br /> .not( function(index, elem) )

<!-- Remove elements from the set of matched elements. Given a jQuery object that represents a set of DOM elements, the `.not()` method constructs a new jQuery object from a subset of the matching elements. The supplied selector is tested against each element; the elements that don't match the selector will be included in the result. The `.not()` method can take a function as its argument in the same way that `.filter()` does. Elements for which the function returns true are excluded from the filtered set; all other elements are included. -->
从匹配的元素集合中删除元素。给定一个jQuery对象表示一组DOM元素，`.not() `方法从匹配的元素的子集构造了一种新的jQuery对象。所提供的选择器对每个元素进行了测试；结果中不匹配选择器的元素将被包含在该结果中。`.not() `方法可以把一个函数作为参数就像`.filter() `一样。将函数返回为真的元素从过滤的集合中排除，所有其他元素都包括在内。

<!-- Selector: -->
选择器:

```js
$('li').not('.apple').length;
//=> 2
```

Function:

```js
$('li').not(function(i, el) {
  // this === el
  return $(this).attr('class') === 'orange';
}).length;
//=> 2
```

#### .has( selector ) <br /> .has( element )

<!-- Filters the set of matched elements to only those which have the given DOM element as a descendant or which have a descendant that matches the given selector. Equivalent to `.filter(':has(selector)')`. -->
只有把那些特定的DOM元素作为后代或匹配了给定选择器的后裔才能过滤进匹配的元素集。相当于`.filter(':has(selector)')`。

选择器:

```js
$('ul').has('.pear').attr('id');
//=> fruits
```

元素:

```js
$('ul').has($('.pear')[0]).attr('id');
//=> fruits
```

#### .first()
<!-- Will select the first element of a cheerio object -->
选择一个cheerio的对象的第一个元素

```js
$('#fruits').children().first().text()
//=> Apple
```

#### .last()
<!-- Will select the last element of a cheerio object -->
选择一个cheerio对象的最后一个元素

```js
$('#fruits').children().last().text()
//=> Pear
```

#### .eq( i )
<!-- Reduce the set of matched elements to the one at the specified index. Use `.eq(-i)` to count backwards from the last selected element. -->
根据索引来确定元素。使用 `.eq(-i)` 的则是倒过来计数。

```js
$('li').eq(0).text()
//=> Apple

$('li').eq(-1).text()
//=> Pear
```

#### .get( [i] )

<!-- Retrieve the DOM elements matched by the Cheerio object. If an index is specified, retrieve one of the elements matched by the Cheerio object: -->
检索出匹配的cheerio对象的DOM元素。如果指定索引，检索出一个匹配的cheerio对象的元素：

```js
$('li').get(0).tagName
//=> li
```

<!-- If no index is specified, retrieve all elements matched by the Cheerio object: -->
如果没有指定索引，检索出所有匹配的cheerio对象元素：

```js
$('li').get().length
//=> 3
```

#### .index()
#### .index( selector )
#### .index( nodeOrSelection )

<!-- Search for a given element from among the matched elements. -->
在匹配元素中搜索给定元素。

```js
$('.pear').index()
//=> 2
$('.orange').index('li')
//=> 1
$('.apple').index($('#fruit, li'))
//=> 1
```

#### .end()
<!-- End the most recent filtering operation in the current chain and return the set of matched elements to its previous state. -->
结束当前链中最新的过滤操作，将匹配的元素集合返回到它的前一状态。

```js
$('li').eq(0).end().length
//=> 3
```

#### .add( selector [, context] )
#### .add( element )
#### .add( elements )
#### .add( html )
#### .add( selection )
<!-- Add elements to the set of matched elements. -->
在匹配元素集合中添加元素。

```js
$('.apple').add('.orange').length
//=> 2
```

#### .addBack( [filter] )

<!-- Add the previous set of elements on the stack to the current set, optionally filtered by a selector. -->
将堆栈上的前一组元素添加到当前集合中，选择一个选择器进行筛选。

```js
$('li').eq(0).addBack('.orange').length
//=> 2
```

<!-- ### Manipulation -->
### 操作
<!-- Methods for modifying the DOM structure. -->
修改DOM结构的方法。

#### .append( content, [content, ...] )
<!-- Inserts content as the *last* child of each of the selected elements. -->
插入内容为每个选定元素的 *last* 孩子。

```js
$('ul').append('<li class="plum">Plum</li>')
$.html()
//=>  <ul id="fruits">
//      <li class="apple">Apple</li>
//      <li class="orange">Orange</li>
//      <li class="pear">Pear</li>
//      <li class="plum">Plum</li>
//    </ul>
```

#### .appendTo( target )
<!-- Insert every element in the set of matched elements to the end of the target. -->
将每一个元素插入到目标的末端。

```js
$('<li class="plum">Plum</li>').appendTo('#fruits')
$.html()
//=>  <ul id="fruits">
//      <li class="apple">Apple</li>
//      <li class="orange">Orange</li>
//      <li class="pear">Pear</li>
//      <li class="plum">Plum</li>
//    </ul>
```

#### .prepend( content, [content, ...] )
<!-- Inserts content as the *first* child of each of the selected elements. -->
插入内容为每个选定元素的 *first* 孩子。

```js
$('ul').prepend('<li class="plum">Plum</li>')
$.html()
//=>  <ul id="fruits">
//      <li class="plum">Plum</li>
//      <li class="apple">Apple</li>
//      <li class="orange">Orange</li>
//      <li class="pear">Pear</li>
//    </ul>
```

#### .prependTo( target )
<!-- Insert every element in the set of matched elements to the beginning of the target. -->
将每一个元素插入到目标的开始。

```js
$('<li class="plum">Plum</li>').prependTo('#fruits')
$.html()
//=>  <ul id="fruits">
//      <li class="plum">Plum</li>
//      <li class="apple">Apple</li>
//      <li class="orange">Orange</li>
//      <li class="pear">Pear</li>
//    </ul>
```

#### .after( content, [content, ...] )
<!-- Insert content next to each element in the set of matched elements. -->
在匹配元素集合中的元素后面插入内容。

```js
$('.apple').after('<li class="plum">Plum</li>')
$.html()
//=>  <ul id="fruits">
//      <li class="apple">Apple</li>
//      <li class="plum">Plum</li>
//      <li class="orange">Orange</li>
//      <li class="pear">Pear</li>
//    </ul>
```

#### .insertAfter( target )
<!-- Insert every element in the set of matched elements after the target. -->
将每一个元素插入匹配元素集合中的目标后。

```js
$('<li class="plum">Plum</li>').insertAfter('.apple')
$.html()
//=>  <ul id="fruits">
//      <li class="apple">Apple</li>
//      <li class="plum">Plum</li>
//      <li class="orange">Orange</li>
//      <li class="pear">Pear</li>
//    </ul>
```

#### .before( content, [content, ...] )
<!-- Insert content previous to each element in the set of matched elements. -->
在匹配元素集合的元素前插入元素。

```js
$('.apple').before('<li class="plum">Plum</li>')
$.html()
//=>  <ul id="fruits">
//      <li class="plum">Plum</li>
//      <li class="apple">Apple</li>
//      <li class="orange">Orange</li>
//      <li class="pear">Pear</li>
//    </ul>
```

#### .insertBefore( target )
<!-- Insert every element in the set of matched elements before the target. -->
在目标元素前插入元素。

```js
$('<li class="plum">Plum</li>').insertBefore('.apple')
$.html()
//=>  <ul id="fruits">
//      <li class="plum">Plum</li>
//      <li class="apple">Apple</li>
//      <li class="orange">Orange</li>
//      <li class="pear">Pear</li>
//    </ul>
```

#### .remove( [selector] )
<!-- Removes the set of matched elements from the DOM and all their children. `selector` filters the set of matched elements to be removed. -->
将匹配的元素集合从DOM和他们的孩子节点中删除。

```js
$('.pear').remove()
$.html()
//=>  <ul id="fruits">
//      <li class="apple">Apple</li>
//      <li class="orange">Orange</li>
//    </ul>
```

#### .replaceWith( content )
<!-- Replaces matched elements with `content`. -->
将匹配的元素替换为 `content`。

```js
var plum = $('<li class="plum">Plum</li>')
$('.pear').replaceWith(plum)
$.html()
//=> <ul id="fruits">
//     <li class="apple">Apple</li>
//     <li class="orange">Orange</li>
//     <li class="plum">Plum</li>
//   </ul>
```

#### .empty()
<!-- Empties an element, removing all its children. -->
清空一个元素，去除所有的孩子。

```js
$('ul').empty()
$.html()
//=>  <ul id="fruits"></ul>
```

#### .html( [htmlString] )
<!-- Gets an html content string from the first selected element. If `htmlString` is specified, each selected element's content is replaced by the new content. -->
获取第一个选中元素的HTML内容字符串。如果` htmlstring `被指定，那么选中元素的内容被新内容所取代。

```js
$('.orange').html()
//=> Orange

$('#fruits').html('<li class="mango">Mango</li>').html()
//=> <li class="mango">Mango</li>
```

#### .text( [textString] )
<!-- Get the combined text contents of each element in the set of matched elements, including their descendants.. If `textString` is specified, each selected element's content is replaced by the new text content. -->
获取元素集合中的每个元素的合并文本内容，包括它们的后代。如果 `textString` 指定文本字符串，每个元素的内容被新的内容替换。

```js
$('.orange').text()
//=> Orange

$('ul').text()
//=>  Apple
//    Orange
//    Pear
```

#### .wrap( content )
<!-- The .wrap() function can take any string or object that could be passed to the $() factory function to specify a DOM structure. This structure may be nested several levels deep, but should contain only one inmost element. A copy of this structure will be wrapped around each of the elements in the set of matched elements. This method returns the original set of elements for chaining purposes. -->
.wrap()函数可以使用任何可以传递给$()工厂函数字符串或对象来指定DOM结构。这种结构可以嵌套多个层次，但应该只包含一个内心深处的元素。这一结构的副本将在匹配的元素集合中的每一个元素被包装。此方法返回的链接目标的原始元素集。

```js
var redFruit = $('<div class="red-fruit"></div>')
$('.apple').wrap(redFruit)

//=> <ul id="fruits">
//     <div class="red-fruit">
//      <li class="apple">Apple</li>
//     </div>
//     <li class="orange">Orange</li>
//     <li class="plum">Plum</li>
//   </ul>

var healthy = $('<div class="healthy"></div>')
$('li').wrap(healthy)

//=> <ul id="fruits">
//     <div class="healthy">
//       <li class="apple">Apple</li>
//     </div>
//     <div class="healthy">
//       <li class="orange">Orange</li>
//     </div>
//     <div class="healthy">
//        <li class="plum">Plum</li>
//     </div>
//   </ul>
```

#### .css( [propertName] ) <br /> .css( [ propertyNames] ) <br /> .css( [propertyName], [value] ) <br /> .css( [propertName], [function] ) <br /> .css( [properties] )

<!-- Get the value of a style property for the first element in the set of matched elements or set one or more CSS properties for every matched element. -->
得到一个匹配元素的style属性值或者设置匹配元素的css属性。

### 渲染
<!-- When you're ready to render the document, you can use the `html` utility function: -->
当你准备好要渲染的文件，你可以使用` html `效用函数：

```js
$.html()
//=>  <ul id="fruits">
//      <li class="apple">Apple</li>
//      <li class="orange">Orange</li>
//      <li class="pear">Pear</li>
//    </ul>
```

<!-- If you want to return the outerHTML you can use `$.html(selector)`: -->
如果你想返回outerHTML，你可以使用 `$.html(selector)`：

```js
$.html('.pear')
//=> <li class="pear">Pear</li>
```

<!-- By default, `html` will leave some tags open. Sometimes you may instead want to render a valid XML document. For example, you might parse the following XML snippet: -->
默认情况下，` html `会留下一些开放标签。有时你可能会想要渲染一个有效的文档。例如，你可能会对下面的XML片段：

```xml
$ = cheerio.load('<media:thumbnail url="http://www.foo.com/keyframe.jpg" width="75" height="50" time="12:05:01.123"/>');
```

<!-- ... and later want to render to XML. To do this, you can use the 'xml' utility function: -->
…后来要渲染到XML。要做到这一点，你可以使用 'xml' 效用函数：

```js
$.xml()
//=>  <media:thumbnail url="http://www.foo.com/keyframe.jpg" width="75" height="50" time="12:05:01.123"/>
```


<!-- ### Miscellaneous -->
### 其他
<!-- DOM element methods that don't fit anywhere else -->
DOM元素的方法不适合的地方

#### .toArray()
<!-- Retrieve all the DOM elements contained in the jQuery set as an array. -->
检索jQuery中所有的DOM元素然后设置为一个数组。

```js
$('li').toArray()
//=> [ {...}, {...}, {...} ]
```

#### .clone() ####
<!-- Clone the cheerio object. -->
克隆cheerio对象

```js
var moreFruit = $('#fruits').clone()
```

<!-- ### Utilities -->
### 实用工具

#### $.root

<!-- Sometimes you need to work with the top-level root element. To query it, you can use `$.root()`. -->
有时你需要与顶级根元素一起工作。要查询它，您可以使用 `$.root()`.。

```js
$.root().append('<ul id="vegetables"></ul>').html();
//=> <ul id="fruits">...</ul><ul id="vegetables"></ul>
```

#### $.contains( container, contained )
<!-- Checks to see if the `contained` DOM element is a descendant of the `container` DOM element. -->
检查`contained`DOM元素的容器是否是 `container`DOM元素的后代。

#### $.parseHTML( data [, context ] [, keepScripts ] )
<!-- Parses a string into an array of DOM nodes. The `context` argument has no meaning for Cheerio, but it is maintained for API compatability. -->
将一个字符串解析成DOM节点数组。`context`参数对cheerio对象没有意义，但它可以保持API的兼容性。

#### $.load( html[, options ] )
<!-- Load in the HTML. (See the previous section titled "Loading" for more information.) -->
在HTML加载。（请参阅上一节题为 "Loading" 以了解更多信息。）

<!-- ### Plugins -->
### 插件

<!-- Once you have loaded a document, you may extend the prototype or the equivalent `fn` property with custom plugin methods: -->
当你加载一个文件，你可以用定义插件的方法将原型或等效 `fn` 属性扩展：

```js
var $ = cheerio.load('<html><body>Hello, <b>world</b>!</body></html>');
$.prototype.logHtml = function() {
  console.log(this.html());
};

$('body').logHtml(); // logs "Hello, <b>world</b>!" to the console
```

<!-- ### The "DOM Node" object -->
### "DOM Node" 对象

<!-- Cheerio collections are made up of objects that bear some resemblence to [browser-based DOM nodes](https://developer.mozilla.org/en-US/docs/Web/API/Node). You can expect them to define the following properties: -->
cheerio集合是由一些相似于[browser-based DOM nodes](https://developer.mozilla.org/en-US/docs/Web/API/Node)的对象组成。你可以期待他们定义以下属性：

- `tagName`
- `parentNode`
- `previousSibling`
- `nextSibling`
- `nodeValue`
- `firstChild`
- `childNodes`
- `lastChild`

## Screencasts

http://vimeo.com/31950192

<!-- > This video tutorial is a follow-up to Nettut's "How to Scrape Web Pages with Node.js and jQuery", using cheerio instead of JSDOM + jQuery. This video shows how easy it is to use cheerio and how much faster cheerio is than JSDOM + jQuery. -->
>这个视频教程是一个后续nettut "如何用Node.js和jQuery网页、使用cheerio不是jsdom + jQuery"。这段视频显示了它是多么容易使用cheerio以及cheerio到底比JSDOM + jQuery快多少。

<!-- ## Testing -->
## 测试

<!-- To run the test suite, download the repository, then within the cheerio directory, run: -->
要运行测试套件，下载库，然后在cheerio目录，运行：

```shell
make setup
make test
```

<!-- This will download the development packages and run the test suite. -->
这将下载开发包和运行测试套件。

## 贡献者

<!-- These are some of the contributors that have made cheerio possible: -->
这些都是一些对cheerio有贡献的人：

```
project  : cheerio
 repo age : 2 years, 6 months
 active   : 285 days
 commits  : 762
 files    : 36
 authors  :
   293  Matt Mueller            38.5%
   133  Matthew Mueller         17.5%
    92  Mike Pennisi            12.1%
    54  David Chambers          7.1%
    30  kpdecker                3.9%
    19  Felix Böhm             2.5%
    17  fb55                    2.2%
    15  Siddharth Mahendraker   2.0%
    11  Adam Bretz              1.4%
     8  Nazar Leush             1.0%
     7  ironchefpython          0.9%
     6  Jarno Leppänen         0.8%
     5  Ben Sheldon             0.7%
     5  Jos Shepherd            0.7%
     5  Ryan Schmukler          0.7%
     5  Steven Vachon           0.7%
     4  Maciej Adwent           0.5%
     4  Amir Abu Shareb         0.5%
     3  jeremy.dentel@brandingbrand.com 0.4%
     3  Andi Neck               0.4%
     2  steve                   0.3%
     2  alexbardas              0.3%
     2  finspin                 0.3%
     2  Ali Farhadi             0.3%
     2  Chris Khoo              0.3%
     2  Rob Ashton              0.3%
     2  Thomas Heymann          0.3%
     2  Jaro Spisak             0.3%
     2  Dan Dascalescu          0.3%
     2  Torstein Thune          0.3%
     2  Wayne Larsen            0.3%
     1  Timm Preetz             0.1%
     1  Xavi                    0.1%
     1  Alex Shaindlin          0.1%
     1  mattym                  0.1%
     1  Felix Böhm            0.1%
     1  Farid Neshat            0.1%
     1  Dmitry Mazuro           0.1%
     1  Jeremy Hubble           0.1%
     1  nevermind               0.1%
     1  Manuel Alabor           0.1%
     1  Matt Liegey             0.1%
     1  Chris O'Hara            0.1%
     1  Michael Holroyd         0.1%
     1  Michiel De Mey          0.1%
     1  Ben Atkin               0.1%
     1  Rich Trott              0.1%
     1  Rob "Hurricane" Ashton  0.1%
     1  Robin Gloster           0.1%
     1  Simon Boudrias          0.1%
     1  Sindre Sorhus           0.1%
     1  xiaohwan                0.1%
```

<!-- ## Cheerio in the real world -->
## 实际生活中的cheerio应用

<!-- Are you using cheerio in production? Add it to the [wiki](https://github.com/cheeriojs/cheerio/wiki/Cheerio-in-Production)! -->
你用cheerio开发？把它添加到[wiki](https://github.com/cheeriojs/cheerio/wiki/Cheerio-in-Production)!

## 特别鸣谢

<!-- This library stands on the shoulders of some incredible developers. A special thanks to: -->
这个库站在一些令人难以置信的开发者的肩膀上。特别感谢：

__&#8226; @FB55 for node-htmlparser2 & CSSSelect:__
Felix has a knack for writing speedy parsing engines. He completely re-wrote both @tautologistic's `node-htmlparser` and @harry's `node-soupselect` from the ground up, making both of them much faster and more flexible. Cheerio would not be possible without his foundational work

__&#8226; @jQuery team for jQuery:__
The core API is the best of its class and despite dealing with all the browser inconsistencies the code base is extremely clean and easy to follow. Much of cheerio's implementation and documentation is from jQuery. Thanks guys.

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