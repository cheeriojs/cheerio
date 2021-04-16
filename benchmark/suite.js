'use strict';
const fs = require('fs');
const path = require('path');

const Benchmark = require('benchmark');
const { JSDOM } = require('jsdom');
const { Script } = require('vm');
const cheerio = require('..');

const documentDir = path.join(__dirname, 'documents');
const jQuerySrc = fs.readFileSync(
  path.join(__dirname, '../node_modules/jquery/dist/jquery.slim.js')
);
const jQueryScript = new Script(jQuerySrc);
let filterRe = /./;
let cheerioOnly = false;

const Suites = (module.exports = function () {});

Suites.prototype.filter = function (str) {
  filterRe = new RegExp(str, 'i');
};

Suites.prototype.cheerioOnly = function () {
  cheerioOnly = true;
};

Suites.prototype.add = function (name, fileName, options) {
  if (!filterRe.test(name)) {
    return;
  }
  const markup = fs.readFileSync(path.join(documentDir, fileName), 'utf8');
  const suite = new Benchmark.Suite(name);

  suite.on('start', () => {
    console.log(`Test: ${name} (file: ${fileName})`);
  });
  suite.on('cycle', (event) => {
    if (event.target.error) {
      return;
    }
    console.log(`\t${String(event.target)}`);
  });
  suite.on('error', (event) => {
    console.log(`*** Error in ${event.target.name}: ***`);
    console.log(`\t${event.target.error}`);
    console.log('*** Test invalidated. ***');
  });
  suite.on('complete', function (event) {
    if (event.target.error) {
      console.log();
      return;
    }
    console.log(`\tFastest: ${this.filter('fastest')[0].name}\n`);
  });

  this._benchCheerio(suite, markup, options);
  if (!cheerioOnly) {
    this._benchJsDom(suite, markup, options);
  } else {
    suite.run();
  }
};

Suites.prototype._benchJsDom = function (suite, markup, options) {
  const testFn = options.test;

  const dom = new JSDOM(markup, { runScripts: 'outside-only' });

  jQueryScript.runInContext(dom.getInternalVMContext());

  const setupData = options.setup && options.setup.call(null, dom.window.$);

  suite.add('jsdom', () => {
    testFn(dom.window.$, setupData);
  });
  suite.run();
};

Suites.prototype._benchCheerio = function (suite, markup, options) {
  const $ = cheerio.load(markup);
  const testFn = options.test;
  const setupData = options.setup && options.setup.call(null, $);

  suite.add('cheerio', () => {
    testFn($, setupData);
  });
};
