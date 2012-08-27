var expect = require('expect.js'),
    parse = require('../lib/parse'),
    render = require('../lib/render');

var html = function(str, options) {
  options = options || {};
  var dom = parse(str, options);
  return render(dom);
};

describe('render', function() {

  describe('(html)', function() {

    it('should render <br /> tags correctly', function(done) {
      var str = '<br />';
      expect(html(str)).to.equal('<br>');
      done();
    });

    it('should shorten the "checked" attribute when it contains the value "checked"', function(done) {
      var str = '<input checked/>';
      expect(html(str)).to.equal('<input checked>');
      done();
    });

    it('should not shorten the "name" attribute when it contains the value "name"', function(done) {
      var str = '<input name="name"/>';
      expect(html(str)).to.equal('<input name="name">');
      done();
    });

    it('should render comments correctly', function(done) {
      var str = '<!-- comment -->';
      expect(html(str)).to.equal('<!-- comment -->');
      done();
    });

    it('should render whitespace by default', function(done) {
      var str = '<a href="./haha.html">hi</a> <a href="./blah.html">blah</a>';
      expect(html(str)).to.equal(str);
      done();
    });

    it('should ignore whitespace if specified', function(done) {
      var str = '<a href="./haha.html">hi</a> <a href="./blah.html">blah  </a>';
      expect(html(str, {ignoreWhitespace: true})).to.equal('<a href="./haha.html">hi</a><a href="./blah.html">blah  </a>');
      done();
    });

  });

});
