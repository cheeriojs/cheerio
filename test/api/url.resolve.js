/**
 * Created by user on 2018/2/23/023.
 */

var expect = require('expect.js');

var cheerio = require('../..');
var links = require('../fixtures').link;

describe('$(...)', function()
{
  var $;

  describe('.prop', function ()
  {
    beforeEach(function ()
    {
      $ = cheerio.load(links, {
        baseURI: 'http://ncode.syosetu.com/a/b/c',
      });
    });

    it('(href|src) : should return full url', function ()
    {
      expect($('#href001').prop('href')).to.equal('http://ncode.syosetu.com/n1745ct/1/');
      expect($('#href002').prop('href')).to.equal('http://ncode.syosetu.com/a/b/n1745ct/1/');
      expect($('#href003').prop('href')).to.equal('http://ncode.syosetu.com/a/n1745ct/1/');
      expect($('#img001').prop('src')).to.equal('http://ncode.syosetu.com/n1745ct/1/');
      expect($('#img002').prop('src')).to.equal('http://ncode.syosetu.com/a/b/n1745ct/1/');
      expect($('#img003').prop('src')).to.equal('http://ncode.syosetu.com/a/n1745ct/1/');
    });
  });

});
