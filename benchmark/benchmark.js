#!/usr/bin/env node

var Suites = require('./suite');
var suites = new Suites();

var regexIdx = process.argv.indexOf('--regex') + 1;
if (regexIdx > 0) {
  if (regexIdx === process.argv.length) {
    console.error('Error: the "--regex" option requires a value');
    process.exit(1);
  }
  suites.filter(process.argv[regexIdx]);
}

suites.add('Select all', 'jquery.html', {
  test: function($) { $('*').length; }
});
suites.add('Select some', 'jquery.html', {
  test: function($) { $('li').length; }
});
suites.add('Toggle class', 'jquery.html', {
  setup: function($) {
    return $('li');
  },
  test: function($, $lis) {
    $lis.toggleClass('foo');
  }
});
suites.add('Create markup', 'jquery.html', {
  setup: function($) {
    return $('body');
  },
  test: function($, $body) {
    $body.append(new Array(50).join('<div>'));
  }
});
