if (typeof jQuery == "undefined" || $ != jQuery) {  // not running in the browser
    var $ = require('../');
    var should = require('should');
}
  
describe('.first() and .last()', function() {

    it('first() should return the first item', function() {
        var src = $("<span>foo</span><span>bar</span><span>baz</span>");
        var elem = src.first();
          
        elem.html().should.equal('foo');
        elem.length.should.equal(1);
//        $.html(elem).should.equal('<span>foo</span>');
    });

    it('last() should return the last item', function() {
        var src = $("<span>foo</span><span>bar</span><span>baz</span>");
        var elem = src.last();
          
        elem.html().should.equal('baz');
        elem.length.should.equal(1);
//        $.html(elem).should.equal('<span>baz</span>');
    });

    it('first() and last() should return the same element for a single element', function() {
        var src = $("<span>bar</span>");
        var first = src.first();
        var last = src.last();
          
        first.html().should.equal('bar');
        last.html().should.equal('bar');
        last.length.should.equal(1);
    });

    it('first() and last() should return an empty object for an empty object', function() {
        var src = $();
        var first = src.first();
        var last = src.last();
          
        first.html().should.equal('');
        last.html().should.equal('');
        first.length.should.equal(0);
        last.length.should.equal(0);
    });

});

describe('.clone', function() {

    it('clone should return a copy', function() {
        var src = $("<div><span>foo</span><span>bar</span><span>baz</span></div>").children();
        var elem = src.clone();
          
        elem.html().should.equal('foo');
        elem.length.should.equal(3);
    });


});