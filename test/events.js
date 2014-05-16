var expect = require('expect.js'),
  cheerio = require('../'),
  fruits = require('./fixtures').fruits;

var $, $fruits, $apple;

describe('$', function () {

  beforeEach(function () {
    $ = cheerio.load(fruits);
    $fruits = $('#fruits');
    $apple = $('.apple');
  });

  it('should have trigger, on and off methods', function () {
    expect($apple.trigger).to.be.a('function');
    expect($apple.on).to.be.a('function');
    expect($apple.off).to.be.a('function');
  });

  it('should add listeners and trigger events', function () {
    var toggle = false;
    $apple.on('event', function (e) {
      toggle = !toggle;
    });
    $apple.trigger('event');
    expect(toggle).to.equal(true);
  });

  it('should bubble events', function () {
    var toggle = false;
    $fruits.on('event', function (e) {
      toggle = !toggle;
    });
    $apple.trigger('event');
    expect(toggle).to.equal(true);
  });

  it('should stop propogation', function () {
    var toggle = false;
    $apple.on('event', function (e) {
      e.stopPropagation();
      toggle = !toggle;
    });
    $fruits.on('event', function (e) {
      toggle = !toggle;
    });
    $apple.trigger('event');
    expect(toggle).to.equal(true);
  });

  it('should support extra arguments', function () {
    var toggle = true;
    $apple.on('event', function (e) {
      toggle = !toggle;
    });
    $fruits.on('event', function (e, arg, arg1) {
      toggle = !toggle;
      expect(arg).to.equal('arg');
      expect(arg1).to.equal('arg1');
    });
    $apple.trigger('event', ['arg', 'arg1']);
    expect(toggle).to.equal(true);
  });

  it('should remove all listeners for all events', function () {
    var toggle = true;
    $apple.on('event', function (e) {
      toggle = !toggle;
    });
    $apple.off();
    $apple.trigger('event');
    expect(toggle).to.equal(true);
  });

  it('should remove all listeners for selected event', function () {
    var toggle = true,
      toggle1 = true;
    $apple.on('event', function () {
      toggle = false;
    });
    $apple.on('event1', function () {
      toggle1 = false;
    });
    $apple.off('event1');
    $apple.trigger('event');
    $apple.trigger('event1');
    expect(toggle).to.equal(false);
    expect(toggle1).to.equal(true);
  });

});