import { describe, expect, it } from 'vitest';
import * as utils from './utils.js';

describe('util functions', () => {
  it('camelCase function test', () => {
    /*
     * Only a hyphen followed by an ASCII lower-case letter is a word boundary,
     * matching how a browser derives `dataset` keys from `data-*` attributes.
     */
    expect(utils.camelCase('camel-case')).toBe('camelCase');
    expect(utils.camelCase('one-two-three')).toBe('oneTwoThree');
    expect(utils.camelCase('-foo')).toBe('Foo');
    expect(utils.camelCase('foo--bar')).toBe('foo-Bar');

    /*
     * Everything else is left alone, including dots, underscores, a trailing
     * hyphen and a hyphen before a digit.
     */
    expect(utils.camelCase('cheerio.js')).toBe('cheerio.js');
    expect(utils.camelCase('__directory__')).toBe('__directory__');
    expect(utils.camelCase('camel-case-')).toBe('camelCase-');
    expect(utils.camelCase('foo-1')).toBe('foo-1');
  });

  it('cssCase function test', () => {
    expect(utils.cssCase('camelCase')).toBe('camel-case');
    expect(utils.cssCase('jQuery')).toBe('j-query');
    expect(utils.cssCase('neverSayNever')).toBe('never-say-never');
    expect(utils.cssCase('CSSCase')).toBe('-c-s-s-case');
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
