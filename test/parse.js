var expect = require('expect.js'),
    parse = require('../lib/parse'),
    defaultOpts = require('../lib/options').default;


// Tags
var basic = '<html></html>';
var siblings = '<h2></h2><p></p>';

// Single Tags
var single = '<br/>';
var singleWrong = '<br>';

// Children
var children = '<html><br/></html>';
var li = '<li class="durian">Durian</li>';

// Attributes
var attributes = '<img src="hello.png" alt="man waving">';
var noValueAttribute = '<textarea disabled></textarea>';

// Comments
var comment = '<!-- sexy -->';
var conditional = '<!--[if IE 8]><html class="no-js ie8" lang="en"><![endif]-->';

// Text
var text = 'lorem ipsum';

// Script
var script = '<script type="text/javascript">alert("hi world!");</script>';
var scriptEmpty = '<script></script>';

// Style
var style = '<style type="text/css"> h2 { color:blue; } </style>';
var styleEmpty = '<style></style>';

// Directives
var directive = '<!doctype html>';


describe('parse', function() {

  describe('.eval', function() {

    it('should parse basic empty tags: ' + basic, function() {
      var tag = parse.evaluate(basic, defaultOpts, true)[0];
      expect(tag.type).to.equal('tag');
      expect(tag.tagName).to.equal('html');
      expect(tag.childNodes).to.have.length(2);
    });

    it('should handle sibling tags: ' + siblings, function() {
      var dom = parse.evaluate(siblings, defaultOpts, false),
          h2 = dom[0],
          p = dom[1];

      expect(dom).to.have.length(2);
      expect(h2.tagName).to.equal('h2');
      expect(p.tagName).to.equal('p');
    });

    it('should handle single tags: ' + single, function() {
      var tag = parse.evaluate(single, defaultOpts, false)[0];
      expect(tag.type).to.equal('tag');
      expect(tag.tagName).to.equal('br');
      expect(tag.childNodes).to.be.empty();
    });

    it('should handle malformatted single tags: ' + singleWrong, function() {
      var tag = parse.evaluate(singleWrong, defaultOpts, false)[0];
      expect(tag.type).to.equal('tag');
      expect(tag.tagName).to.equal('br');
      expect(tag.childNodes).to.be.empty();
    });

    it('should handle tags with children: ' + children, function() {
      var tag = parse.evaluate(children, defaultOpts, true)[0];
      expect(tag.type).to.equal('tag');
      expect(tag.tagName).to.equal('html');
      expect(tag.childNodes).to.be.ok();
      expect(tag.childNodes[1].tagName).to.equal('body');
      expect(tag.childNodes[1].childNodes).to.have.length(1);
    });

    it('should handle tags with children: ' + li, function() {
      var tag = parse.evaluate(li, defaultOpts, false)[0];
      expect(tag.childNodes).to.have.length(1);
      expect(tag.childNodes[0].data).to.equal('Durian');
    });

    it('should handle tags with attributes: ' + attributes, function() {
      var attrs = parse.evaluate(attributes, defaultOpts, false)[0].attribs;
      expect(attrs).to.be.ok();
      expect(attrs.src).to.equal('hello.png');
      expect(attrs.alt).to.equal('man waving');
    });

    it('should handle value-less attributes: ' + noValueAttribute, function() {
      var attrs = parse.evaluate(noValueAttribute, defaultOpts, false)[0].attribs;
      expect(attrs).to.be.ok();
      expect(attrs.disabled).to.equal('');
    });

    it('should handle comments: ' + comment, function() {
      var elem = parse.evaluate(comment, defaultOpts, false)[0];
      expect(elem.type).to.equal('comment');
      expect(elem.data).to.equal(' sexy ');
    });

    it('should handle conditional comments: ' + conditional, function() {
      var elem = parse.evaluate(conditional, defaultOpts, false)[0];
      expect(elem.type).to.equal('comment');
      expect(elem.data).to.equal(conditional.replace('<!--', '').replace('-->', ''));
    });

    it('should handle text: ' + text, function() {
      var text_ = parse.evaluate(text, defaultOpts, false)[0];
      expect(text_.type).to.equal('text');
      expect(text_.data).to.equal('lorem ipsum');
    });

    it('should handle script tags: ' + script, function() {
      var script_ = parse.evaluate(script, defaultOpts, false)[0];
      expect(script_.type).to.equal('script');
      expect(script_.tagName).to.equal('script');
      expect(script_.attribs.type).to.equal('text/javascript');
      expect(script_.childNodes).to.have.length(1);
      expect(script_.childNodes[0].type).to.equal('text');
      expect(script_.childNodes[0].data).to.equal('alert("hi world!");');
    });

    it('should handle style tags: ' + style, function() {
      var style_ = parse.evaluate(style, defaultOpts, false)[0];
      expect(style_.type).to.equal('style');
      expect(style_.tagName).to.equal('style');
      expect(style_.attribs.type).to.equal('text/css');
      expect(style_.childNodes).to.have.length(1);
      expect(style_.childNodes[0].type).to.equal('text');
      expect(style_.childNodes[0].data).to.equal(' h2 { color:blue; } ');
    });

    it('should handle directives: ' + directive, function() {
      var elem = parse.evaluate(directive, defaultOpts, true)[0];
      expect(elem.type).to.equal('directive');
      expect(elem.data).to.equal('!DOCTYPE html');
      expect(elem.tagName).to.equal('!doctype');
    });

  });

  describe('.parse', function() {

    // root test utility
    function rootTest(root) {
      expect(root.tagName).to.equal('root');

      // Should exist but be null
      expect(root.nextSibling).to.be(null);
      expect(root.previousSibling).to.be(null);
      expect(root.parentNode).to.be(null);

      var child = root.childNodes[0];
      expect(child.parentNode).to.be(null);
    }

    it('should add root to: ' + basic, function() {
      var root = parse(basic, defaultOpts, true);
      rootTest(root);
      expect(root.childNodes).to.have.length(1);
      expect(root.childNodes[0].tagName).to.equal('html');
    });

    it('should add root to: ' + siblings, function() {
      var root = parse(siblings, defaultOpts, false);
      rootTest(root);
      expect(root.childNodes).to.have.length(2);
      expect(root.childNodes[0].tagName).to.equal('h2');
      expect(root.childNodes[1].tagName).to.equal('p');
      expect(root.childNodes[1].parent).to.equal(null);
    });

    it('should add root to: ' + comment, function() {
      var root = parse(comment, defaultOpts, false);
      rootTest(root);
      expect(root.childNodes).to.have.length(1);
      expect(root.childNodes[0].type).to.equal('comment');
    });

    it('should add root to: ' + text, function() {
      var root = parse(text, defaultOpts, false);
      rootTest(root);
      expect(root.childNodes).to.have.length(1);
      expect(root.childNodes[0].type).to.equal('text');
    });

    it('should add root to: ' + scriptEmpty, function() {
      var root = parse(scriptEmpty, defaultOpts, false);
      rootTest(root);
      expect(root.childNodes).to.have.length(1);
      expect(root.childNodes[0].type).to.equal('script');
    });

    it('should add root to: ' + styleEmpty, function() {
      var root = parse(styleEmpty, defaultOpts, false);
      rootTest(root);
      expect(root.childNodes).to.have.length(1);
      expect(root.childNodes[0].type).to.equal('style');
    });

    it('should add root to: ' + directive, function() {
      var root = parse(directive, defaultOpts, true);
      rootTest(root);
      expect(root.childNodes).to.have.length(2);
      expect(root.childNodes[0].type).to.equal('directive');
    });

    it('should expose the DOM level 1 API', function() {
      var root = parse('<div><a></a><span></span><p></p></div>', defaultOpts, false).childNodes[0];
      var childNodes = root.childNodes;

      expect(childNodes).to.have.length(3);

      expect(root.tagName).to.be('div');
      expect(root.firstChild).to.be(childNodes[0]);
      expect(root.lastChild).to.be(childNodes[2]);

      expect(childNodes[0].tagName).to.be('a');
      expect(childNodes[0].previousSibling).to.be(null);
      expect(childNodes[0].nextSibling).to.be(childNodes[1]);
      expect(childNodes[0].parentNode).to.be(root);
      expect(childNodes[0].childNodes).to.have.length(0);
      expect(childNodes[0].firstChild).to.be(null);
      expect(childNodes[0].lastChild).to.be(null);

      expect(childNodes[1].tagName).to.be('span');
      expect(childNodes[1].previousSibling).to.be(childNodes[0]);
      expect(childNodes[1].nextSibling).to.be(childNodes[2]);
      expect(childNodes[1].parentNode).to.be(root);
      expect(childNodes[1].childNodes).to.have.length(0);
      expect(childNodes[1].firstChild).to.be(null);
      expect(childNodes[1].lastChild).to.be(null);

      expect(childNodes[2].tagName).to.be('p');
      expect(childNodes[2].previousSibling).to.be(childNodes[1]);
      expect(childNodes[2].nextSibling).to.be(null);
      expect(childNodes[2].parentNode).to.be(root);
      expect(childNodes[2].childNodes).to.have.length(0);
      expect(childNodes[2].firstChild).to.be(null);
      expect(childNodes[2].lastChild).to.be(null);
    });

    it('Should parse less than or equal sign sign', function() {
      var root = parse('<i>A</i><=<i>B</i>', defaultOpts, false);
      var childNodes = root.childNodes;

      expect(childNodes[0].tagName).to.be('i');
      expect(childNodes[0].childNodes[0].data).to.be('A');
      expect(childNodes[1].data).to.be('<=');
      expect(childNodes[2].tagName).to.be('i');
      expect(childNodes[2].childNodes[0].data).to.be('B');
    });

    it('Should ignore unclosed CDATA', function() {
      var root = parse('<a></a><script>foo //<![CDATA[ bar</script><b></b>', defaultOpts, false);
      var childNodes = root.childNodes;

      expect(childNodes[0].tagName).to.be('a');
      expect(childNodes[1].tagName).to.be('script');
      expect(childNodes[1].childNodes[0].data).to.be('foo //<![CDATA[ bar');
      expect(childNodes[2].tagName).to.be('b');
    });

    it('Should add <head> to documents', function() {
      var root = parse('<html></html>', defaultOpts, true);
      var childNodes = root.childNodes;

      expect(childNodes[0].tagName).to.be('html');
      expect(childNodes[0].childNodes[0].tagName).to.be('head');
    });

    it('Should implicitly create <tr> around <td>', function() {
      var root = parse('<table><td>bar</td></tr></table>', defaultOpts, false);
      var childNodes = root.childNodes;

      expect(childNodes[0].tagName).to.be('table');
      expect(childNodes[0].childNodes.length).to.be(1);
      expect(childNodes[0].childNodes[0].tagName).to.be('tbody');
      expect(childNodes[0].childNodes[0].childNodes[0].tagName).to.be('tr');
      expect(childNodes[0].childNodes[0].childNodes[0].childNodes[0].tagName).to.be('td');
      expect(childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].data).to.be('bar');
    });

    it('Should parse custom tag <line>', function() {
      var root = parse('<line>test</line>', defaultOpts, false);
      var childNodes = root.childNodes;

      expect(childNodes.length).to.be(1);
      expect(childNodes[0].tagName).to.be('line');
      expect(childNodes[0].childNodes[0].data).to.be('test');
    });

    it('Should properly parse misnested table tags', function() {
      var root = parse('<tr><td>i1</td></tr><tr><td>i2</td></td></tr><tr><td>i3</td></td></tr>', defaultOpts, false);
      var childNodes = root.childNodes;

      expect(childNodes.length).to.be(3);

      childNodes.forEach(function(child, i) {
        expect(child.tagName).to.be('tr');
        expect(child.childNodes[0].tagName).to.be('td');
        expect(child.childNodes[0].childNodes[0].data).to.be('i' + (i + 1));
      });
    });

    it('Should correctly parse data url attributes', function() {
      var html = '<div style=\'font-family:"butcherman-caps"; src:url(data:font/opentype;base64,AAEA...);\'></div>';
      var expectedAttr = 'font-family:"butcherman-caps"; src:url(data:font/opentype;base64,AAEA...);';
      var root = parse(html, defaultOpts, false);
      var childNodes = root.childNodes;

      expect(childNodes[0].attribs.style).to.be(expectedAttr);
    });

    it('Should treat <xmp> tag content as text', function() {
      var root = parse('<xmp><h2></xmp>', defaultOpts, false);
      var childNodes = root.childNodes;

      expect(childNodes[0].childNodes[0].data).to.be('<h2>');
    });

    it('Should correctly parse malformed numbered entities', function() {
      var root = parse('<p>z&#</p>', defaultOpts, false);
      var childNodes = root.childNodes;

      expect(childNodes[0].childNodes[0].data).to.be('z&#');
    });

    it('Should correctly parse mismatched headings', function() {
      var root = parse('<h2>Test</h3><div></div>', defaultOpts, false);
      var childNodes = root.childNodes;

      expect(childNodes.length).to.be(2);
      expect(childNodes[0].tagName).to.be('h2');
      expect(childNodes[1].tagName).to.be('div');
    });

    it('Should correctly parse tricky <pre> content', function() {
      var root = parse('<pre>\nA <- factor(A, levels = c("c","a","b"))\n</pre>', defaultOpts, false);
      var childNodes = root.childNodes;

      expect(childNodes.length).to.be(1);
      expect(childNodes[0].tagName).to.be('pre');
      expect(childNodes[0].childNodes[0].data).to.be('A <- factor(A, levels = c("c","a","b"))\n');
    });
  });

});
