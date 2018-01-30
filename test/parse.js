const expect = require('expect.js')
const parse = require('../lib/parse')
const defaultOpts = require('..').prototype.options

// Tags
const basic = '<html></html>'
const siblings = '<h2></h2><p></p>'

// Single Tags
const single = '<br/>'
const singleWrong = '<br>'

// Children
const children = '<html><br/></html>'
const li = '<li class="durian">Durian</li>'

// Attributes
const attributes = '<img src="hello.png" alt="man waving">'
const noValueAttribute = '<textarea disabled></textarea>'

// Comments
const comment = '<!-- sexy -->'
const conditional = '<!--[if IE 8]><html class="no-js ie8" lang="en"><![endif]-->'

// Text
const text = 'lorem ipsum'

// Script
const script = '<script type="text/javascript">alert("hi world!");</script>'
const scriptEmpty = '<script></script>'

// Style
const style = '<style type="text/css"> h2 { color:blue; } </style>'
const styleEmpty = '<style></style>'

// Directives
const directive = '<!doctype html>'

describe('parse', () => {
  describe('.eval', () => {
    it(`should parse basic empty tags: ${basic}`, () => {
      const tag = parse.evaluate(basic, defaultOpts)[0]
      expect(tag.type).to.equal('tag')
      expect(tag.tagName).to.equal('html')
      expect(tag.childNodes).to.be.empty()
    })

    it(`should handle sibling tags: ${siblings}`, () => {
      const dom = parse.evaluate(siblings, defaultOpts)
      const h2 = dom[0]
      const p = dom[1]

      expect(dom).to.have.length(2)
      expect(h2.tagName).to.equal('h2')
      expect(p.tagName).to.equal('p')
    })

    it(`should handle single tags: ${single}`, () => {
      const tag = parse.evaluate(single, defaultOpts)[0]
      expect(tag.type).to.equal('tag')
      expect(tag.tagName).to.equal('br')
      expect(tag.childNodes).to.be.empty()
    })

    it(`should handle malformatted single tags: ${singleWrong}`, () => {
      const tag = parse.evaluate(singleWrong, defaultOpts)[0]
      expect(tag.type).to.equal('tag')
      expect(tag.tagName).to.equal('br')
      expect(tag.childNodes).to.be.empty()
    })

    it(`should handle tags with children: ${children}`, () => {
      const tag = parse.evaluate(children, defaultOpts)[0]
      expect(tag.type).to.equal('tag')
      expect(tag.tagName).to.equal('html')
      expect(tag.childNodes).to.be.ok()
      expect(tag.childNodes).to.have.length(1)
    })

    it(`should handle tags with children: ${li}`, () => {
      const tag = parse.evaluate(li, defaultOpts)[0]
      expect(tag.childNodes).to.have.length(1)
      expect(tag.childNodes[0].data).to.equal('Durian')
    })

    it(`should handle tags with attributes: ${attributes}`, () => {
      const attrs = parse.evaluate(attributes, defaultOpts)[0].attribs
      expect(attrs).to.be.ok()
      expect(attrs.src).to.equal('hello.png')
      expect(attrs.alt).to.equal('man waving')
    })

    it(`should handle value-less attributes: ${noValueAttribute}`, () => {
      const attrs = parse.evaluate(noValueAttribute, defaultOpts)[0].attribs
      expect(attrs).to.be.ok()
      expect(attrs.disabled).to.equal('')
    })

    it(`should handle comments: ${comment}`, () => {
      const elem = parse.evaluate(comment, defaultOpts)[0]
      expect(elem.type).to.equal('comment')
      expect(elem.data).to.equal(' sexy ')
    })

    it(`should handle conditional comments: ${conditional}`, () => {
      const elem = parse.evaluate(conditional, defaultOpts)[0]
      expect(elem.type).to.equal('comment')
      expect(elem.data).to.equal(conditional.replace('<!--', '').replace('-->', ''))
    })

    it(`should handle text: ${text}`, () => {
      const text_ = parse.evaluate(text, defaultOpts)[0]
      expect(text_.type).to.equal('text')
      expect(text_.data).to.equal('lorem ipsum')
    })

    it(`should handle script tags: ${script}`, () => {
      const script_ = parse.evaluate(script, defaultOpts)[0]
      expect(script_.type).to.equal('script')
      expect(script_.tagName).to.equal('script')
      expect(script_.attribs.type).to.equal('text/javascript')
      expect(script_.childNodes).to.have.length(1)
      expect(script_.childNodes[0].type).to.equal('text')
      expect(script_.childNodes[0].data).to.equal('alert("hi world!");')
    })

    it(`should handle style tags: ${style}`, () => {
      const style_ = parse.evaluate(style, defaultOpts)[0]
      expect(style_.type).to.equal('style')
      expect(style_.tagName).to.equal('style')
      expect(style_.attribs.type).to.equal('text/css')
      expect(style_.childNodes).to.have.length(1)
      expect(style_.childNodes[0].type).to.equal('text')
      expect(style_.childNodes[0].data).to.equal(' h2 { color:blue; } ')
    })

    it(`should handle directives: ${directive}`, () => {
      const elem = parse.evaluate(directive, defaultOpts)[0]
      expect(elem.type).to.equal('directive')
      expect(elem.data).to.equal('!doctype html')
      expect(elem.tagName).to.equal('!doctype')
    })
  })

  describe('.parse', () => {
    // root test utility
    function rootTest(root) {
      expect(root.tagName).to.equal('root')

      // Should exist but be null
      expect(root.nextSibling).to.be(null)
      expect(root.previousSibling).to.be(null)
      expect(root.parentNode).to.be(null)

      const child = root.childNodes[0]
      expect(child.parentNode).to.be(null)
    }

    it(`should add root to: ${basic}`, () => {
      const root = parse(basic, defaultOpts)
      rootTest(root)
      expect(root.childNodes).to.have.length(1)
      expect(root.childNodes[0].tagName).to.equal('html')
    })

    it(`should add root to: ${siblings}`, () => {
      const root = parse(siblings, defaultOpts)
      rootTest(root)
      expect(root.childNodes).to.have.length(2)
      expect(root.childNodes[0].tagName).to.equal('h2')
      expect(root.childNodes[1].tagName).to.equal('p')
      expect(root.childNodes[1].parent).to.equal(null)
    })

    it(`should add root to: ${comment}`, () => {
      const root = parse(comment, defaultOpts)
      rootTest(root)
      expect(root.childNodes).to.have.length(1)
      expect(root.childNodes[0].type).to.equal('comment')
    })

    it(`should add root to: ${text}`, () => {
      const root = parse(text, defaultOpts)
      rootTest(root)
      expect(root.childNodes).to.have.length(1)
      expect(root.childNodes[0].type).to.equal('text')
    })

    it(`should add root to: ${scriptEmpty}`, () => {
      const root = parse(scriptEmpty, defaultOpts)
      rootTest(root)
      expect(root.childNodes).to.have.length(1)
      expect(root.childNodes[0].type).to.equal('script')
    })

    it(`should add root to: ${styleEmpty}`, () => {
      const root = parse(styleEmpty, defaultOpts)
      rootTest(root)
      expect(root.childNodes).to.have.length(1)
      expect(root.childNodes[0].type).to.equal('style')
    })

    it(`should add root to: ${directive}`, () => {
      const root = parse(directive, defaultOpts)
      rootTest(root)
      expect(root.childNodes).to.have.length(1)
      expect(root.childNodes[0].type).to.equal('directive')
    })

    it('should expose the DOM level 1 API', () => {
      const root = parse(
        '<div><a></a><span></span><p></p></div>',
        defaultOpts
      ).childNodes[0]
      const { childNodes } = root

      expect(childNodes).to.have.length(3)

      expect(root.tagName).to.be('div')
      expect(root.firstChild).to.be(childNodes[0])
      expect(root.lastChild).to.be(childNodes[2])

      expect(childNodes[0].tagName).to.be('a')
      expect(childNodes[0].previousSibling).to.be(null)
      expect(childNodes[0].nextSibling).to.be(childNodes[1])
      expect(childNodes[0].parentNode).to.be(root)
      expect(childNodes[0].childNodes).to.have.length(0)
      expect(childNodes[0].firstChild).to.be(null)
      expect(childNodes[0].lastChild).to.be(null)

      expect(childNodes[1].tagName).to.be('span')
      expect(childNodes[1].previousSibling).to.be(childNodes[0])
      expect(childNodes[1].nextSibling).to.be(childNodes[2])
      expect(childNodes[1].parentNode).to.be(root)
      expect(childNodes[1].childNodes).to.have.length(0)
      expect(childNodes[1].firstChild).to.be(null)
      expect(childNodes[1].lastChild).to.be(null)

      expect(childNodes[2].tagName).to.be('p')
      expect(childNodes[2].previousSibling).to.be(childNodes[1])
      expect(childNodes[2].nextSibling).to.be(null)
      expect(childNodes[2].parentNode).to.be(root)
      expect(childNodes[2].childNodes).to.have.length(0)
      expect(childNodes[2].firstChild).to.be(null)
      expect(childNodes[2].lastChild).to.be(null)
    })
  })
})
