const expect = require('expect.js')
const htmlparser2 = require('htmlparser2')
const {
  fruits,
  food
} = require('./fixtures')
const $ = require('../')

const script = '<script src="script.js" type="text/javascript"></script>'
const multiclass = '<p><a class="btn primary" href="#">Save</a></p>'

describe('cheerio', () => {
  it('should get the version', () => {
    expect(/\d+\.\d+\.\d+/.test($.version)).to.be.ok()
  })

  it('$(null) should return be empty', () => {
    expect($(null)).to.be.empty()
  })

  it('$(undefined) should be empty', () => {
    expect($(undefined)).to.be.empty()
  })

  it('$(null) should be empty', () => {
    expect($('')).to.be.empty()
  })

  it('$(selector) with no context or root should be empty', () => {
    expect($('.h2')).to.be.empty()
    expect($('#fruits')).to.be.empty()
  })

  it('$(node) : should override previously-loaded nodes', () => {
    const C = $.load('<div><span></span></div>')
    const spanNode = C('span')[0]
    const $span = C(spanNode)
    expect($span[0]).to.equal(spanNode)
  })

  it('should be able to create html without a root or context', () => {
    const $h2 = $('<h2>')
    expect($h2).to.not.be.empty()
    expect($h2).to.have.length(1)
    expect($h2[0].tagName).to.equal('h2')
  })

  it('should be able to create complicated html', () => {
    const $script = $(script)
    expect($script).to.not.be.empty()
    expect($script).to.have.length(1)
    expect($script[0].attribs.src).to.equal('script.js')
    expect($script[0].attribs.type).to.equal('text/javascript')
    expect($script[0].childNodes).to.be.empty()
  })

  const testAppleSelect = function ($apples) {
    expect($apples).to.have.length(1)

    const $apple = $apples[0]
    expect($apple.parentNode.tagName).to.equal('ul')
    expect($apple.prev).to.be(null)
    expect($apple.next.attribs['class']).to.equal('orange')
    expect($apple.childNodes).to.have.length(1)
    expect($apple.childNodes[0].data).to.equal('Apple')
  }

  it('should be able to select .apple with only a context', () => {
    const $apple = $('.apple', fruits)
    testAppleSelect($apple)
  })

  it('should be able to select .apple with a node as context', () => {
    const $apple = $('.apple', $(fruits)[0])
    testAppleSelect($apple)
  })

  it('should be able to select .apple with only a root', () => {
    const $apple = $('.apple', null, fruits)
    testAppleSelect($apple)
  })

  it('should be able to select an id', () => {
    const $fruits = $('#fruits', null, fruits)
    expect($fruits).to.have.length(1)
    expect($fruits[0].attribs.id).to.equal('fruits')
  })

  it('should be able to select a tag', () => {
    const $ul = $('ul', fruits)
    expect($ul).to.have.length(1)
    expect($ul[0].tagName).to.equal('ul')
  })

  it('should accept a node reference as a context', () => {
    const $elems = $('<div><span></span></div>')
    expect($('span', $elems[0])).to.have.length(1)
  })

  it('should accept an array of node references as a context', () => {
    const $elems = $('<div><span></span></div>')
    expect($('span', $elems.toArray())).to.have.length(1)
  })

  it('should select only elements inside given context (Issue #193)', () => {
    const q = $.load(food)
    const $fruits = q('#fruits')
    const fruitElements = q('li', $fruits)

    expect(fruitElements).to.have.length(3)
  })

  it('should be able to select multiple tags', () => {
    const $fruits = $('li', null, fruits)
    expect($fruits).to.have.length(3)
    const classes = ['apple', 'orange', 'pear']
    $fruits.each((idx, $fruit) => {
      expect($fruit.attribs['class']).to.equal(classes[idx])
    })
  })

  it('should be able to do: $("#fruits .apple")', () => {
    const $apple = $('#fruits .apple', fruits)
    testAppleSelect($apple)
  })

  it('should be able to do: $("li.apple")', () => {
    const $apple = $('li.apple', fruits)
    testAppleSelect($apple)
  })

  it('should be able to select by attributes', () => {
    const $apple = $('li[class=apple]', fruits)
    testAppleSelect($apple)
  })

  it('should be able to select multiple classes: $(".btn.primary")', () => {
    const $a = $('.btn.primary', multiclass)
    expect($a).to.have.length(1)
    expect($a[0].childNodes[0].data).to.equal('Save')
  })

  it('should not create a top-level node', () => {
    const $elem = $('* div', '<div>')
    expect($elem).to.have.length(0)
  })

  it('should be able to select multiple elements: $(".apple, #fruits")', () => {
    const $elems = $('.apple, #fruits', fruits)
    expect($elems).to.have.length(2)

    // TODO: Make it work without lodash.
    // const $apple = Object.keys($elems).filter(k => {
    //   const elem = $elems[k]
    //   return elem.attribs['class'] === 'apple'
    // })
    // const $fruits = $elems.filter(elem => {
    //   return elem.attribs.id === 'fruits'
    // })
    // testAppleSelect($apple)
    // expect($fruits[0].attribs.id).to.equal('fruits')
  })

  it('should be able to select immediate children: $("#fruits > .pear")', () => {
    const $food = $(food)
    $('.pear', $food).append('<li class="pear">Another Pear!</li>')
    expect($('#fruits .pear', $food)).to.have.length(2)
    const $elem = $('#fruits > .pear', $food)
    expect($elem).to.have.length(1)
    expect($elem.attr('class')).to.equal('pear')
  })

  it('should be able to select immediate children: $(".apple + .pear")', () => {
    let $elem = $('.apple + li', fruits)
    expect($elem).to.have.length(1)
    $elem = $('.apple + .pear', fruits)
    expect($elem).to.have.length(0)
    $elem = $('.apple + .orange', fruits)
    expect($elem).to.have.length(1)
    expect($elem.attr('class')).to.equal('orange')
  })

  it('should be able to select immediate children: $(".apple ~ .pear")', () => {
    let $elem = $('.apple ~ li', fruits)
    expect($elem).to.have.length(2)
    $elem = $('.apple ~ .pear', fruits)
    expect($elem.attr('class')).to.equal('pear')
  })

  it('should handle wildcards on attributes: $("li[class*=r]")', () => {
    const $elem = $('li[class*=r]', fruits)
    expect($elem).to.have.length(2)
    expect($elem.eq(0).attr('class')).to.equal('orange')
    expect($elem.eq(1).attr('class')).to.equal('pear')
  })

  it('should handle beginning of attr selectors: $("li[class^=o]")', () => {
    const $elem = $('li[class^=o]', fruits)
    expect($elem).to.have.length(1)
    expect($elem.eq(0).attr('class')).to.equal('orange')
  })

  it('should handle beginning of attr selectors: $("li[class$=e]")', () => {
    const $elem = $('li[class$=e]', fruits)
    expect($elem).to.have.length(2)
    expect($elem.eq(0).attr('class')).to.equal('apple')
    expect($elem.eq(1).attr('class')).to.equal('orange')
  })

  it('should gracefully degrade on complex, unmatched queries', () => {
    const $elem = $('Eastern States Cup #8-fin&nbsp;<br>Downhill&nbsp;')
    expect($elem).to.have.length(0) // []
  })

  it('(extended Array) should not interfere with prototype methods (issue #119)', () => {
    const extended = []
    extended.find = extended.children = extended.each = function () {}
    const $empty = $(extended)

    expect($empty.find).to.be($.prototype.find)
    expect($empty.children).to.be($.prototype.children)
    expect($empty.each).to.be($.prototype.each)
  })

  it('should set html(number) as a string', () => {
    const $elem = $('<div>')
    $elem.html(123)
    expect(typeof $elem.text()).to.equal('string')
  })

  it('should set text(number) as a string', () => {
    const $elem = $('<div>')
    $elem.text(123)
    expect(typeof $elem.text()).to.equal('string')
  })

  describe('.merge', () => {
    let arr1, arr2

    beforeEach(() => {
      arr1 = [1, 2, 3]
      arr2 = [4, 5, 6]
    })

    it('should be a function', () => {
      expect(typeof $.merge).to.equal('function')
    })

    it('(arraylike, arraylike) : should return an array', () => {
      const ret = $.merge(arr1, arr2)
      expect(typeof ret).to.equal('object')
      expect(ret instanceof Array).to.be.ok()
    })

    it('(arraylike, arraylike) : should modify the first array', () => {
      $.merge(arr1, arr2)
      expect(arr1).to.have.length(6)
    })

    it('(arraylike, arraylike) : should not modify the second array', () => {
      $.merge(arr1, arr2)
      expect(arr2).to.have.length(3)
    })

    it('(arraylike, arraylike) : should handle objects that arent arrays, but are arraylike', () => {
      arr1 = {}
      arr2 = {}
      arr1.length = 3
      arr1[0] = 'a'
      arr1[1] = 'b'
      arr1[2] = 'c'
      arr2.length = 3
      arr2[0] = 'd'
      arr2[1] = 'e'
      arr2[2] = 'f'
      $.merge(arr1, arr2)
      expect(arr1).to.have.length(6)
      expect(arr1[3]).to.equal('d')
      expect(arr1[4]).to.equal('e')
      expect(arr1[5]).to.equal('f')
      expect(arr2).to.have.length(3)
    })

    it('(?, ?) : should gracefully reject invalid inputs', () => {
      let ret = $.merge([4], 3)
      expect(ret).to.not.be.ok()
      ret = $.merge({}, {})
      expect(ret).to.not.be.ok()
      ret = $.merge([], {})
      expect(ret).to.not.be.ok()
      ret = $.merge({}, [])
      expect(ret).to.not.be.ok()
      let fakeArray1 = {length: 3}
      fakeArray1[0] = 'a'
      fakeArray1[1] = 'b'
      fakeArray1[3] = 'd'
      ret = $.merge(fakeArray1, [])
      expect(ret).to.not.be.ok()
      ret = $.merge([], fakeArray1)
      expect(ret).to.not.be.ok()
      fakeArray1 = {}
      fakeArray1.length = '7'
      ret = $.merge(fakeArray1, [])
      expect(ret).to.not.be.ok()
      fakeArray1.length = -1
      ret = $.merge(fakeArray1, [])
      expect(ret).to.not.be.ok()
    })

    it('(?, ?) : should no-op on invalid inputs', () => {
      const fakeArray1 = {length: 3}
      fakeArray1[0] = 'a'
      fakeArray1[1] = 'b'
      fakeArray1[3] = 'd'

      $.merge(fakeArray1, [])
      expect(fakeArray1).to.have.length(3)
      expect(fakeArray1[0] = 'a')
      expect(fakeArray1[1] = 'b')
      expect(fakeArray1[3] = 'd')

      $.merge([], fakeArray1)
      expect(fakeArray1).to.have.length(3)
      expect(fakeArray1[0] = 'a')
      expect(fakeArray1[1] = 'b')
      expect(fakeArray1[3] = 'd')
    })
  })

  describe('.load', () => {
    it('should generate selections as proper instances', () => {
      const q = $.load(fruits)
      expect(q('.apple')).to.be.a(q)
    })

    it('should be able to filter down using the context', () => {
      const q = $.load(fruits)
      const apple = q('.apple', 'ul')
      const lis = q('li', 'ul')

      expect(apple).to.have.length(1)
      expect(lis).to.have.length(3)
    })

    it('should allow loading a pre-parsed DOM', () => {
      const dom = htmlparser2.parseDOM(food)
      const q = $.load(dom)

      expect(q('ul')).to.have.length(3)
    })

    it('should render xml in html() when options.xmlMode = true', () => {
      const str = '<MixedCaseTag UPPERCASEATTRIBUTE=""></MixedCaseTag>'
      const expected = '<MixedCaseTag UPPERCASEATTRIBUTE=""/>'
      const dom = $.load(str, {xmlMode: true})

      expect(dom('MixedCaseTag').get(0).tagName).to.equal('MixedCaseTag')
      expect(dom.html()).to.be(expected)
    })

    it('should render xml in html() when options.xmlMode = true passed to html()', () => {
      const str = '<MixedCaseTag UPPERCASEATTRIBUTE=""></MixedCaseTag>'
      // Since parsing done without xmlMode flag, all tags converted to
      // lowercase
      const expectedXml = '<mixedcasetag uppercaseattribute=""/>'
      const expectedNoXml = '<mixedcasetag uppercaseattribute=""></mixedcasetag>'
      const dom = $.load(str)

      expect(dom('MixedCaseTag').get(0).tagName).to.equal('mixedcasetag')
      expect(dom.html()).to.be(expectedNoXml)
      expect(dom.html({xmlMode: true})).to.be(expectedXml)
    })

    it('should respect options on the element level', () => {
      const str = '<!doctype html><html><head><title>Some test</title></head><body><footer><p>Copyright &copy; 2003-2014</p></footer></body></html>'
      const expectedHtml = '<p>Copyright &copy; 2003-2014</p>'
      const expectedXml = '<p>Copyright &#xA9; 2003-2014</p>'
      const domNotEncoded = $.load(str, {decodeEntities: false})
      const domEncoded = $.load(str)

      expect(domNotEncoded('footer').html()).to.be(expectedHtml)
      // TODO: Make it more html friendly, maybe with custom encode tables
      expect(domEncoded('footer').html()).to.be(expectedXml)
    })

    it('should return a fully-qualified Function', () => {
      const $c = $.load('<div>')
      expect($c).to.be.a(Function)
    })

    describe('prototype extensions', () => {
      it('should honor extensions defined on `prototype` property', () => {
        const $c = $.load('<div>')
        $c.prototype.myPlugin = function (...args) {
          return {
            context: this,
            args
          }
        }

        const $div = $c('div')
        expect($div.myPlugin).to.be.a('function')
        expect($div.myPlugin().context).to.be($div)
        expect(Array.prototype.slice.call($div.myPlugin(1, 2, 3).args))
          .to.eql([1, 2, 3])
      })

      it('should honor extensions defined on `fn` property', () => {
        const $c = $.load('<div>')
        $c.fn.myPlugin = function (...args) {
          return {
            context: this,
            args
          }
        }

        const $div = $c('div')
        expect($div.myPlugin).to.be.a('function')
        expect($div.myPlugin().context).to.be($div)
        expect(Array.prototype.slice.call($div.myPlugin(1, 2, 3).args))
          .to.eql([1, 2, 3])
      })

      it('should isolate extensions between loaded functions', () => {
        const $a = $.load('<div>')
        const $b = $.load('<div>')

        $a.prototype.foo = function () {}

        expect($b('div').foo).to.be(undefined)
      })
    })
  })
})
