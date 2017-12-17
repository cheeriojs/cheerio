const expect = require('expect.js')
const cheerio = require('../..')

describe('$(...)', () => {
  describe('.css', () => {
    it('(prop): should return a css property value', () => {
      const el = cheerio('<li style="hai: there">')
      expect(el.css('hai')).to.equal('there')
    })

    it('([prop1, prop2]): should return the specified property values as an object', () => {
      const el = cheerio('<li style="margin: 1px; padding: 2px; color: blue;">')
      expect(el.css(['margin', 'color'])).to.eql({ margin: '1px', color: 'blue' })
    })

    it('(prop, val): should set a css property', () => {
      const el = cheerio('<li style="margin: 0;"></li><li></li>')
      el.css('color', 'red')
      expect(el.attr('style')).to.equal('margin: 0; color: red;')
      expect(el.eq(1).attr('style')).to.equal('color: red;')
    })

    it('(prop, ""): should unset a css property', () => {
      const el = cheerio('<li style="padding: 1px; margin: 0;">')
      el.css('padding', '')
      expect(el.attr('style')).to.equal('margin: 0;')
    })

    it('(prop): should not mangle embedded urls', () => {
      const el = cheerio('<li style="background-image:url(http://example.com/img.png);">')
      expect(el.css('background-image')).to.equal('url(http://example.com/img.png)')
    })

    it('(prop): should ignore blank properties', () => {
      const el = cheerio('<li style=":#ccc;color:#aaa;">')
      expect(el.css()).to.eql({color: '#aaa'})
    })

    it('(prop): should ignore blank values', () => {
      const el = cheerio('<li style="color:;position:absolute;">')
      expect(el.css()).to.eql({position: 'absolute'})
    })

    describe('(prop, function):', () => {
      beforeEach(function () {
        this.$el = cheerio('<div style="margin: 0px;"></div><div style="margin: 1px;"></div><div style="margin: 2px;">')
      })

      it('should iterate over the selection', function () {
        let count = 0
        const { $el } = this
        this.$el.css('margin', function (idx, value) {
          expect(idx).to.equal(count)
          expect(value).to.equal(`${count}px`)
          expect(this).to.equal($el[count])
          count++
        })
        expect(count).to.equal(3)
      })

      it('should set each attribute independently', function () {
        const values = ['4px', '', undefined]
        this.$el.css('margin', idx => {
          return values[idx]
        })
        expect(this.$el.eq(0).attr('style')).to.equal('margin: 4px;')
        expect(this.$el.eq(1).attr('style')).to.equal('')
        expect(this.$el.eq(2).attr('style')).to.equal('margin: 2px;')
      })
    })

    it('(obj): should set each key and val', () => {
      const el = cheerio('<li style="padding: 0;"></li><li></li>')
      el.css({ foo: 0 })
      expect(el.eq(0).attr('style')).to.equal('padding: 0; foo: 0;')
      expect(el.eq(1).attr('style')).to.equal('foo: 0;')
    })

    describe('parser', () => {
      it('should allow any whitespace between declarations', () => {
        const el = cheerio('<li style="one \t:\n 0;\n two \f\r:\v 1">')
        expect(el.css(['one', 'two'])).to.eql({ one: 0, two: 1 })
      })
    })
  })
})
