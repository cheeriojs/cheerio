import fs from 'fs';
import path from 'path';

import { Suite, Event } from 'benchmark';
// @ts-expect-error `jsdom` types currently collide with `parse5` types.
import { JSDOM } from 'jsdom';
import { Script } from 'vm';
import cheerio from '../lib/index.js';

const documentDir = path.join(__dirname, 'documents');
const jQuerySrc = fs.readFileSync(
  path.join(__dirname, '../node_modules/jquery/dist/jquery.slim.js'),
  'utf-8'
);
const jQueryScript = new Script(jQuerySrc);
let filterRe = /./;
let cheerioOnly = false;

interface SuiteOptions<T> {
  test($: typeof cheerio, data: T): void;
  setup($: typeof cheerio): T;
}

export default class Suites {
  filter(str: string): void {
    filterRe = new RegExp(str, 'i');
  }

  cheerioOnly(): void {
    cheerioOnly = true;
  }

  add<T>(name: string, fileName: string, options: SuiteOptions<T>): void {
    if (!filterRe.test(name)) {
      return;
    }
    const markup = fs.readFileSync(path.join(documentDir, fileName), 'utf8');
    const suite = new Suite(name);

    suite.on('start', () => {
      console.log(`Test: ${name} (file: ${fileName})`);
    });
    suite.on('cycle', (event: Event) => {
      if ((event.target as any).error) {
        return;
      }
      console.log(`\t${String(event.target)}`);
    });
    suite.on('error', (event: Event) => {
      console.log(`*** Error in ${event.target.name}: ***`);
      console.log(`\t${(event.target as any).error}`);
      console.log('*** Test invalidated. ***');
    });
    suite.on('complete', function (this: Suite, event: Event) {
      if ((event.target as any).error) {
        console.log();
        return;
      }
      console.log(`\tFastest: ${(this.filter('fastest') as any)[0].name}\n`);
    });

    this._benchCheerio(suite, markup, options);
    if (!cheerioOnly) {
      this._benchJsDom(suite, markup, options);
    } else {
      suite.run();
    }
  }

  _benchJsDom<T>(suite: Suite, markup: string, options: SuiteOptions<T>): void {
    const testFn = options.test;

    const dom = new JSDOM(markup, { runScripts: 'outside-only' });

    jQueryScript.runInContext(dom.getInternalVMContext());

    const setupData: T = options.setup(dom.window.$);

    suite.add('jsdom', () => {
      testFn(dom.window.$, setupData);
    });
    suite.run();
  }

  _benchCheerio<T>(
    suite: Suite,
    markup: string,
    options: SuiteOptions<T>
  ): void {
    const $ = cheerio.load(markup);
    const testFn = options.test;
    const setupData: T = options.setup($);

    suite.add('cheerio', () => {
      testFn($, setupData);
    });
  }
}
