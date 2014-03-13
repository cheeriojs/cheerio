var expect = require('expect.js'),
    $ = require('../'),
    fruits = require('./fixtures').fruits,
    toArray = Function.call.bind(Array.prototype.slice);

describe('$(...)', function() {

  describe('.append', function() {

    it('() : should do nothing', function() {
      expect($('#fruits', fruits).append()[0].name).to.equal('ul');
    });

    it('(html) : should add element as last child', function() {
      var $fruits = $(fruits);
      $fruits.append('<li class="plum">Plum</li>');
      expect($fruits.children(3).hasClass('plum')).to.be.ok();
    });

    it('($(...)) : should add element as last child', function() {
      var $fruits = $(fruits);
      var $plum = $('<li class="plum">Plum</li>');
      $fruits.append($plum);
      expect($fruits.children(3).hasClass('plum')).to.be.ok();
    });

    it('(Node) : should add element as last child', function() {
      var $fruits = $(fruits);
      var plum = $('<li class="plum">Plum</li>')[0];
      $fruits.append(plum);
      expect($fruits.children(3).hasClass('plum')).to.be.ok();
    });

    it('(existing Node) : should remove node from previous location', function() {
      var $fruits = $(fruits);
      var apple = $fruits.children()[0];
      var $children;

      expect($fruits.children()).to.have.length(3);
      $fruits.append(apple);
      $children = $fruits.children();

      expect($children).to.have.length(3);
      expect($children[0]).to.not.equal(apple);
      expect($children[2]).to.equal(apple);
    });

    it('($(...), html) : should add multiple elements as last children', function() {
      var $fruits = $(fruits);
      var $plum = $('<li class="plum">Plum</li>');
      var grape = '<li class="grape">Grape</li>';
      $fruits.append($plum, grape);
      expect($fruits.children(3).hasClass('plum')).to.be.ok();
      expect($fruits.children(4).hasClass('grape')).to.be.ok();
    });

    it('(Array) : should append all elements in the array', function() {
      var $fruits = $(fruits);
      var more = $('<li class="plum">Plum</li><li class="grape">Grape</li>')
        .get();
      $fruits.append(more);
      expect($fruits.children(3).hasClass('plum')).to.be.ok();
      expect($fruits.children(4).hasClass('grape')).to.be.ok();
    });

    it('(fn) : should invoke the callback with the correct argument and context', function() {
      var $fruits = $(fruits).children();
      var args = [];
      var thisValues = [];

      $fruits.append(function() {
        args.push(toArray(arguments));
        thisValues.push(this);
      });

      expect(args).to.eql([
        [0, 'Apple'],
        [1, 'Orange'],
        [2, 'Pear']
      ]);
      expect(thisValues).to.eql([
        $fruits[0],
        $fruits[1],
        $fruits[2]
      ]);
    });

    it('(fn) : should add returned string as last child', function() {
      var $fruits = $(fruits).children();
      var $apple, $orange, $pear;

      $fruits.append(function() {
        return '<div class="first">';
      });

      $apple = $fruits.eq(0);
      $orange = $fruits.eq(1);
      $pear = $fruits.eq(2);

      expect($apple.find('.first')[0]).to.equal($apple.contents()[1]);
      expect($orange.find('.first')[0]).to.equal($orange.contents()[1]);
      expect($pear.find('.first')[0]).to.equal($pear.contents()[1]);
    });

    it('(fn) : should add returned Cheerio object as last child', function() {
      var $fruits = $(fruits).children();
      var $apple, $orange, $pear;

      $fruits.append(function() {
        return $('<div class="second">');
      });

      $apple = $fruits.eq(0);
      $orange = $fruits.eq(1);
      $pear = $fruits.eq(2);

      expect($apple.find('.second')[0]).to.equal($apple.contents()[1]);
      expect($orange.find('.second')[0]).to.equal($orange.contents()[1]);
      expect($pear.find('.second')[0]).to.equal($pear.contents()[1]);
    });

    it('(fn) : should add returned Node as last child', function() {
      var $fruits = $(fruits).children();
      var $apple, $orange, $pear;

      $fruits.append(function() {
        return $('<div class="third">')[0];
      });

      $apple = $fruits.eq(0);
      $orange = $fruits.eq(1);
      $pear = $fruits.eq(2);

      expect($apple.find('.third')[0]).to.equal($apple.contents()[1]);
      expect($orange.find('.third')[0]).to.equal($orange.contents()[1]);
      expect($pear.find('.third')[0]).to.equal($pear.contents()[1]);
    });

    it('should maintain correct object state (Issue: #10)', function() {
      var $obj = $('<div></div>')
        .append('<div><div></div></div>')
        .children()
        .children()
        .parent();
      expect($obj).to.be.ok();
    });

  });

  describe('.prepend', function() {

    it('() : should do nothing', function() {
      expect($('#fruits', fruits).prepend()[0].name).to.equal('ul');
    });

    it('(html) : should add element as first child', function() {
      var $fruits = $(fruits);
      $fruits.prepend('<li class="plum">Plum</li>');
      expect($fruits.children(0).hasClass('plum')).to.be.ok();
    });

    it('($(...)) : should add element as first child', function() {
      var $fruits = $(fruits);
      var $plum = $('<li class="plum">Plum</li>');
      $fruits.prepend($plum);
      expect($fruits.children(0).hasClass('plum')).to.be.ok();
    });

    it('(Node) : should add node as first child', function() {
      var $fruits = $(fruits);
      var plum = $('<li class="plum">Plum</li>')[0];
      $fruits.prepend(plum);
      expect($fruits.children(0).hasClass('plum')).to.be.ok();
    });

    it('(existing Node) : should remove existing nodes from previous locations', function() {
      var $fruits = $(fruits);
      var pear = $fruits.children()[2];
      var $children;

      expect($fruits.children()).to.have.length(3);
      $fruits.prepend(pear);
      $children = $fruits.children();

      expect($children).to.have.length(3);
      expect($children[2]).to.not.equal(pear);
      expect($children[0]).to.equal(pear);
    });

    it('(Array) : should add all elements in the array as inital children', function() {
      var $fruits = $(fruits);
      var more = $('<li class="plum">Plum</li><li class="grape">Grape</li>')
        .get();
      $fruits.prepend(more);
      expect($fruits.children(0).hasClass('plum')).to.be.ok();
      expect($fruits.children(1).hasClass('grape')).to.be.ok();
    });

    it('(html, $(...), html) : should add multiple elements as first children', function() {
      var $fruits = $(fruits);
      var $plum = $('<li class="plum">Plum</li>');
      var grape = '<li class="grape">Grape</li>';
      $fruits.prepend($plum, grape);
      expect($fruits.children(0).hasClass('plum')).to.be.ok();
      expect($fruits.children(1).hasClass('grape')).to.be.ok();
    });

    it('(fn) : should invoke the callback with the correct argument and context', function() {
      var $fruits = $(fruits).children();
      var args = [];
      var thisValues = [];

      $fruits.prepend(function() {
        args.push(toArray(arguments));
        thisValues.push(this);
      });

      expect(args).to.eql([
        [0, 'Apple'],
        [1, 'Orange'],
        [2, 'Pear']
      ]);
      expect(thisValues).to.eql([
        $fruits[0],
        $fruits[1],
        $fruits[2]
      ]);
    });

    it('(fn) : should add returned string as first child', function() {
      var $fruits = $(fruits).children();
      var $apple, $orange, $pear;

      $fruits.prepend(function() {
        return '<div class="first">';
      });

      $apple = $fruits.eq(0);
      $orange = $fruits.eq(1);
      $pear = $fruits.eq(2);

      expect($apple.find('.first')[0]).to.equal($apple.contents()[0]);
      expect($orange.find('.first')[0]).to.equal($orange.contents()[0]);
      expect($pear.find('.first')[0]).to.equal($pear.contents()[0]);
    });

    it('(fn) : should add returned Cheerio object as first child', function() {
      var $fruits = $(fruits).children();
      var $apple, $orange, $pear;

      $fruits.prepend(function() {
        return $('<div class="second">');
      });

      $apple = $fruits.eq(0);
      $orange = $fruits.eq(1);
      $pear = $fruits.eq(2);

      expect($apple.find('.second')[0]).to.equal($apple.contents()[0]);
      expect($orange.find('.second')[0]).to.equal($orange.contents()[0]);
      expect($pear.find('.second')[0]).to.equal($pear.contents()[0]);
    });

    it('(fn) : should add returned Node as first child', function() {
      var $fruits = $(fruits).children();
      var $apple, $orange, $pear;

      $fruits.prepend(function() {
        return $('<div class="third">')[0];
      });

      $apple = $fruits.eq(0);
      $orange = $fruits.eq(1);
      $pear = $fruits.eq(2);

      expect($apple.find('.third')[0]).to.equal($apple.contents()[0]);
      expect($orange.find('.third')[0]).to.equal($orange.contents()[0]);
      expect($pear.find('.third')[0]).to.equal($pear.contents()[0]);
    });

  });

  describe('.after', function() {

    it('() : should do nothing', function() {
      expect($('#fruits', fruits).after()[0].name).to.equal('ul');
    });

    it('(html) : should add element as next sibling', function() {
      var $fruits = $(fruits);
      var grape = '<li class="grape">Grape</li>';
      $('.apple', $fruits).after(grape);
      expect($('.apple', $fruits).next().hasClass('grape')).to.be.ok();
    });

    it('(Array) : should add all elements in the array as next sibling', function() {
      var $fruits = $(fruits);
      var more = $('<li class="plum">Plum</li><li class="grape">Grape</li>')
        .get();
      $('.apple', $fruits).after(more);
      expect($fruits.children(1).hasClass('plum')).to.be.ok();
      expect($fruits.children(2).hasClass('grape')).to.be.ok();
    });

    it('($(...)) : should add element as next sibling', function() {
      var $fruits = $(fruits);
      var $plum = $('<li class="plum">Plum</li>');
      $('.apple', $fruits).after($plum);
      expect($('.apple', $fruits).next().hasClass('plum')).to.be.ok();
    });

    it('(Node) : should add element as next sibling', function() {
      var $fruits = $(fruits);
      var plum = $('<li class="plum">Plum</li>')[0];
      $('.apple', $fruits).after(plum);
      expect($('.apple', $fruits).next().hasClass('plum')).to.be.ok();
    });

    it('(existing Node) : should remove existing nodes from previous locations', function() {
      var $fruits = $(fruits);
      var pear = $fruits.children()[2];
      var $children;

      $('.apple', $fruits).after(pear);

      $children = $fruits.children();
      expect($children).to.have.length(3);
      expect($children[1]).to.be(pear);
    });

    it('($(...), html) : should add multiple elements as next siblings', function() {
      var $fruits = $(fruits);
      var $plum = $('<li class="plum">Plum</li>');
      var grape = '<li class="grape">Grape</li>';
      $('.apple', $fruits).after($plum, grape);
      expect($('.apple', $fruits).next().hasClass('plum')).to.be.ok();
      expect($('.plum', $fruits).next().hasClass('grape')).to.be.ok();
    });

    it('(fn) : should invoke the callback with the correct argument and context', function() {
      var $fruits = $(fruits).children();
      var args = [];
      var thisValues = [];

      $fruits.after(function() {
        args.push(toArray(arguments));
        thisValues.push(this);
      });

      expect(args).to.eql([[0], [1], [2]]);
      expect(thisValues).to.eql([
        $fruits[0],
        $fruits[1],
        $fruits[2]
      ]);
    });

    it('(fn) : should add returned string as next sibling', function() {
      var $list = $(fruits);
      var $fruits = $list.children();

      $fruits.after(function() {
        return '<li class="first">';
      });

      expect($list.find('.first')[0]).to.equal($list.contents()[1]);
      expect($list.find('.first')[1]).to.equal($list.contents()[3]);
      expect($list.find('.first')[2]).to.equal($list.contents()[5]);
    });

    it('(fn) : should add returned Cheerio object as next sibling', function() {
      var $list = $(fruits);
      var $fruits = $list.children();

      $fruits.after(function() {
        return $('<li class="second">');
      });

      expect($list.find('.second')[0]).to.equal($list.contents()[1]);
      expect($list.find('.second')[1]).to.equal($list.contents()[3]);
      expect($list.find('.second')[2]).to.equal($list.contents()[5]);
    });

    it('(fn) : should add returned element as next sibling', function() {
      var $list = $(fruits);
      var $fruits = $list.children();

      $fruits.after(function() {
        return $('<li class="third">')[0];
      });

      expect($list.find('.third')[0]).to.equal($list.contents()[1]);
      expect($list.find('.third')[1]).to.equal($list.contents()[3]);
      expect($list.find('.third')[2]).to.equal($list.contents()[5]);
    });

  });

  describe('.before', function() {

    it('() : should do nothing', function() {
      expect($('#fruits', fruits).before()[0].name).to.equal('ul');
    });

    it('(html) : should add element as previous sibling', function() {
      var $fruits = $(fruits);
      var grape = '<li class="grape">Grape</li>';
      $('.apple', $fruits).before(grape);
      expect($('.apple', $fruits).prev().hasClass('grape')).to.be.ok();
    });

    it('($(...)) : should add element as previous sibling', function() {
      var $fruits = $(fruits);
      var $plum = $('<li class="plum">Plum</li>');
      $('.apple', $fruits).before($plum);
      expect($('.apple', $fruits).prev().hasClass('plum')).to.be.ok();
    });

    it('(Node) : should add element as previous sibling', function() {
      var $fruits = $(fruits);
      var plum = $('<li class="plum">Plum</li>');
      $('.apple', $fruits).before(plum);
      expect($('.apple', $fruits).prev().hasClass('plum')).to.be.ok();
    });

    it('(existing Node) : should remove existing nodes from previous locations', function() {
      var $fruits = $(fruits);
      var pear = $fruits.children()[2];
      var $children;

      $('.apple', $fruits).before(pear);

      $children = $fruits.children();
      expect($children).to.have.length(3);
      expect($children[0]).to.be(pear);
    });

    it('(Array) : should add all elements in the array as previous sibling', function() {
      var $fruits = $(fruits);
      var more = $('<li class="plum">Plum</li><li class="grape">Grape</li>')
        .get();
      $('.apple', $fruits).before(more);
      expect($fruits.children(0).hasClass('plum')).to.be.ok();
      expect($fruits.children(1).hasClass('grape')).to.be.ok();
    });

    it('($(...), html) : should add multiple elements as previous siblings', function() {
      var $fruits = $(fruits);
      var $plum = $('<li class="plum">Plum</li>');
      var grape = '<li class="grape">Grape</li>';
      $('.apple', $fruits).before($plum, grape);
      expect($('.apple', $fruits).prev().hasClass('grape')).to.be.ok();
      expect($('.grape', $fruits).prev().hasClass('plum')).to.be.ok();
    });

    it('(fn) : should invoke the callback with the correct argument and context', function() {
      var $fruits = $(fruits).children();
      var args = [];
      var thisValues = [];

      $fruits.before(function() {
        args.push(toArray(arguments));
        thisValues.push(this);
      });

      expect(args).to.eql([[0], [1], [2]]);
      expect(thisValues).to.eql([
        $fruits[0],
        $fruits[1],
        $fruits[2]
      ]);
    });

    it('(fn) : should add returned string as previous sibling', function() {
      var $list = $(fruits);
      var $fruits = $list.children();

      $fruits.before(function() {
        return '<li class="first">';
      });

      expect($list.find('.first')[0]).to.equal($list.contents()[0]);
      expect($list.find('.first')[1]).to.equal($list.contents()[2]);
      expect($list.find('.first')[2]).to.equal($list.contents()[4]);
    });

    it('(fn) : should add returned Cheerio object as previous sibling', function() {
      var $list = $(fruits);
      var $fruits = $list.children();

      $fruits.before(function() {
        return $('<li class="second">');
      });

      expect($list.find('.second')[0]).to.equal($list.contents()[0]);
      expect($list.find('.second')[1]).to.equal($list.contents()[2]);
      expect($list.find('.second')[2]).to.equal($list.contents()[4]);
    });

    it('(fn) : should add returned Node as previous sibling', function() {
      var $list = $(fruits);
      var $fruits = $list.children();

      $fruits.before(function() {
        return $('<li class="third">')[0];
      });

      expect($list.find('.third')[0]).to.equal($list.contents()[0]);
      expect($list.find('.third')[1]).to.equal($list.contents()[2]);
      expect($list.find('.third')[2]).to.equal($list.contents()[4]);
    });

  });

  describe('.remove', function() {

    it('() : should remove selected elements', function() {
      var $fruits = $(fruits);
      $('.apple', $fruits).remove();
      expect($fruits.find('.apple')).to.have.length(0);
    });

    it('(selector) : should remove matching selected elements', function() {
      var $fruits = $(fruits);
      $('li', $fruits).remove('.apple');
      expect($fruits.find('.apple')).to.have.length(0);
    });

  });

  describe('.replaceWith', function() {

    it('(elem) : should replace one <li> tag with another', function() {
      var $fruits = $(fruits);
      var $plum = $('<li class="plum">Plum</li>');
      $('.pear', $fruits).replaceWith($plum);
      expect($('.orange', $fruits).next().hasClass('plum')).to.be.ok();
      expect($('.orange', $fruits).next().html()).to.equal('Plum');
    });

    it('(Array) : should replace one <li> tag with the elements in the array', function() {
      var $fruits = $(fruits);
      var more = $('<li class="plum">Plum</li><li class="grape">Grape</li>')
        .get();
      $('.pear', $fruits).replaceWith(more);

      expect($fruits.children(2).hasClass('plum')).to.be.ok();
      expect($fruits.children(3).hasClass('grape')).to.be.ok();
      expect($fruits.children()).to.have.length(4);
    });

    it('(Node) : should replace the selected element with given node', function() {
      var $src = $('<h2>hi <span>there</span></h2>');
      var $new = $('<ul></ul>');
      var $replaced = $src.find('span').replaceWith($new[0]);
      expect($new[0].parent).to.equal($src[0]);
      expect($replaced[0].parent).to.equal(null);
      expect($.html($src)).to.equal('<h2>hi <ul></ul></h2>');
    });

    it('(existing element) : should remove element from its previous location', function() {
      var $fruits = $(fruits);
      $('.pear', $fruits).replaceWith($('.apple', $fruits));
      expect($fruits.children()).to.have.length(2);
      expect($fruits.children()[0]).to.equal($('.orange', $fruits)[0]);
      expect($fruits.children()[1]).to.equal($('.apple', $fruits)[0]);
    });

    it('(elem) : should replace the single selected element with given element', function() {
      var $src = $('<h2>hi <span>there</span></h2>');
      var $new = $('<div>here</div>');
      var $replaced = $src.find('span').replaceWith($new);
      expect($new[0].parent).to.equal($src[0]);
      expect($replaced[0].parent).to.equal(null);
      expect($.html($src)).to.equal('<h2>hi <div>here</div></h2>');
    });

    it('(str) : should accept strings', function() {
      var $src = $('<h2>hi <span>there</span></h2>');
      var newStr = '<div>here</div>';
      var $replaced = $src.find('span').replaceWith(newStr);
      expect($replaced[0].parent).to.equal(null);
      expect($.html($src)).to.equal('<h2>hi <div>here</div></h2>');
    });

    it('(str) : should replace all selected elements', function() {
      var $src = $('<b>a<br>b<br>c<br>d</b>');
      var $replaced = $src.find('br').replaceWith(' ');
      expect($replaced[0].parent).to.equal(null);
      expect($.html($src)).to.equal('<b>a b c d</b>');
    });

    it('(fn) : should invoke the callback with the correct argument and context', function() {
      var $fruits = $(fruits);
      var origChildren = $fruits.children().get();
      var args = [];
      var thisValues = [];

      $fruits.children().replaceWith(function() {
        args.push(toArray(arguments));
        thisValues.push(this);
        return '<li class="first">';
      });

      expect(args).to.eql([
        [0, origChildren[0]],
        [1, origChildren[1]],
        [2, origChildren[2]]
      ]);
      expect(thisValues).to.eql([
        origChildren[0],
        origChildren[1],
        origChildren[2]
      ]);
    });

    it('(fn) : should replace the selected element with the returned string', function() {
      var $fruits = $(fruits);

      $fruits.children().replaceWith(function() {
        return '<li class="first">';
      });

      expect($fruits.find('.first')).to.have.length(3);
    });

    it('(fn) : should replace the selected element with the returned Cheerio object', function() {
      var $fruits = $(fruits);

      $fruits.children().replaceWith(function() {
        return $('<li class="second">');
      });

      expect($fruits.find('.second')).to.have.length(3);
    });

    it('(fn) : should replace the selected element with the returned node', function() {
      var $fruits = $(fruits);

      $fruits.children().replaceWith(function() {
        return $('<li class="third">')[0];
      });

      expect($fruits.find('.third')).to.have.length(3);
    });

  });

  describe('.empty', function() {

    it('() : should remove all children from selected elements', function() {
      var $fruits = $(fruits);
      $('#fruits', $fruits).empty();
      expect($('#fruits', $fruits).children()).to.have.length(0);
    });

  });

  describe('.html', function() {

    it('() : should get the innerHTML for an element', function() {
      var $fruits = $(fruits);
      expect($fruits.html()).to.equal([
        '<li class="apple">Apple</li>',
        '<li class="orange">Orange</li>',
        '<li class="pear">Pear</li>'
      ].join(''));
    });

    it('() : should get innerHTML even if its just text', function() {
      var item = '<li class="pear">Pear</li>';
      expect($('.pear', item).html()).to.equal('Pear');
    });

    it('() : should return empty string if nothing inside', function() {
      var item = '<li></li>';
      expect($('li', item).html()).to.equal('');
    });

    it('(html) : should set the html for its children', function() {
      var $fruits = $(fruits);
      $fruits.html('<li class="durian">Durian</li>');
      var html = $fruits.html();
      expect(html).to.equal('<li class="durian">Durian</li>');
    });

    it('(elem) : should set the html for its children with element', function() {
      var $fruits = $(fruits);
      $fruits.html($('<li class="durian">Durian</li>'));
      var html = $fruits.html();
      expect(html).to.equal('<li class="durian">Durian</li>');
    });

  });

  describe('.toString', function() {
    it('() : should get the outerHTML for an element', function() {
      var $fruits = $(fruits);
      expect($fruits.toString()).to.equal(fruits);
    });

    it('() : should return an html string for a set of elements', function() {
      var $fruits = $(fruits);
      expect($fruits.find('li').toString()).to.equal('<li class="apple">Apple</li><li class="orange">Orange</li><li class="pear">Pear</li>');
    });

    it('() : should be called implicitly', function() {
      var string = [$('<foo>'), $('<bar>'), $('<baz>')].join('');
      expect(string).to.equal('<foo></foo><bar></bar><baz></baz>');
    });
  });

  describe('.text', function() {

    it('() : gets the text for a single element', function() {
      expect($('.apple', fruits).text()).to.equal('Apple');
    });

    it('() : combines all text from children text nodes', function() {
      expect($('#fruits', fruits).text()).to.equal('AppleOrangePear');
    });

    it('(text) : sets the text for the child node', function() {
      var $fruits = $(fruits);
      $('.apple', $fruits).text('Granny Smith Apple');
      expect($('.apple', $fruits)[0].children[0].data).to.equal('Granny Smith Apple');
    });

    it('should allow functions as arguments', function() {
      var $fruits = $(fruits);
      $('.apple', $fruits).text(function(idx, content) {
        expect(idx).to.equal(0);
        expect(content).to.equal('Apple');
        return 'whatever mate';
      });
      expect($('.apple', $fruits)[0].children[0].data).to.equal('whatever mate');
    });

    it('should decode special chars', function() {
      var text = $('<p>M&amp;M</p>').text();
      expect(text).to.equal('M&M');
    });

    it('should work with special chars added as strings', function() {
      var text = $('<p>M&M</p>').text();
      expect(text).to.equal('M&M');
    });

    it('( undefined ) : should act as an accessor', function() {
      var $div = $('<div>test</div>');
      expect($div.text(undefined)).to.be.a('string');
      expect($div.text()).to.be('test');
    });

    it('( "" ) : should convert to string', function() {
      var $div = $('<div>test</div>');
      expect($div.text('').text()).to.equal('');
    });

    it('( null ) : should convert to string', function() {
      expect($('<div>').text(null).text()).to.equal('null');
    });

    it('( 0 ) : should convert to string', function() {
      expect($('<div>').text(0).text()).to.equal('0');
    });

    it('(str) should encode then decode unsafe characters', function() {
      var $apple = $('.apple', fruits);

      $apple.text('blah <script>alert("XSS!")</script> blah');
      expect($apple[0].children[0].data).to.equal('blah &lt;script&gt;alert(&quot;XSS!&quot;)&lt;/script&gt; blah');
      expect($apple.text()).to.equal('blah <script>alert("XSS!")</script> blah');

      $apple.text('blah <script>alert("XSS!")</script> blah');
      expect($apple.html()).to.not.contain('<script>alert("XSS!")</script>');
    });
  });

});
