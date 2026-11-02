import { describe, expect, it } from 'vitest';
import * as cheerio from './index.js';
import * as utils from './utils.js';

describe('util functions', () => {
  it('camelCase function test', () => {
    expect(utils.camelCase('cheerio.js')).toBe('cheerioJs');
    expect(utils.camelCase('camel-case-')).toBe('camelCase');
    expect(utils.camelCase('__directory__')).toBe('_directory_');
    expect(utils.camelCase('_one-two.three')).toBe('OneTwoThree');
  });

  it('isCheerio function test', () => {
    expect(utils.isCheerio(null)).toBe(false);
    expect(utils.isCheerio(undefined)).toBe(false);
    expect(utils.isCheerio('a string')).toBe(false);
    expect(utils.isCheerio({})).toBe(false);
    // Only the exact marker counts, not any `cheerio` property.
    expect(utils.isCheerio({ cheerio: 'not-a-cheerio-object' })).toBe(false);
    expect(utils.isCheerio({ cheerio: true })).toBe(false);
    expect(utils.isCheerio({ cheerio: '[cheerio object]' })).toBe(true);
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

describe('DOM node type guards', () => {
  const $ = cheerio.load(
    '<!DOCTYPE html><html><body><p>Hello <!-- world --></p></body></html>',
  );
  const [doctype, html] = $.root()[0].children;
  const p = $('p')[0];
  const [text, comment] = p.children;
  const cdata = cheerio.load('<root><![CDATA[data]]></root>', {
    xmlMode: true,
  })('root')[0].children[0];

  it('isTag', () => {
    expect(utils.isTag(html)).toBe(true);
    expect(utils.isTag(text)).toBe(false);
  });

  it('isText', () => {
    expect(utils.isText(text)).toBe(true);
    expect(utils.isText(p)).toBe(false);
  });

  it('isComment', () => {
    expect(utils.isComment(comment)).toBe(true);
    expect(utils.isComment(text)).toBe(false);
  });

  it('isDirective', () => {
    expect(utils.isDirective(doctype)).toBe(true);
    expect(utils.isDirective(html)).toBe(false);
  });

  it('isDocument', () => {
    expect(utils.isDocument($.root()[0])).toBe(true);
    expect(utils.isDocument(html)).toBe(false);
  });

  it('isCDATA', () => {
    expect(utils.isCDATA(cdata)).toBe(true);
    expect(utils.isCDATA(text)).toBe(false);
  });

  it('hasChildren', () => {
    expect(utils.hasChildren($.root()[0])).toBe(true);
    expect(utils.hasChildren(p)).toBe(true);
    expect(utils.hasChildren(text)).toBe(false);
  });
});
