var expect = require('expect.js'),
    parse = require('../lib/parse'),
    defaultOpts = require('..').prototype.options;


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
      var tag = parse.evaluate(basic, defaultOpts)[0];
      expect(tag.type).to.equal('tag');
      expect(tag.tagName).to.equal('html');
      expect(tag.childNodes).to.be.empty();
    });

    it('should handle sibling tags: ' + siblings, function() {
      var dom = parse.evaluate(siblings, defaultOpts),
          h2 = dom[0],
          p = dom[1];

      expect(dom).to.have.length(2);
      expect(h2.tagName).to.equal('h2');
      expect(p.tagName).to.equal('p');
    });

    it('should handle single tags: ' + single, function() {
      var tag = parse.evaluate(single, defaultOpts)[0];
      expect(tag.type).to.equal('tag');
      expect(tag.tagName).to.equal('br');
      expect(tag.childNodes).to.be.empty();
    });

    it('should handle malformatted single tags: ' + singleWrong, function() {
      var tag = parse.evaluate(singleWrong, defaultOpts)[0];
      expect(tag.type).to.equal('tag');
      expect(tag.tagName).to.equal('br');
      expect(tag.childNodes).to.be.empty();
    });

    it('should handle tags with children: ' + children, function() {
      var tag = parse.evaluate(children, defaultOpts)[0];
      expect(tag.type).to.equal('tag');
      expect(tag.tagName).to.equal('html');
      expect(tag.childNodes).to.be.ok();
      expect(tag.childNodes).to.have.length(1);
    });

    it('should handle tags with children: ' + li, function() {
      var tag = parse.evaluate(li, defaultOpts)[0];
      expect(tag.childNodes).to.have.length(1);
      expect(tag.childNodes[0].data).to.equal('Durian');
    });

    it('should handle tags with attributes: ' + attributes, function() {
      var attrs = parse.evaluate(attributes, defaultOpts)[0].attribs;
      expect(attrs).to.be.ok();
      expect(attrs.src).to.equal('hello.png');
      expect(attrs.alt).to.equal('man waving');
    });

    it('should handle value-less attributes: ' + noValueAttribute, function() {
      var attrs = parse.evaluate(noValueAttribute, defaultOpts)[0].attribs;
      expect(attrs).to.be.ok();
      expect(attrs.disabled).to.equal('');
    });

    it('should handle comments: ' + comment, function() {
      var elem = parse.evaluate(comment, defaultOpts)[0];
      expect(elem.type).to.equal('comment');
      expect(elem.data).to.equal(' sexy ');
    });

    it('should handle conditional comments: ' + conditional, function() {
      var elem = parse.evaluate(conditional, defaultOpts)[0];
      expect(elem.type).to.equal('comment');
      expect(elem.data).to.equal(conditional.replace('<!--', '').replace('-->', ''));
    });

    it('should handle text: ' + text, function() {
      var text_ = parse.evaluate(text, defaultOpts)[0];
      expect(text_.type).to.equal('text');
      expect(text_.data).to.equal('lorem ipsum');
    });

    it('should handle script tags: ' + script, function() {
      var script_ = parse.evaluate(script, defaultOpts)[0];
      expect(script_.type).to.equal('script');
      expect(script_.tagName).to.equal('script');
      expect(script_.attribs.type).to.equal('text/javascript');
      expect(script_.childNodes).to.have.length(1);
      expect(script_.childNodes[0].type).to.equal('text');
      expect(script_.childNodes[0].data).to.equal('alert("hi world!");');
    });

    it('should handle style tags: ' + style, function() {
      var style_ = parse.evaluate(style, defaultOpts)[0];
      expect(style_.type).to.equal('style');
      expect(style_.tagName).to.equal('style');
      expect(style_.attribs.type).to.equal('text/css');
      expect(style_.childNodes).to.have.length(1);
      expect(style_.childNodes[0].type).to.equal('text');
      expect(style_.childNodes[0].data).to.equal(' h2 { color:blue; } ');
    });

    it('should handle directives: ' + directive, function() {
      var elem = parse.evaluate(directive, defaultOpts)[0];
      expect(elem.type).to.equal('directive');
      expect(elem.data).to.equal('!doctype html');
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
      var root = parse(basic, defaultOpts);
      rootTest(root);
      expect(root.childNodes).to.have.length(1);
      expect(root.childNodes[0].tagName).to.equal('html');
    });

    it('should add root to: ' + siblings, function() {
      var root = parse(siblings, defaultOpts);
      rootTest(root);
      expect(root.childNodes).to.have.length(2);
      expect(root.childNodes[0].tagName).to.equal('h2');
      expect(root.childNodes[1].tagName).to.equal('p');
      expect(root.childNodes[1].parent).to.equal(null);
    });

    it('should add root to: ' + comment, function() {
      var root = parse(comment, defaultOpts);
      rootTest(root);
      expect(root.childNodes).to.have.length(1);
      expect(root.childNodes[0].type).to.equal('comment');
    });

    it('should add root to: ' + text, function() {
      var root = parse(text, defaultOpts);
      rootTest(root);
      expect(root.childNodes).to.have.length(1);
      expect(root.childNodes[0].type).to.equal('text');
    });

    it('should add root to: ' + scriptEmpty, function() {
      var root = parse(scriptEmpty, defaultOpts);
      rootTest(root);
      expect(root.childNodes).to.have.length(1);
      expect(root.childNodes[0].type).to.equal('script');
    });

    it('should add root to: ' + styleEmpty, function() {
      var root = parse(styleEmpty, defaultOpts);
      rootTest(root);
      expect(root.childNodes).to.have.length(1);
      expect(root.childNodes[0].type).to.equal('style');
    });

    it('should add root to: ' + directive, function() {
      var root = parse(directive, defaultOpts);
      rootTest(root);
      expect(root.childNodes).to.have.length(1);
      expect(root.childNodes[0].type).to.equal('directive');
    });

    it('should expose the DOM level 1 API', function() {
      var root = parse('<div><a></a><span></span><p></p></div>', defaultOpts).childNodes[0];
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
  });

});
