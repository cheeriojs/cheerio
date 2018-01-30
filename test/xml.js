const expect = require('expect.js')
const cheerio = require('..')

function xml(str, opts) {
  const options = Object.assign({
    xmlMode: true
  }, opts)
  const dom = cheerio.load(str, options)

  return dom.xml()
}

function dom(str, options) {
  const $ = cheerio.load('', options)
  return $(str).html()
}

describe('render', () => {
  describe('(xml)', () => {
    it('should render <media:thumbnail /> tags correctly', () => {
      const str = '<media:thumbnail url="http://www.foo.com/keyframe.jpg" width="75" height="50" time="12:05:01.123" />'
      expect(xml(str)).to.equal('<media:thumbnail url="http://www.foo.com/keyframe.jpg" width="75" height="50" time="12:05:01.123"/>')
    })

    it('should render <link /> tags (RSS) correctly', () => {
      const str = '<link>http://www.github.com/</link>'
      expect(xml(str)).to.equal('<link>http://www.github.com/</link>')
    })

    it('should escape entities', () => {
      const str = '<tag attr="foo &amp; bar"/>'
      expect(xml(str)).to.equal(str)
    })
  })

  describe('(dom)', () => {
    it('should keep camelCase for new nodes', () => {
      const str = '<g><someElem someAttribute="something">hello</someElem></g>'
      expect(dom(str, {xmlMode: false})).to.equal('<someelem someattribute="something">hello</someelem>')
    })

    it('should keep camelCase for new nodes', () => {
      const str = '<g><someElem someAttribute="something">hello</someElem></g>'
      expect(dom(str, {xmlMode: true})).to.equal('<someElem someAttribute="something">hello</someElem>')
    })

    it('should maintain the parsing options of distinct contexts independently', () => {
      const str = '<g><someElem someAttribute="something">hello</someElem></g>'
      const $x = cheerio.load('', { xmlMode: false })

      expect($x(str).html()).to.equal('<someelem someattribute="something">hello</someelem>')
    })
  })
})
