if (typeof jQuery == "undefined" || $ != jQuery) {  // not running in the browser
    var $ = require('../');
    var expect = require('expect');
}
  
describe('.first() and .last()', function() {

    it('first() should return the first item', function() {
        var src = $("<span>foo</span><span>bar</span><span>baz</span>");
        var elem = src.first();
          
        expect(elem.length).to.be(1);
        expect(elem.html()).to.be('foo');
//        $.html(elem).should.equal('<span>foo</span>');
    });

    it('last() should return the last item', function() {
        var src = $("<span>foo</span><span>bar</span><span>baz</span>");
        var elem = src.last();
          
        expect(elem.length).to.be(1);
        expect(elem.html()).to.be('baz');
//        $.html(elem).should.equal('<span>baz</span>');
    });

    it('first() and last() should return the same element for a single element', function() {
        var src = $("<span>bar</span>");
        var first = src.first();
        var last = src.last();
          
        expect(first.toArray()).to.eql(last.toArray());
        expect(first.length).to.be(1);
        expect(first.html()).to.be('bar');
        expect(last.length).to.be(1);
        expect(last.html()).to.be('bar');
    });

    it('first() and last() should return an empty object for an empty object', function() {
        var src = $();
        var first = src.first();
        var last = src.last();
          
        expect(first.toArray()).to.eql(last.toArray());
        expect(first.length).to.be(0);
        expect(first.html()).to.be(null);
        expect(last.length).to.be(0);
        expect(last.html()).to.be(null);
    });

});

describe('.clone()', function() {

    it('clone should return a copy', function() {
        var src = $("<div><span>foo</span><span>bar</span><span>baz</span></div>").children();
        var elem = src.clone();
          
        expect(elem.length).to.be(3);
        expect(elem.parent().length).to.be(0);
    });
});

describe('.html()', function() {

    it('html(<value>) should be able to set to an empty string', function() {
        var elem = $("<span>foo</span>").children();
        elem.html("");
          
        expect(elem.html()).to.be(null);
    });
});