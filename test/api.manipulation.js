var expect = require('expect.js'),
    cheerio = require('..'),
    fruits = require('./fixtures').fruits,
    toArray = Function.call.bind(Array.prototype.slice);

describe('$(...)', function() {

  var $, $fruits;

  beforeEach(function() {
    $ = cheerio.load(fruits);
    $fruits = $('#fruits');
  });

  describe('.append', function() {

    it('() : should do nothing', function() {
      expect($('#fruits').append()[0].tagName).to.equal('ul');
    });

    it('(html) : should add element as last child', function() {
      $fruits.append('<li class="plum">Plum</li>');
      expect($fruits.children(3).hasClass('plum')).to.be.ok();
    });

    it('($(...)) : should add element as last child', function() {
      var $plum = $('<li class="plum">Plum</li>');
      $fruits.append($plum);
      expect($fruits.children(3).hasClass('plum')).to.be.ok();
    });

    it('(Node) : should add element as last child', function() {
      var plum = $('<li class="plum">Plum</li>')[0];
      $fruits.append(plum);
      expect($fruits.children(3).hasClass('plum')).to.be.ok();
    });

    it('(existing Node) : should remove node from previous location', function() {
      var apple = $fruits.children()[0];
      var $children;

      expect($fruits.children()).to.have.length(3);
      $fruits.append(apple);
      $children = $fruits.children();

      expect($children).to.have.length(3);
      expect($children[0]).to.not.equal(apple);
      expect($children[2]).to.equal(apple);
    });

    it('(existing Node) : should remove existing node from previous location', function() {
      var apple = $fruits.children()[0];
      var $children;
      var $dest = $('<div></div>');

      expect($fruits.children()).to.have.length(3);
      $dest.append(apple);
      $children = $fruits.children();

      expect($children).to.have.length(2);
      expect($children[0]).to.not.equal(apple);

      expect($dest.children()).to.have.length(1);
      expect($dest.children()[0]).to.equal(apple);
    });

    it('(existing Node) : should update original direct siblings', function() {
      $('.pear').append($('.orange'));
      expect($('.apple').next()[0]).to.be($('.pear')[0]);
      expect($('.pear').prev()[0]).to.be($('.apple')[0]);
    });

    it('(elem) : should NOP if removed', function() {
      var $apple = $('.apple');

      $apple.remove();
      $fruits.append($apple);
      expect($fruits.children(2).hasClass('apple')).to.be.ok();
    });

    it('($(...), html) : should add multiple elements as last children', function() {
      var $plum = $('<li class="plum">Plum</li>');
      var grape = '<li class="grape">Grape</li>';
      $fruits.append($plum, grape);
      expect($fruits.children(3).hasClass('plum')).to.be.ok();
      expect($fruits.children(4).hasClass('grape')).to.be.ok();
    });

    it('(Array) : should append all elements in the array', function() {
      var more = $('<li class="plum">Plum</li><li class="grape">Grape</li>')
        .get();
      $fruits.append(more);
      expect($fruits.children(3).hasClass('plum')).to.be.ok();
      expect($fruits.children(4).hasClass('grape')).to.be.ok();
    });

    it('(fn) : should invoke the callback with the correct arguments and context', function() {
      $fruits = $fruits.children();
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
      $fruits = $fruits.children();
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
      var $apple, $orange, $pear;
      $fruits = $fruits.children();

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
      var $apple, $orange, $pear;
      $fruits = $fruits.children();

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

    it('($(...)) : should remove from root element', function() {
      var $plum = $('<li class="plum">Plum</li>');
      var root = $plum[0].root;
      expect(root).to.be.ok();

      $fruits.append($plum);
      expect($plum[0].root).to.not.be.ok();
      expect(root.childNodes).to.not.contain($plum[0]);
    });
  });

  describe('.prepend', function() {

    it('() : should do nothing', function() {
      expect($('#fruits').prepend()[0].tagName).to.equal('ul');
    });

    it('(html) : should add element as first child', function() {
      $fruits.prepend('<li class="plum">Plum</li>');
      expect($fruits.children(0).hasClass('plum')).to.be.ok();
    });

    it('($(...)) : should add element as first child', function() {
      var $plum = $('<li class="plum">Plum</li>');
      $fruits.prepend($plum);
      expect($fruits.children(0).hasClass('plum')).to.be.ok();
    });

    it('(Node) : should add node as first child', function() {
      var plum = $('<li class="plum">Plum</li>')[0];
      $fruits.prepend(plum);
      expect($fruits.children(0).hasClass('plum')).to.be.ok();
    });

    it('(existing Node) : should remove existing nodes from previous locations', function() {
      var pear = $fruits.children()[2];
      var $children;

      expect($fruits.children()).to.have.length(3);
      $fruits.prepend(pear);
      $children = $fruits.children();

      expect($children).to.have.length(3);
      expect($children[2]).to.not.equal(pear);
      expect($children[0]).to.equal(pear);
    });

    it('(existing Node) : should update original direct siblings', function() {
      $('.pear').prepend($('.orange'));
      expect($('.apple').next()[0]).to.be($('.pear')[0]);
      expect($('.pear').prev()[0]).to.be($('.apple')[0]);
    });

    it('(elem) : should handle if removed', function() {
      var $apple = $('.apple');

      $apple.remove();
      $fruits.prepend($apple);
      expect($fruits.children(0).hasClass('apple')).to.be.ok();
    });

    it('(Array) : should add all elements in the array as inital children', function() {
      var more = $('<li class="plum">Plum</li><li class="grape">Grape</li>')
        .get();
      $fruits.prepend(more);
      expect($fruits.children(0).hasClass('plum')).to.be.ok();
      expect($fruits.children(1).hasClass('grape')).to.be.ok();
    });

    it('(html, $(...), html) : should add multiple elements as first children', function() {
      var $plum = $('<li class="plum">Plum</li>');
      var grape = '<li class="grape">Grape</li>';
      $fruits.prepend($plum, grape);
      expect($fruits.children(0).hasClass('plum')).to.be.ok();
      expect($fruits.children(1).hasClass('grape')).to.be.ok();
    });

    it('(fn) : should invoke the callback with the correct arguments and context', function() {
      var args = [];
      var thisValues = [];
      $fruits = $fruits.children();

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
      var $apple, $orange, $pear;
      $fruits = $fruits.children();

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
      var $apple, $orange, $pear;
      $fruits = $fruits.children();

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
      var $apple, $orange, $pear;
      $fruits = $fruits.children();

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


    it('($(...)) : should remove from root element', function() {
      var $plum = $('<li class="plum">Plum</li>');
      var root = $plum[0].root;
      expect(root).to.be.ok();

      $fruits.prepend($plum);
      expect($plum[0].root).to.not.be.ok();
      expect(root.childNodes).to.not.contain($plum[0]);
    });
  });

  describe('.after', function() {

    it('() : should do nothing', function() {
      expect($('#fruits').after()[0].tagName).to.equal('ul');
    });

    it('(html) : should add element as next sibling', function() {
      var grape = '<li class="grape">Grape</li>';
      $('.apple').after(grape);
      expect($('.apple').next().hasClass('grape')).to.be.ok();
    });

    it('(Array) : should add all elements in the array as next sibling', function() {
      var more = $('<li class="plum">Plum</li><li class="grape">Grape</li>')
        .get();
      $('.apple').after(more);
      expect($fruits.children(1).hasClass('plum')).to.be.ok();
      expect($fruits.children(2).hasClass('grape')).to.be.ok();
    });

    it('($(...)) : should add element as next sibling', function() {
      var $plum = $('<li class="plum">Plum</li>');
      $('.apple').after($plum);
      expect($('.apple').next().hasClass('plum')).to.be.ok();
    });

    it('(Node) : should add element as next sibling', function() {
      var plum = $('<li class="plum">Plum</li>')[0];
      $('.apple').after(plum);
      expect($('.apple').next().hasClass('plum')).to.be.ok();
    });

    it('(existing Node) : should remove existing nodes from previous locations', function() {
      var pear = $fruits.children()[2];
      var $children;

      $('.apple').after(pear);

      $children = $fruits.children();
      expect($children).to.have.length(3);
      expect($children[1]).to.be(pear);
    });

    it('(existing Node) : should update original direct siblings', function() {
      $('.pear').after($('.orange'));
      expect($('.apple').next()[0]).to.be($('.pear')[0]);
      expect($('.pear').prev()[0]).to.be($('.apple')[0]);
    });

    it('(elem) : should handle if removed', function() {
      var $apple = $('.apple');
      var $plum = $('<li class="plum">Plum</li>');

      $apple.remove();
      $apple.after($plum);
      expect($plum.prev()).to.be.empty();
    });

    it('($(...), html) : should add multiple elements as next siblings', function() {
      var $plum = $('<li class="plum">Plum</li>');
      var grape = '<li class="grape">Grape</li>';
      $('.apple').after($plum, grape);
      expect($('.apple').next().hasClass('plum')).to.be.ok();
      expect($('.plum').next().hasClass('grape')).to.be.ok();
    });

    it('(fn) : should invoke the callback with the correct arguments and context', function() {
      var args = [];
      var thisValues = [];
      $fruits = $fruits.children();

      $fruits.after(function() {
        args.push(toArray(arguments));
        thisValues.push(this);
      });

      expect(args).to.eql([[0, 'Apple'], [1, 'Orange'], [2, 'Pear']]);
      expect(thisValues).to.eql([
        $fruits[0],
        $fruits[1],
        $fruits[2]
      ]);
    });

    it('(fn) : should add returned string as next sibling', function() {
      $fruits = $fruits.children();

      $fruits.after(function() {
        return '<li class="first">';
      });

      expect($('.first')[0]).to.equal($('#fruits').contents()[1]);
      expect($('.first')[1]).to.equal($('#fruits').contents()[3]);
      expect($('.first')[2]).to.equal($('#fruits').contents()[5]);
    });

    it('(fn) : should add returned Cheerio object as next sibling', function() {
      $fruits = $fruits.children();

      $fruits.after(function() {
        return $('<li class="second">');
      });

      expect($('.second')[0]).to.equal($('#fruits').contents()[1]);
      expect($('.second')[1]).to.equal($('#fruits').contents()[3]);
      expect($('.second')[2]).to.equal($('#fruits').contents()[5]);
    });

    it('(fn) : should add returned element as next sibling', function() {
      $fruits = $fruits.children();

      $fruits.after(function() {
        return $('<li class="third">')[0];
      });

      expect($('.third')[0]).to.equal($('#fruits').contents()[1]);
      expect($('.third')[1]).to.equal($('#fruits').contents()[3]);
      expect($('.third')[2]).to.equal($('#fruits').contents()[5]);
    });

    it('($(...)) : should remove from root element', function() {
      var $plum = $('<li class="plum">Plum</li>');
      var root = $plum[0].root;
      expect(root).to.be.ok();

      $fruits.after($plum);
      expect($plum[0].root).to.not.be.ok();
      expect(root.childNodes).to.not.contain($plum[0]);
    });
  });

  describe('.before', function() {

    it('() : should do nothing', function() {
      expect($('#fruits').before()[0].tagName).to.equal('ul');
    });

    it('(html) : should add element as previous sibling', function() {
      var grape = '<li class="grape">Grape</li>';
      $('.apple').before(grape);
      expect($('.apple').prev().hasClass('grape')).to.be.ok();
    });

    it('($(...)) : should add element as previous sibling', function() {
      var $plum = $('<li class="plum">Plum</li>');
      $('.apple').before($plum);
      expect($('.apple').prev().hasClass('plum')).to.be.ok();
    });

    it('(Node) : should add element as previous sibling', function() {
      var plum = $('<li class="plum">Plum</li>');
      $('.apple').before(plum);
      expect($('.apple').prev().hasClass('plum')).to.be.ok();
    });

    it('(existing Node) : should remove existing nodes from previous locations', function() {
      var pear = $fruits.children()[2];
      var $children;

      $('.apple').before(pear);

      $children = $fruits.children();
      expect($children).to.have.length(3);
      expect($children[0]).to.be(pear);
    });

    it('(existing Node) : should update original direct siblings', function() {
      $('.apple').before($('.orange'));
      expect($('.apple').next()[0]).to.be($('.pear')[0]);
      expect($('.pear').prev()[0]).to.be($('.apple')[0]);
    });

    it('(elem) : should handle if removed', function() {
      var $apple = $('.apple');
      var $plum = $('<li class="plum">Plum</li>');

      $apple.remove();
      $apple.before($plum);
      expect($plum.next()).to.be.empty();
    });

    it('(Array) : should add all elements in the array as previous sibling', function() {
      var more = $('<li class="plum">Plum</li><li class="grape">Grape</li>')
        .get();
      $('.apple').before(more);
      expect($fruits.children(0).hasClass('plum')).to.be.ok();
      expect($fruits.children(1).hasClass('grape')).to.be.ok();
    });

    it('($(...), html) : should add multiple elements as previous siblings', function() {
      var $plum = $('<li class="plum">Plum</li>');
      var grape = '<li class="grape">Grape</li>';
      $('.apple').before($plum, grape);
      expect($('.apple').prev().hasClass('grape')).to.be.ok();
      expect($('.grape').prev().hasClass('plum')).to.be.ok();
    });

    it('(fn) : should invoke the callback with the correct arguments and context', function() {
      var args = [];
      var thisValues = [];
      $fruits = $fruits.children();

      $fruits.before(function() {
        args.push(toArray(arguments));
        thisValues.push(this);
      });

      expect(args).to.eql([[0, 'Apple'], [1, 'Orange'], [2, 'Pear']]);
      expect(thisValues).to.eql([
        $fruits[0],
        $fruits[1],
        $fruits[2]
      ]);
    });

    it('(fn) : should add returned string as previous sibling', function() {
      $fruits = $fruits.children();

      $fruits.before(function() {
        return '<li class="first">';
      });

      expect($('.first')[0]).to.equal($('#fruits').contents()[0]);
      expect($('.first')[1]).to.equal($('#fruits').contents()[2]);
      expect($('.first')[2]).to.equal($('#fruits').contents()[4]);
    });

    it('(fn) : should add returned Cheerio object as previous sibling', function() {
      $fruits = $fruits.children();

      $fruits.before(function() {
        return $('<li class="second">');
      });

      expect($('.second')[0]).to.equal($('#fruits').contents()[0]);
      expect($('.second')[1]).to.equal($('#fruits').contents()[2]);
      expect($('.second')[2]).to.equal($('#fruits').contents()[4]);
    });

    it('(fn) : should add returned Node as previous sibling', function() {
      $fruits = $fruits.children();

      $fruits.before(function() {
        return $('<li class="third">')[0];
      });

      expect($('.third')[0]).to.equal($('#fruits').contents()[0]);
      expect($('.third')[1]).to.equal($('#fruits').contents()[2]);
      expect($('.third')[2]).to.equal($('#fruits').contents()[4]);
    });

    it('($(...)) : should remove from root element', function() {
      var $plum = $('<li class="plum">Plum</li>');
      var root = $plum[0].root;
      expect(root).to.be.ok();

      $fruits.before($plum);
      expect($plum[0].root).to.not.be.ok();
      expect(root.childNodes).to.not.contain($plum[0]);
    });
  });

  describe('.remove', function() {

    it('() : should remove selected elements', function() {
      $('.apple').remove();
      expect($fruits.find('.apple')).to.have.length(0);
    });

    it('() : should be reentrant', function() {
      var $apple = $('.apple');
      $apple.remove();
      $apple.remove();
      expect($fruits.find('.apple')).to.have.length(0);
    });

    it('(selector) : should remove matching selected elements', function() {
      $('li').remove('.apple');
      expect($fruits.find('.apple')).to.have.length(0);
    });

    it('($(...)) : should remove from root element', function() {
      var $plum = $('<li class="plum">Plum</li>');
      var root = $plum[0].root;
      expect(root).to.be.ok();

      $plum.remove();
      expect($plum[0].root).to.not.be.ok();
      expect(root.childNodes).to.not.contain($plum[0]);
    });
  });

  describe('.replaceWith', function() {

    it('(elem) : should replace one <li> tag with another', function() {
      var $plum = $('<li class="plum">Plum</li>');
      $('.pear').replaceWith($plum);
      expect($('.orange').next().hasClass('plum')).to.be.ok();
      expect($('.orange').next().html()).to.equal('Plum');
    });

    it('(Array) : should replace one <li> tag with the elements in the array', function() {
      var more = $('<li class="plum">Plum</li><li class="grape">Grape</li>')
        .get();
      $('.pear').replaceWith(more);

      expect($fruits.children(2).hasClass('plum')).to.be.ok();
      expect($fruits.children(3).hasClass('grape')).to.be.ok();
      expect($fruits.children()).to.have.length(4);
    });

    it('(Node) : should replace the selected element with given node', function() {
      var $src = $('<h2>hi <span>there</span></h2>');
      var $new = $('<ul></ul>');
      var $replaced = $src.find('span').replaceWith($new[0]);
      expect($new[0].parentNode).to.equal($src[0]);
      expect($replaced[0].parentNode).to.equal(null);
      expect($.html($src)).to.equal('<h2>hi <ul></ul></h2>');
    });

    it('(existing element) : should remove element from its previous location', function() {
      $('.pear').replaceWith($('.apple'));
      expect($fruits.children()).to.have.length(2);
      expect($fruits.children()[0]).to.equal($('.orange')[0]);
      expect($fruits.children()[1]).to.equal($('.apple')[0]);
    });

    it('(elem) : should NOP if removed', function() {
      var $pear = $('.pear');
      var $plum = $('<li class="plum">Plum</li>');

      $pear.remove();
      $pear.replaceWith($plum);
      expect($('.orange').next().hasClass('plum')).to.not.be.ok();
    });

    it('(elem) : should replace the single selected element with given element', function() {
      var $src = $('<h2>hi <span>there</span></h2>');
      var $new = $('<div>here</div>');
      var $replaced = $src.find('span').replaceWith($new);
      expect($new[0].parentNode).to.equal($src[0]);
      expect($replaced[0].parentNode).to.equal(null);
      expect($.html($src)).to.equal('<h2>hi <div>here</div></h2>');
    });

    it('(str) : should accept strings', function() {
      var $src = $('<h2>hi <span>there</span></h2>');
      var newStr = '<div>here</div>';
      var $replaced = $src.find('span').replaceWith(newStr);
      expect($replaced[0].parentNode).to.equal(null);
      expect($.html($src)).to.equal('<h2>hi <div>here</div></h2>');
    });

    it('(str) : should replace all selected elements', function() {
      var $src = $('<b>a<br>b<br>c<br>d</b>');
      var $replaced = $src.find('br').replaceWith(' ');
      expect($replaced[0].parentNode).to.equal(null);
      expect($.html($src)).to.equal('<b>a b c d</b>');
    });

    it('(fn) : should invoke the callback with the correct argument and context', function() {
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
      $fruits.children().replaceWith(function() {
        return '<li class="first">';
      });

      expect($fruits.find('.first')).to.have.length(3);
    });

    it('(fn) : should replace the selected element with the returned Cheerio object', function() {
      $fruits.children().replaceWith(function() {
        return $('<li class="second">');
      });

      expect($fruits.find('.second')).to.have.length(3);
    });

    it('(fn) : should replace the selected element with the returned node', function() {
      $fruits.children().replaceWith(function() {
        return $('<li class="third">')[0];
      });

      expect($fruits.find('.third')).to.have.length(3);
    });

    it('($(...)) : should remove from root element', function() {
      var $plum = $('<li class="plum">Plum</li>');
      var root = $plum[0].root;
      expect(root).to.be.ok();

      $fruits.children().replaceWith($plum);
      expect($plum[0].root).to.not.be.ok();
      expect(root.childNodes).to.not.contain($plum[0]);
    });
  });

  describe('.empty', function() {
    it('() : should remove all children from selected elements', function() {
      expect($fruits.children()).to.have.length(3);

      $fruits.empty();
      expect($fruits.children()).to.have.length(0);
    });

    it('() : should allow element reinsertion', function() {
      var $children = $fruits.children();

      $fruits.empty();
      expect($fruits.children()).to.have.length(0);
      expect($children).to.have.length(3);

      $fruits.append($('<div></div><div></div>'));
      var $remove = $fruits.children().eq(0);

      $remove.replaceWith($children);
      expect($fruits.children()).to.have.length(4);
    });

    it('() : should destroy children\'s references to the parent', function() {
      var $children = $fruits.children();

      $fruits.empty();

      expect($children.eq(0).parent()).to.have.length(0);
      expect($children.eq(0).next()).to.have.length(0);
      expect($children.eq(0).prev()).to.have.length(0);
      expect($children.eq(1).parent()).to.have.length(0);
      expect($children.eq(1).next()).to.have.length(0);
      expect($children.eq(1).prev()).to.have.length(0);
      expect($children.eq(2).parent()).to.have.length(0);
      expect($children.eq(2).next()).to.have.length(0);
      expect($children.eq(2).prev()).to.have.length(0);
    });

  });

  describe('.html', function() {

    it('() : should get the innerHTML for an element', function() {
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
      $fruits.html('<li class="durian">Durian</li>');
      var html = $fruits.html();
      expect(html).to.equal('<li class="durian">Durian</li>');
    });

    it('(html) : should add new elements for each element in selection', function() {
      var $fruits = $('li');
      $fruits.html('<li class="durian">Durian</li>');
      var tested = 0;
      $fruits.each(function(){
        expect($(this).children().parent().get(0)).to.equal(this);
        tested++;
      });
      expect(tested).to.equal(3);
    });

    it('(elem) : should set the html for its children with element', function() {
      $fruits.html($('<li class="durian">Durian</li>'));
      var html = $fruits.html();
      expect(html).to.equal('<li class="durian">Durian</li>');
    });

    it('() : should allow element reinsertion', function() {
      var $children = $fruits.children();

      $fruits.html('<div></div><div></div>');
      expect($fruits.children()).to.have.length(2);

      var $remove = $fruits.children().eq(0);

      $remove.replaceWith($children);
      expect($fruits.children()).to.have.length(4);
    });
  });

  describe('.toString', function() {
    it('() : should get the outerHTML for an element', function() {
      expect($fruits.toString()).to.equal(fruits);
    });

    it('() : should return an html string for a set of elements', function() {
      expect($fruits.find('li').toString()).to.equal('<li class="apple">Apple</li><li class="orange">Orange</li><li class="pear">Pear</li>');
    });

    it('() : should be called implicitly', function() {
      var string = [$('<foo>'), $('<bar>'), $('<baz>')].join('');
      expect(string).to.equal('<foo></foo><bar></bar><baz></baz>');
    });
  });

  describe('.text', function() {

    it('() : gets the text for a single element', function() {
      expect($('.apple').text()).to.equal('Apple');
    });

    it('() : combines all text from children text nodes', function() {
      expect($('#fruits').text()).to.equal('AppleOrangePear');
    });

    it('(text) : sets the text for the child node', function() {
      $('.apple').text('Granny Smith Apple');
      expect($('.apple')[0].childNodes[0].data).to.equal('Granny Smith Apple');
    });

    it('(text) : inserts separate nodes for all children', function() {
      $('li').text('Fruits');
      var tested = 0;
      $('li').each(function(){
        expect(this.childNodes[0].parent).to.equal(this);
        tested++;
      });
      expect(tested).to.equal(3);
    });

    it('should allow functions as arguments', function() {
      $('.apple').text(function(idx, content) {
        expect(idx).to.equal(0);
        expect(content).to.equal('Apple');
        return 'whatever mate';
      });
      expect($('.apple')[0].childNodes[0].data).to.equal('whatever mate');
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
      var $apple = $('.apple');

      $apple.text('blah <script>alert("XSS!")</script> blah');
      expect($apple[0].childNodes[0].data).to.equal('blah <script>alert("XSS!")</script> blah');
      expect($apple.text()).to.equal('blah <script>alert("XSS!")</script> blah');

      $apple.text('blah <script>alert("XSS!")</script> blah');
      expect($apple.html()).to.not.contain('<script>alert("XSS!")</script>');
    });
  });

});
