var expect = require('expect.js'),
    parse = require('../').parse;


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
      var tag = parse['eval'](basic)[0];
      expect(tag.type).to.equal('tag');
      expect(tag.name).to.equal('html');
      expect(tag.children).to.be.empty();
    });

    it('should handle sibling tags: ' + siblings, function() {
      var dom = parse['eval'](siblings),
          h2 = dom[0],
          p = dom[1];

      expect(dom).to.have.length(2);
      expect(h2.name).to.equal('h2');
      expect(p.name).to.equal('p');
    });

    it('should handle single tags: ' + single, function() {
      var tag = parse['eval'](single)[0];
      expect(tag.type).to.equal('tag');
      expect(tag.name).to.equal('br');
      expect(tag.children).to.be.empty();
    });

    it('should handle malformatted single tags: ' + singleWrong, function() {
      var tag = parse['eval'](singleWrong)[0];
      expect(tag.type).to.equal('tag');
      expect(tag.name).to.equal('br');
      expect(tag.children).to.be.empty();
    });

    it('should handle tags with children: ' + children, function() {
      var tag = parse['eval'](children)[0];
      expect(tag.type).to.equal('tag');
      expect(tag.name).to.equal('html');
      expect(tag.children).to.be.ok();
      expect(tag.children).to.have.length(1);
    });

    it('should handle tags with children: ' + li, function() {
      var tag = parse['eval'](li)[0];
      expect(tag.children).to.have.length(1);
      expect(tag.children[0].data).to.equal('Durian');
    });

    it('should handle tags with attributes: ' + attributes, function() {
      var attrs = parse['eval'](attributes)[0].attribs;
      expect(attrs).to.be.ok();
      expect(attrs.src).to.equal('hello.png');
      expect(attrs.alt).to.equal('man waving');
    });

    it('should handle value-less attributes: ' + noValueAttribute, function() {
      var attrs = parse['eval'](noValueAttribute)[0].attribs;
      expect(attrs).to.be.ok();
      expect(attrs.disabled).to.equal('');
    });

    it('should handle comments: ' + comment, function() {
      var elem = parse['eval'](comment)[0];
      expect(elem.type).to.equal('comment');
      expect(elem.data).to.equal(' sexy ');
    });

    it('should handle conditional comments: ' + conditional, function() {
      var elem = parse['eval'](conditional)[0];
      expect(elem.type).to.equal('comment');
      expect(elem.data).to.equal(conditional.replace('<!--', '').replace('-->', ''));
    });

    it('should handle text: ' + text, function() {
      var text_ = parse['eval'](text)[0];
      expect(text_.type).to.equal('text');
      expect(text_.data).to.equal('lorem ipsum');
    });

    it('should handle script tags: ' + script, function() {
      var script_ = parse['eval'](script)[0];
      expect(script_.type).to.equal('script');
      expect(script_.name).to.equal('script');
      expect(script_.attribs.type).to.equal('text/javascript');
      expect(script_.children).to.have.length(1);
      expect(script_.children[0].type).to.equal('text');
      expect(script_.children[0].data).to.equal('alert("hi world!");');
    });

    it('should handle style tags: ' + style, function() {
      var style_ = parse['eval'](style)[0];
      expect(style_.type).to.equal('style');
      expect(style_.name).to.equal('style');
      expect(style_.attribs.type).to.equal('text/css');
      expect(style_.children).to.have.length(1);
      expect(style_.children[0].type).to.equal('text');
      expect(style_.children[0].data).to.equal(' h2 { color:blue; } ');
    });

    it('should handle directives: ' + directive, function() {
      var elem = parse['eval'](directive)[0];
      expect(elem.type).to.equal('directive');
      expect(elem.data).to.equal('!doctype html');
      expect(elem.name).to.equal('!doctype');
    });

  });

  describe('.connect', function() {

    var create = function(html) {
      var dom = parse['eval'](html);
      return parse.connect(dom);
    };

    it('should fill in empty attributes: ' + basic, function() {
      var tag = create(basic)[0];

      // Should exist but be null
      expect(tag.parent).to.be(null);
      expect(tag.next).to.be(null);
      expect(tag.prev).to.be(null);

      // Should exist but be empty
      expect(tag.children).to.be.empty();
      expect(tag.attribs).to.be.ok();
    });

    it('should should fill in empty attributes for scripts: ' + scriptEmpty, function() {
      var script = create(scriptEmpty)[0];

      // Should exist but be null
      expect(script.parent).to.be(null);
      expect(script.next).to.be(null);
      expect(script.prev).to.be(null);

      // Should exist but be empty
      expect(script.children).to.be.empty();
      expect(script.attribs).to.be.ok();
    });

    it('should should fill in empty attributes for styles: ' + styleEmpty, function() {
      var style = create(styleEmpty)[0];

      // Should exist but be null
      expect(style.parent).to.be(null);
      expect(style.next).to.be(null);
      expect(style.prev).to.be(null);

      // Should exist but be empty
      expect(style.children).to.be.empty();
      expect(style.attribs).to.be.ok();
    });

    it('should have next and prev siblings: ' + siblings, function() {
      var dom = create(siblings),
          h2 = dom[0],
          p = dom[1];

      // No parents
      expect(h2.parent).to.be(null);
      expect(p.parent).to.be(null);

      // Neighbors
      expect(h2.next.name).to.equal('p');
      expect(p.prev.name).to.equal('h2');

      // Should exist but be empty
      expect(h2.children).to.be.empty();
      expect(h2.attribs).to.be.ok();
      expect(p.children).to.be.empty();
      expect(p.attribs).to.be.ok();
    });

    it('should connect child with parent: ' + children, function() {
      var html = create(children)[0],
          br = html.children[0];

      // html has 1 child and it's <br>
      expect(html.children).to.have.length(1);
      expect(html.children[0].name).to.equal('br');

      // br's parent is html
      expect(br.parent.name).to.equal('html');
    });

    it('should fill in some empty attributes for comments: ' + comment, function() {
      var elem = create(comment)[0];

      // Should exist but be null
      expect(elem.parent).to.be(null);
      expect(elem.next).to.be(null);
      expect(elem.prev).to.be(null);

      // Should not exist at all
      expect(elem.children).to.not.be.ok();
      expect(elem.attribs).to.not.be.ok();
    });

    it('should fill in some empty attributes for text: ' + text, function() {
      var text = create(text)[0];

      // Should exist but be null
      expect(text.parent).to.be(null);
      expect(text.next).to.be(null);
      expect(text.prev).to.be(null);

      // Should not exist at all
      expect(text.children).to.not.be.ok();
      expect(text.attribs).to.not.be.ok();
    });

    it('should fill in some empty attributes for directives: ' + directive, function() {
      var elem = create(directive)[0];

      // Should exist but be null
      expect(elem.parent).to.be(null);
      expect(elem.next).to.be(null);
      expect(elem.prev).to.be(null);

      // Should not exist at all
      expect(elem.children).to.not.be.ok();
      expect(elem.attribs).to.not.be.ok();
    });

  });

  describe('.parse', function() {

    // root test utility
    function rootTest(root) {
      expect(root.name).to.equal('root');

      // Should exist but be null
      expect(root.next).to.be(null);
      expect(root.prev).to.be(null);
      expect(root.parent).to.be(null);

      var child = root.children[0];
      expect(child.parent).to.equal(root);
    }

    it('should add root to: ' + basic, function() {
      var root = parse(basic);
      rootTest(root);
      expect(root.children).to.have.length(1);
      expect(root.children[0].name).to.equal('html');
    });

    it('should add root to: ' + siblings, function() {
      var root = parse(siblings);
      rootTest(root);
      expect(root.children).to.have.length(2);
      expect(root.children[0].name).to.equal('h2');
      expect(root.children[1].name).to.equal('p');
      expect(root.children[1].parent.name).to.equal('root');
    });

    it('should add root to: ' + comment, function() {
      var root = parse(comment);
      rootTest(root);
      expect(root.children).to.have.length(1);
      expect(root.children[0].type).to.equal('comment');
    });

    it('should add root to: ' + text, function() {
      var root = parse(text);
      rootTest(root);
      expect(root.children).to.have.length(1);
      expect(root.children[0].type).to.equal('text');
    });

    it('should add root to: ' + scriptEmpty, function() {
      var root = parse(scriptEmpty);
      rootTest(root);
      expect(root.children).to.have.length(1);
      expect(root.children[0].type).to.equal('script');
    });

    it('should add root to: ' + styleEmpty, function() {
      var root = parse(styleEmpty);
      rootTest(root);
      expect(root.children).to.have.length(1);
      expect(root.children[0].type).to.equal('style');
    });

    it('should add root to: ' + directive, function() {
      var root = parse(directive);
      rootTest(root);
      expect(root.children).to.have.length(1);
      expect(root.children[0].type).to.equal('directive');
    });

  });

});
