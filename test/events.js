var expect = require('expect.js'),
  cheerio = require('../');

describe('$', function () {

  it('should have trigger and on methods', function (done) {
    var $ = cheerio.load('<div class="elem">text</div>').root().children();
    expect($.trigger).to.be.a('function');
    expect($.on).to.be.a('function');
    done();
  });

  it('should add listeners and trigger events', function (done) {
    var $ = cheerio.load('<div class="elem">text</div>').root().children();
    var res = false;
    $.on('event', function (e) {
      res = !res;
    });
    $.trigger('event');
    expect(res).to.equal(true);
    done();
  });

  it('should bubble events', function (done) {
    var $ = cheerio.load('<div class="parent"><div class="child"></div></div>');
    var parent = $('.parent');
    var child = $('.child');
    var res = false;
    parent.on('event', function (e) {
      res = !res;
    });
    child.trigger('event');
    expect(res).to.equal(true);
    done();
  });

  it('should stop propogation', function (done) {
    var $ = cheerio.load('<div class="parent"><div class="child"></div></div>');
    var parent = $('.parent');
    var child = $('.child');
    var res = false;
    child.on('event', function (e) {
      e.stopPropagation();
      res = !res;
    });
    parent.on('event', function (e) {
      res = !res;
    });
    child.trigger('event');
    expect(res).to.equal(true);
    done();
  });

});