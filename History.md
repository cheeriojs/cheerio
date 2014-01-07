
0.13.1 / 2014-01-07
==================

 * Fix select with context in Cheerio function (@jugglinmike)
 * Remove unecessary DOM maintenance logic (@jugglinmike)
 * Deprecate support for node 0.6

0.13.0 / 2013-12-30
==================

 * Remove "root" node (@jugglinmike)
 * Fix bug in `prevAll`, `prev`, `nextAll`, `next`, `prevUntil`, `nextUntil` (@jugglinmike)
 * Fix `replaceWith` method (@jugglinmike)
 * added nextUntil() and prevUntil() (@finspin)
 * Remove internal `connect` function (@jugglinmike)
 * Rename `Cheerio#make` to document private status (@jugginmike)
 * Remove extraneous call to `_.uniq` (@jugglinmike)
 * Use CSSselect library directly (@jugglinmike)
 * Run CI against Node v0.11 as an allowed failure (@jugginmike)
 * Correct bug in `Cheerio#parents` (@jugglinmike)
 * Implement `$.fn.end` (@jugginmike)
 * Ignore colons inside of url(.*) when parsing css (@Meekohi)
 * Introduce rudimentary benchmark suite (@jugglinmike)
 * Update HtmlParser2 version (@jugglinmike)
 * Correct inconsistency in `$.fn.map` (@jugglinmike)
 * fixed traversing tests (@finspin)
 * Simplify `make` method (@jugglinmike)
 * Avoid shadowing instance methods from arrays (@jugglinmike)

0.12.4 / 2013-11-12
==================

 * Coerce JSON values returned by `data` (@jugglinmike)
 * issue #284: when rendering HTML, use original data attributes (@Trott)
 * Introduce JSHint for automated code linting (@jugglinmike)
 * Prevent `find` from returning duplicate elements (@jugglinmike)
 * Implement function signature of `replaceWith` (@jugglinmike)
 * Implement function signature of `before` (@jugglinmike)
 * Implement function signature of `after` (@jugglinmike)
 * Implement function signature of `append`/`prepend` (@jugglinmike)
 * Extend iteration methods to accept nodes (@jugglinmike)
 * Improve `removeClass` (@jugglinmike)
 * Complete function signature of `addClass` (@jugglinmike)
 * Fix bug in `removeClass` (@jugglinmike)
 * Improve contributing.md (@jugglinmike)
 * Fix and document .css() (@jugglinmike)

0.12.3 / 2013-10-04
===================

 * Add .toggleClass() function (@cyberthom)
 * Add contributing guidelines (@jugglinmike)
 * Fix bug in `siblings` (@jugglinmike)
 * Correct the implementation `filter` and `is` (@jugglinmike)
 * add .data() function (@andi-neck)
 * add .css() (@yields)
 * Implements contents() (@jlep)

0.12.2 / 2013-09-04
==================

 * Correct implementation of `$.fn.text` (@jugglinmike)
 * Refactor Cheerio array creation (@jugglinmike)
 * Extend manipulation methods to accept Arrays (@jugglinmike)
 * support .attr(attributeName, function(index, attr)) (@xiaohwan)

0.12.1 / 2013-07-30
==================

 * Correct behavior of `Cheerio#parents` (@jugglinmike)
 * Double quotes inside attributes kills HTML (@khoomeister)
 * Making next({}) and prev({}) return empty object (@absentTelegraph)
 * Implement $.parseHTML (@jugglinmike)
 * Correct bug in jQuery.fn.closest (@jugglinmike)
 * Correct behavior of $.fn.val on 'option' elements (@jugglinmike)

0.12.0 / 2013-06-09
===================

  * Breaking Change: Changed context from parent to the actual passed one (@swissmanu)
  * Fixed: jquery checkbox val behavior (@jhubble)
  * Added: output xml with $.xml() (@Maciek416)
  * Bumped: htmlparser2 to 3.1.1
  * Fixed: bug in attr(key, val) on empty objects (@farhadi)
  * Added: prevAll, nextAll (@lessmind)
  * Fixed: Safety check in parents and closest (@zero21xxx)
  * Added: .is(sel) (@zero21xxx)

0.11.0 / 2013-04-22
==================

* Added: .closest() (@jeremy-dentel)
* Added: .parents() (@zero21xxx)
* Added: .val() (@rschmukler & @leahciMic)
* Added: Travis support for node 0.10.0 (@jeremy-dentel)
* Fixed: .find() if no selector (@davidchambers)
* Fixed: Propagate syntax errors caused by invalid selectors (@davidchambers)

0.10.8 / 2013-03-11
==================

* Add slice method (SBoudrias)

0.10.7 / 2013-02-10
==================

* Code & doc cleanup (davidchambers)
* Fixed bug in filter (jugglinmike)

0.10.6 / 2013-01-29
==================

* Added `$.contains(...)` (jugglinmike)
* formatting cleanup (davidchambers)
* Bug fix for `.children()` (jugglinmike & davidchambers)
* Remove global `render` bug (wvl)

0.10.5 / 2012-12-18
===================

* Fixed botched publish from 0.10.4 - changes should now be present

0.10.4 / 2012-12-16
==================

* $.find should query descendants only (@jugglinmike)
* Tighter underscore dependency

0.10.3 / 2012-11-18
===================

* fixed outer html bug
* Updated documentation for $(...).html() and $.html()

0.10.2 / 2012-11-17
===================

* Added a toString() method (@bensheldon)
* use `_.each` and `_.map` to simplify cheerio namesakes (@davidchambers)
* Added filter() with tests and updated readme (@bensheldon & @davidchambers)
* Added spaces between attributes rewritten by removeClass (@jos3000)
* updated docs to remove reference to size method (@ironchefpython)
* removed tidy from cheerio

