import cheerio, { type Cheerio } from './index.js';
import * as utils from './utils.js';
import type { Element } from 'domhandler';

describe('util functions', () => {
  it('camelCase function test', () => {
    expect(utils.camelCase('cheerio.js')).toBe('cheerioJs');
    expect(utils.camelCase('camel-case-')).toBe('camelCase');
    expect(utils.camelCase('__directory__')).toBe('_directory_');
    expect(utils.camelCase('_one-two.three')).toBe('OneTwoThree');
  });

  it('cssCase function test', () => {
    expect(utils.cssCase('camelCase')).toBe('camel-case');
    expect(utils.cssCase('jQuery')).toBe('j-query');
    expect(utils.cssCase('neverSayNever')).toBe('never-say-never');
    expect(utils.cssCase('CSSCase')).toBe('-c-s-s-case');
  });

  it('cloneDom : should be able clone single Elements', () => {
    const main = cheerio('<p>Cheerio</p>') as Cheerio<Element>;
    const result: Element[] = [];
    utils.domEach<Element>(main, (el) => {
      result.push(...utils.cloneDom(el));
    });
    expect(result).toHaveLength(1);
    expect(result[0]).not.toBe(main[0]);
    expect(main[0].children.length).toBe(result[0].children.length);
    expect(cheerio(result).text()).toBe(main.text());
  });

  it('isHtml function test', () => {
    expect(utils.isHtml('<html>')).toBe(true);
    expect(utils.isHtml('\n<html>\n')).toBe(true);
    expect(utils.isHtml('#main')).toBe(false);
    expect(utils.isHtml('\n<p>foo<p>bar\n')).toBe(true);
    expect(utils.isHtml('dog<p>fox<p>cat')).toBe(true);
    expect(utils.isHtml('<p>fox<p>cat')).toBe(true);
    expect(utils.isHtml('\n<p>fox<p>cat\n')).toBe(true);
    expect(utils.isHtml('#<p>fox<p>cat#')).toBe(true);
    expect(utils.isHtml('<!-- comment -->')).toBe(true);
    expect(utils.isHtml('<!doctype html>')).toBe(true);
    expect(utils.isHtml('<123>')).toBe(false);
  });
});
