var expect = require('expect.js'),
    parse = require('../lib/parse'),
    render = require('../lib/render');

var html = function(str, options) {
  options = options || {};
  var dom = parse(str, options);
  return render(dom);
};

var xml = function(str, options) {
  options = options || {};
  options.xmlMode = true;
  var dom = parse(str, options);
  return render(dom, {xmlMode:true});
};

describe('render', function() {

  describe('(html)', function() {

    it('should render <br /> tags correctly', function() {
      var str = '<br />';
      expect(html(str)).to.equal('<br>');
    });

    it('should handle double quotes within single quoted attributes properly', function() {
      var str = '<hr class=\'an "edge" case\' />';
      expect(html(str)).to.equal('<hr class="an &quot;edge&quot; case">');
    });

    it('should retain encoded HTML content within attributes', function() {
      var str = '<hr class="cheerio &amp; node = happy parsing" />';
      expect(html(str)).to.equal('<hr class="cheerio &amp; node = happy parsing">');
    });

    it('should shorten the "checked" attribute when it contains the value "checked"', function() {
      var str = '<input checked/>';
      expect(html(str)).to.equal('<input checked>');
    });

    it('should not shorten the "name" attribute when it contains the value "name"', function() {
      var str = '<input name="name"/>';
      expect(html(str)).to.equal('<input name="name">');
    });

    it('should render comments correctly', function() {
      var str = '<!-- comment -->';
      expect(html(str)).to.equal('<!-- comment -->');
    });

    it('should render whitespace by default', function() {
      var str = '<a href="./haha.html">hi</a> <a href="./blah.html">blah</a>';
      expect(html(str)).to.equal(str);
    });

    it('should normalize whitespace if specified', function() {
      var str = '<a href="./haha.html">hi</a> <a href="./blah.html">blah  </a>';
      expect(html(str, { normalizeWhitespace: true })).to.equal('<a href="./haha.html">hi</a> <a href="./blah.html">blah </a>');
    });

    it('should preserve multiple hyphens in data attributes', function() {
      var str = '<div data-foo-bar-baz="value"></div>';
      expect(html(str)).to.equal('<div data-foo-bar-baz="value"></div>');
    });
    
    it('should render CDATA correctly', function() {
      var str = '<a> <b> <![CDATA[ asdf&asdf ]]> <c/> <![CDATA[ asdf&asdf ]]> </b> </a>';
      expect(xml(str)).to.equal(str);
    });

  });

});
