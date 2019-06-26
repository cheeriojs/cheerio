var fs = require('fs');
var path = require('path');

var Benchmark = require('benchmark');
var JSDOM = require('jsdom').JSDOM;
var Script = require('vm').Script;
var cheerio = require('..');

var documentDir = path.join(__dirname, 'documents');
var jQuerySrc = fs.readFileSync(
  path.join(__dirname, '../node_modules/jquery/dist/jquery.slim.js')
);
var jQueryScript = new Script(jQuerySrc);
var filterRe = /./;
var cheerioOnly = false;

var Suites = (module.exports = function() {});

Suites.prototype.filter = function(str) {
  filterRe = new RegExp(str, 'i');
};

Suites.prototype.cheerioOnly = function() {
  cheerioOnly = true;
};

Suites.prototype.add = function(name, fileName, options) {
  var markup, suite;
  if (!filterRe.test(name)) {
    return;
  }
  markup = fs.readFileSync(path.join(documentDir, fileName), 'utf8');
  suite = new Benchmark.Suite(name);

  suite.on('start', function() {
    console.log('Test: ' + name + ' (file: ' + fileName + ')');
  });
  suite.on('cycle', function(event) {
    if (event.target.error) {
      return;
    }
    console.log('\t' + String(event.target));
  });
  suite.on('error', function(event) {
    console.log('*** Error in ' + event.target.name + ': ***');
    console.log('\t' + event.target.error);
    console.log('*** Test invalidated. ***');
  });
  suite.on('complete', function(event) {
    if (event.target.error) {
      console.log();
      return;
    }
    console.log('\tFastest: ' + this.filter('fastest')[0].name + '\n');
  });

  this._benchCheerio(suite, markup, options);
  if (!cheerioOnly) {
    this._benchJsDom(suite, markup, options);
  } else {
    suite.run();
  }
};

Suites.prototype._benchJsDom = function(suite, markup, options) {
  var testFn = options.test;

  var dom = new JSDOM(markup, { runScripts: 'outside-only' });

  dom.runVMScript(jQueryScript);

  var setupData;
  if (options.setup) {
    setupData = options.setup.call(null, dom.window.$);
  }
  suite.add('jsdom', function() {
    testFn.call(null, dom.window.$, setupData);
  });
  suite.run();
};

Suites.prototype._benchCheerio = function(suite, markup, options) {
  var $ = cheerio.load(markup);
  var testFn = options.test;
  var setupData;
  if (options.setup) {
    setupData = options.setup.call(null, $);
  }
  suite.add('cheerio', function() {
    testFn.call(null, $, setupData);
  });
};