0.10.1 / 2012-10-04
===================

* Fixed regression, filtering with a context (#106)

0.10.0 / 2012-09-24
===================

* Greatly simplified and reorganized the library, reducing the loc by 30%
* Now supports mocha's test-coverage
* Deprecated self-closing tags (HTML5 doesn't require them)
* Fixed error thrown in removeClass(...) @robashton

0.9.2 / 2012-08-10
==================

* added $(...).map(fn)
* manipulation: refactor `makeCheerioArray`
* make .removeClass() remove *all* occurrences (#64)

0.9.1 / 2012-08-03
==================

* fixed bug causing options not to make it to the parser

0.9.0 / 2012-07-24
==================

* Added node 8.x support
* Removed node 4.x support
* Add html(dom) support (@wvl)
* fixed xss vulnerabilities on .attr(), .text(), & .html() (@benatkin, @FB55)
* Rewrote tests into javascript, removing coffeescript dependency (@davidchambers)
* Tons of cleanup (@davidchambers)

0.8.3 / 2012-06-12
==================

* Fixed minor package regression (closes #60)

0.8.2 / 2012-06-11
==================

* Now fails gracefully in cases that involve special chars, which is inline with jQuery (closes #59)
* text() now decode special entities (closes #52)
* updated travis.yml to test node 4.x

0.8.1 / 2012-06-02
==================

* fixed regression where if you created an element, it would update the root
* compatible with node 4.x (again)

0.8.0 / 2012-05-27
==================

* Updated CSS parser to use FB55/CSSselect. Cheerio now supports most CSS3 psuedo selectors thanks to @FB55.
* ignoreWhitespace now on by default again. See #55 for context.
* Changed $(':root') to $.root(), cleaned up $.clone()
* Support for .eq(i) thanks to @alexbardas
* Removed support for node 0.4.x
* Fixed memory leak where package.json was continually loaded
* Tons more tests

0.7.0 / 2012-04-08
==================

* Now testing with node v0.7.7
* Added travis-ci integration
* Replaced should.js with expect.js. Browser testing to come
* Fixed spacing between attributes and their values
* Added HTML pretty print
* Exposed node-htmlparser2 parsing options
* Revert .replaceWith(...) to be consistent with jQuery

0.6.2 / 2012-02-12
==================

* Fixed .replaceWith(...) regression

0.6.1 / 2012-02-12
==================

* Added .first(), .last(), and .clone() commands.
* Option to parse using whitespace added to `.load`.
* Many bug fixes to make cheerio more aligned with jQuery.
* Added $(':root') to select the highest level element.

Many thanks to the contributors that made this release happen: @ironchefpython and @siddMahen

0.6.0 / 2012-02-07
==================

* *Important:* `$(...).html()` now returns inner HTML, which is in line with the jQuery spec
* `$.html()` returns the full HTML string. `$.html([cheerioObject])` will return the outer(selected element's tag) and inner HTML of that object
* Fixed bug that prevented HTML strings with depth (eg. `append('<ul><li><li></ul>')`) from getting `parent`, `next`, `prev` attributes.
* Halted [htmlparser2](https://github.com/FB55/node-htmlparser) at v2.2.2 until single attributes bug gets fixed.

0.5.1 / 2012-02-05
==================

* Fixed minor regression: $(...).text(fn) would fail

0.5.1 / 2012-02-05
==================

* Fixed regression: HTML pages with comments would fail

0.5.0 / 2012-02-04
==================

* Transitioned from Coffeescript back to Javascript
* Parser now ignores whitespace
* Fixed issue with double slashes on self-enclosing tags
* Added boolean attributes to html rendering

0.4.2 / 2012-01-16
==================

* Multiple selectors support: $('.apple, .orange'). Thanks @siddMahen!
* Update package.json to always use latest cheerio-soupselect
* Fix memory leak in index.js

0.4.1 / 2011-12-19
==================
* Minor packaging changes to allow `make test` to work from npm installation

0.4.0 / 2011-12-19
==================

* Rewrote all unit tests as cheerio transitioned from vows -> mocha
* Internally, renderer.render -> render(...), parser.parse -> parse(...)
* Append, prepend, html, before, after all work with only text (no tags)
* Bugfix: Attributes can now be removed from script and style tags
* Added yield as a single tag
* Cheerio now compatible with node >=0.4.7

0.3.2 / 2011-12-1
=================

* Fixed $(...).text(...) to work with "root" element

0.3.1 / 2011-11-25
==================

* Now relying on cheerio-soupselect instead of node-soupselect
* Removed all lingering htmlparser dependencies
* parser now returns parent "root" element. Root now never needs to be updated when there is multiple roots. This fixes ongoing issues with before(...), after(...) and other manipulation functions
* Added jQuery's $(...).replaceWith(...)

0.3.0 / 2011-11-19
==================

* Now using htmlparser2 for parsing (2x speed increase, cleaner, actively developed)
* Added benchmark directory for future speed tests
* $('...').dom() was funky, so it was removed in favor of $('...').get(). $.dom() still works the same.
* $.root now correctly static across all instances of $
* Added a screencast

0.2.2 / 2011-11-9
=================

* Traversing will select `<script>` and `<style>` tags (Closes Issue: #8)
* .text(string) now working with empty elements (Closes Issue: #7)
* Fixed before(...) & after(...) again if there is no parent (Closes Issue: #2)

0.2.1 / 2011-11-5
=================

* Fixed before(...) & after(...) if there is no parent (Closes Issue: #2)
* Comments now rendered correctly (Closes Issue: #5)

< 0.2.0 / 2011-10-31
====================

* Initial release (untracked development)
