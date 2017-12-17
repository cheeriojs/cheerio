const expect = require('expect.js')
const cheerio = require('../..')
const {
  drinks,
  food,
  fruits,
  text
} = require('../fixtures')

describe('$(...)', () => {
  let $

  beforeEach(() => {
    $ = cheerio.load(fruits)
  })

  describe('.find', () => {
    it('() : should find nothing', () => {
      expect($('ul').find()).to.have.length(0)
    })

    it('(single) : should find one descendant', () => {
      expect($('#fruits').find('.apple')[0].attribs['class']).to.equal('apple')
    })

    it('(many) : should find all matching descendant', () => {
      expect($('#fruits').find('li')).to.have.length(3)
    })

    it('(many) : should merge all selected elems with matching descendants', () => {
      expect($('#fruits, #food', food).find('.apple')).to.have.length(1)
    })

    it('(invalid single) : should return empty if cant find', () => {
      expect($('ul').find('blah')).to.have.length(0)
    })

    it('(invalid single) : should query descendants only', () => {
      expect($('#fruits').find('ul')).to.have.length(0)
    })

    it('should return empty if search already empty result', () => {
      expect($('#not-fruits').find('li')).to.have.length(0)
    })

    it('should lowercase selectors', () => {
      expect($('#fruits').find('LI')).to.have.length(3)
    })

    it('should query immediate descendant only', () => {
      const q = cheerio.load('<foo><bar><bar></bar><bar></bar></bar></foo>')
      expect(q('foo').find('> bar')).to.have.length(1)
    })

    it('should query case-sensitively when in xmlMode', () => {
      const q = cheerio.load('<caseSenSitive allTheWay>', {xmlMode: true})
      expect(q('caseSenSitive')).to.have.length(1)
      expect(q('[allTheWay]')).to.have.length(1)
      expect(q('casesensitive')).to.have.length(0)
      expect(q('[alltheway]')).to.have.length(0)
    })

    it('should throw a SyntaxError if given an invalid selector', () => {
      expect(() => {
        $('#fruits').find(':bah')
      }).to.throwException(err => {
        expect(err).to.be.a(SyntaxError)
      })
    })

    describe('(cheerio object) :', () => {
      it('returns only those nodes contained within the current selection', () => {
        const q = cheerio.load(food)
        const $selection = q('#fruits').find(q('li'))

        expect($selection).to.have.length(3)
        expect($selection[0]).to.be(q('.apple')[0])
        expect($selection[1]).to.be(q('.orange')[0])
        expect($selection[2]).to.be(q('.pear')[0])
      })
      it('returns only those nodes contained within any element in the current selection', () => {
        const q = cheerio.load(food)
        const $selection = q('.apple, #vegetables').find(q('li'))

        expect($selection).to.have.length(2)
        expect($selection[0]).to.be(q('.carrot')[0])
        expect($selection[1]).to.be(q('.sweetcorn')[0])
      })
    })

    describe('(node) :', () => {
      it('returns node when contained within the current selection', () => {
        const q = cheerio.load(food)
        const $selection = q('#fruits').find(q('.apple')[0])

        expect($selection).to.have.length(1)
        expect($selection[0]).to.be(q('.apple')[0])
      })
      it('returns node when contained within any element the current selection', () => {
        const q = cheerio.load(food)
        const $selection = q('#fruits, #vegetables').find(q('.carrot')[0])

        expect($selection).to.have.length(1)
        expect($selection[0]).to.be(q('.carrot')[0])
      })
      it('does not return node that is not contained within the current selection', () => {
        const q = cheerio.load(food)
        const $selection = q('#fruits').find(q('.carrot')[0])

        expect($selection).to.have.length(0)
      })
    })
  })

  describe('.children', () => {
    it('() : should get all children', () => {
      expect($('ul').children()).to.have.length(3)
    })

    it('() : should return children of all matched elements', () => {
      expect($('ul ul', food).children()).to.have.length(5)
    })

    it('(selector) : should return children matching selector', () => {
      const cls = $('ul').children('.orange')[0].attribs['class']
      expect(cls).to.equal('orange')
    })

    it('(invalid selector) : should return empty', () => {
      expect($('ul').children('.lulz')).to.have.length(0)
    })

    it('should only match immediate children, not ancestors', () => {
      expect($(food).children('li')).to.have.length(0)
    })
  })

  describe('.contents', () => {
    beforeEach(() => {
      $ = cheerio.load(text)
    })

    it('() : should get all contents', () => {
      expect($('p').contents()).to.have.length(5)
    })

    it('() : should include text nodes', () => {
      expect($('p').contents().first()[0].type).to.equal('text')
    })

    it('() : should include comment nodes', () => {
      expect($('p').contents().last()[0].type).to.equal('comment')
    })
  })

  describe('.next', () => {
    it('() : should return next element', () => {
      const cls = $('.orange').next()[0].attribs['class']
      expect(cls).to.equal('pear')
    })

    it('(no next) : should return empty for last child', () => {
      expect($('.pear').next()).to.have.length(0)
    })

    it('(next on empty object) : should return empty', () => {
      expect($('.banana').next()).to.have.length(0)
    })

    it('() : should operate over all elements in the selection', () => {
      expect($('.apple, .orange', food).next()).to.have.length(2)
    })

    describe('(selector) :', () => {
      it('should reject elements that violate the filter', () => {
        expect($('.apple').next('.non-existent')).to.have.length(0)
      })

      it('should accept elements that satisify the filter', () => {
        expect($('.apple').next('.orange')).to.have.length(1)
      })
    })
  })

  describe('.nextAll', () => {
    it('() : should return all following siblings', () => {
      const elems = $('.apple').nextAll()
      expect(elems).to.have.length(2)
      expect(elems[0].attribs['class']).to.equal('orange')
      expect(elems[1].attribs['class']).to.equal('pear')
    })

    it('(no next) : should return empty for last child', () => {
      expect($('.pear').nextAll()).to.have.length(0)
    })

    it('(nextAll on empty object) : should return empty', () => {
      expect($('.banana').nextAll()).to.have.length(0)
    })

    it('() : should operate over all elements in the selection', () => {
      expect($('.apple, .carrot', food).nextAll()).to.have.length(3)
    })

    it('() : should not contain duplicate elements', () => {
      const elems = $('.apple, .orange', food)
      expect(elems.nextAll()).to.have.length(2)
    })

    describe('(selector) :', () => {
      it('should filter according to the provided selector', () => {
        expect($('.apple').nextAll('.pear')).to.have.length(1)
      })

      it('should not consider siblings\' contents when filtering', () => {
        expect($('#fruits', food).nextAll('li')).to.have.length(0)
      })
    })
  })

  describe('.nextUntil', () => {
    it('() : should return all following siblings if no selector specified', () => {
      const elems = $('.apple', food).nextUntil()
      expect(elems).to.have.length(2)
      expect(elems[0].attribs['class']).to.equal('orange')
      expect(elems[1].attribs['class']).to.equal('pear')
    })

    it('() : should filter out non-element nodes', () => {
      const elems = $('<div><div></div><!-- comment -->text<div></div></div>')
      const div = elems.children().eq(0)
      expect(div.nextUntil()).to.have.length(1)
    })

    it('() : should operate over all elements in the selection', () => {
      const elems = $('.apple, .carrot', food)
      expect(elems.nextUntil()).to.have.length(3)
    })

    it('() : should not contain duplicate elements', () => {
      const elems = $('.apple, .orange', food)
      expect(elems.nextUntil()).to.have.length(2)
    })

    it('(selector) : should return all following siblings until selector', () => {
      const elems = $('.apple', food).nextUntil('.pear')
      expect(elems).to.have.length(1)
      expect(elems[0].attribs['class']).to.equal('orange')
    })

    it('(selector not sibling) : should return all following siblings', () => {
      const elems = $('.apple').nextUntil('#vegetables')
      expect(elems).to.have.length(2)
    })

    it('(selector, filterString) : should return all following siblings until selector, filtered by filter', () => {
      const elems = $('.beer', drinks).nextUntil('.water', '.milk')
      expect(elems).to.have.length(1)
      expect(elems[0].attribs['class']).to.equal('milk')
    })

    it('(null, filterString) : should return all following siblings until selector, filtered by filter', () => {
      const elems = $('<ul><li></li><li><p></p></li></ul>')
      const empty = elems.find('li').eq(0).nextUntil(null, 'p')
      expect(empty).to.have.length(0)
    })

    it('() : should return an empty object for last child', () => {
      expect($('.pear').nextUntil()).to.have.length(0)
    })

    it('() : should return an empty object when called on an empty object', () => {
      expect($('.banana').nextUntil()).to.have.length(0)
    })

    it('(node) : should return all following siblings until the node', () => {
      const $fruits = $('#fruits').children()
      const elems = $fruits.eq(0).nextUntil($fruits[2])
      expect(elems).to.have.length(1)
    })

    it('(cheerio object) : should return all following siblings until any member of the cheerio object', () => {
      const $drinks = $(drinks).children()
      const $until = $([$drinks[4], $drinks[3]])
      const elems = $drinks.eq(0).nextUntil($until)
      expect(elems).to.have.length(2)
    })
  })

  describe('.prev', () => {
    it('() : should return previous element', () => {
      const cls = $('.orange').prev()[0].attribs['class']
      expect(cls).to.equal('apple')
    })

    it('(no prev) : should return empty for first child', () => {
      expect($('.apple').prev()).to.have.length(0)
    })

    it('(prev on empty object) : should return empty', () => {
      expect($('.banana').prev()).to.have.length(0)
    })

    it('() : should operate over all elements in the selection', () => {
      expect($('.orange, .pear', food).prev()).to.have.length(2)
    })

    describe('(selector) :', () => {
      it('should reject elements that violate the filter', () => {
        expect($('.orange').prev('.non-existent')).to.have.length(0)
      })

      it('should accept elements that satisify the filter', () => {
        expect($('.orange').prev('.apple')).to.have.length(1)
      })
    })
  })

  describe('.prevAll', () => {
    it('() : should return all preceding siblings', () => {
      const elems = $('.pear').prevAll()
      expect(elems).to.have.length(2)
      expect(elems[0].attribs['class']).to.equal('orange')
      expect(elems[1].attribs['class']).to.equal('apple')
    })

    it('(no prev) : should return empty for first child', () => {
      expect($('.apple').prevAll()).to.have.length(0)
    })

    it('(prevAll on empty object) : should return empty', () => {
      expect($('.banana').prevAll()).to.have.length(0)
    })

    it('() : should operate over all elements in the selection', () => {
      expect($('.orange, .sweetcorn', food).prevAll()).to.have.length(2)
    })

    it('() : should not contain duplicate elements', () => {
      const elems = $('.orange, .pear', food)
      expect(elems.prevAll()).to.have.length(2)
    })

    describe('(selector) :', () => {
      it('should filter returned elements', () => {
        const elems = $('.pear').prevAll('.apple')
        expect(elems).to.have.length(1)
      })

      it('should not consider siblings\'s descendents', () => {
        const elems = $('#vegetables', food).prevAll('li')
        expect(elems).to.have.length(0)
      })
    })
  })

  describe('.prevUntil', () => {
    it('() : should return all preceding siblings if no selector specified', () => {
      const elems = $('.pear').prevUntil()
      expect(elems).to.have.length(2)
      expect(elems[0].attribs['class']).to.equal('orange')
      expect(elems[1].attribs['class']).to.equal('apple')
    })

    it('() : should filter out non-element nodes', () => {
      const elems = $('<div class="1"><div class="2"></div><!-- comment -->text<div class="3"></div></div>')
      const div = elems.children().last()
      expect(div.prevUntil()).to.have.length(1)
    })

    it('() : should operate over all elements in the selection', () => {
      const elems = $('.pear, .sweetcorn', food)
      expect(elems.prevUntil()).to.have.length(3)
    })

    it('() : should not contain duplicate elements', () => {
      const elems = $('.orange, .pear', food)
      expect(elems.prevUntil()).to.have.length(2)
    })

    it('(selector) : should return all preceding siblings until selector', () => {
      const elems = $('.pear').prevUntil('.apple')
      expect(elems).to.have.length(1)
      expect(elems[0].attribs['class']).to.equal('orange')
    })

    it('(selector not sibling) : should return all preceding siblings', () => {
      const elems = $('.sweetcorn', food).prevUntil('#fruits')
      expect(elems).to.have.length(1)
      expect(elems[0].attribs['class']).to.equal('carrot')
    })

    it('(selector, filterString) : should return all preceding siblings until selector, filtered by filter', () => {
      const elems = $('.cider', drinks).prevUntil('.juice', '.water')
      expect(elems).to.have.length(1)
      expect(elems[0].attribs['class']).to.equal('water')
    })

    it('(selector, filterString) : should return all preceding siblings until selector', () => {
      const elems = $('<ul><li><p></p></li><li></li></ul>')
      const empty = elems.find('li').eq(1).prevUntil(null, 'p')
      expect(empty).to.have.length(0)
    })

    it('() : should return an empty object for first child', () => {
      expect($('.apple').prevUntil()).to.have.length(0)
    })

    it('() : should return an empty object when called on an empty object', () => {
      expect($('.banana').prevUntil()).to.have.length(0)
    })

    it('(node) : should return all previous siblings until the node', () => {
      const $fruits = $('#fruits').children()
      const elems = $fruits.eq(2).prevUntil($fruits[0])
      expect(elems).to.have.length(1)
    })

    it('(cheerio object) : should return all previous siblings until any member of the cheerio object', () => {
      const $drinks = $(drinks).children()
      const $until = $([$drinks[0], $drinks[1]])
      const elems = $drinks.eq(4).prevUntil($until)
      expect(elems).to.have.length(2)
    })
  })

  describe('.siblings', () => {
    it('() : should get all the siblings', () => {
      expect($('.orange').siblings()).to.have.length(2)
      expect($('#fruits').siblings()).to.have.length(0)
      expect($('.apple, .carrot', food).siblings()).to.have.length(3)
    })

    it('(selector) : should get all siblings that match the selector', () => {
      expect($('.orange').siblings('.apple')).to.have.length(1)
      expect($('.orange').siblings('.peach')).to.have.length(0)
    })

    it('(selector) : should throw a SyntaxError if given an invalid selector', () => {
      expect(() => {
        $('.orange').siblings(':bah')
      }).to.throwException(err => {
        expect(err).to.be.a(SyntaxError)
      })
    })

    it('(selector) : does not consider the contents of siblings when filtering (GH-374)', () => {
      expect($('#fruits', food).siblings('li')).to.have.length(0)
    })
  })

  describe('.parents', () => {
    beforeEach(() => {
      $ = cheerio.load(food)
    })

    it('() : should get all of the parents in logical order', () => {
      let result = $('.orange').parents()
      expect(result).to.have.length(2)
      expect(result[0].attribs.id).to.be('fruits')
      expect(result[1].attribs.id).to.be('food')
      result = $('#fruits').parents()
      expect(result).to.have.length(1)
      expect(result[0].attribs.id).to.be('food')
    })

    it('(selector) : should get all of the parents that match the selector in logical order', () => {
      let result = $('.orange').parents('#fruits')
      expect(result).to.have.length(1)
      expect(result[0].attribs.id).to.be('fruits')
      result = $('.orange').parents('ul')
      expect(result).to.have.length(2)
      expect(result[0].attribs.id).to.be('fruits')
      expect(result[1].attribs.id).to.be('food')
    })

    it('() : should not break if the selector does not have any results', () => {
      const result = $('.saladbar').parents()
      expect(result).to.have.length(0)
    })

    it('() : should return an empty set for top-level elements', () => {
      const result = $('#food').parents()
      expect(result).to.have.length(0)
    })

    it('() : should return the parents of every element in the *reveresed* collection, omitting duplicates', () => {
      const $parents = $('li').parents()

      expect($parents).to.have.length(3)
      expect($parents[0]).to.be($('#vegetables')[0])
      expect($parents[1]).to.be($('#food')[0])
      expect($parents[2]).to.be($('#fruits')[0])
    })
  })

  describe('.parentsUntil', () => {
    beforeEach(() => {
      $ = cheerio.load(food)
    })

    it('() : should get all of the parents in logical order', () => {
      const result = $('.orange').parentsUntil()
      expect(result).to.have.length(2)
      expect(result[0].attribs.id).to.be('fruits')
      expect(result[1].attribs.id).to.be('food')
    })

    it('() : should get all of the parents in reversed order, omitting duplicates', () => {
      const result = $('.apple, .sweetcorn').parentsUntil()
      expect(result).to.have.length(3)
      expect(result[0].attribs.id).to.be('vegetables')
      expect(result[1].attribs.id).to.be('food')
      expect(result[2].attribs.id).to.be('fruits')
    })

    it('(selector) : should get all of the parents until selector', () => {
      let result = $('.orange').parentsUntil('#food')
      expect(result).to.have.length(1)
      expect(result[0].attribs.id).to.be('fruits')
      result = $('.orange').parentsUntil('#fruits')
      expect(result).to.have.length(0)
    })

    it('(selector not parent) : should return all parents', () => {
      const result = $('.orange').parentsUntil('.apple')
      expect(result).to.have.length(2)
      expect(result[0].attribs.id).to.be('fruits')
      expect(result[1].attribs.id).to.be('food')
    })

    it('(selector, filter) : should get all of the parents that match the filter', () => {
      const result = $('.apple, .sweetcorn').parentsUntil('.saladbar', '#vegetables')
      expect(result).to.have.length(1)
      expect(result[0].attribs.id).to.be('vegetables')
    })

    it('() : should return empty object when called on an empty object', () => {
      const result = $('.saladbar').parentsUntil()
      expect(result).to.have.length(0)
    })

    it('() : should return an empty set for top-level elements', () => {
      const result = $('#food').parentsUntil()
      expect(result).to.have.length(0)
    })

    it('(cheerio object) : should return all parents until any member of the cheerio object', () => {
      const $fruits = $('#fruits')
      const $until = $('#food')
      const result = $fruits.children().eq(1).parentsUntil($until)
      expect(result).to.have.length(1)
      expect(result[0].attribs.id).to.be('fruits')
    })
  })

  describe('.parent', () => {
    it('() : should return the parent of each matched element', () => {
      let result = $('.orange').parent()
      expect(result).to.have.length(1)
      expect(result[0].attribs.id).to.be('fruits')
      result = $('li', food).parent()
      expect(result).to.have.length(2)
      expect(result[0].attribs.id).to.be('fruits')
      expect(result[1].attribs.id).to.be('vegetables')
    })

    it('() : should return an empty object for top-level elements', () => {
      const result = $('ul').parent()
      expect(result).to.have.length(0)
    })

    it('() : should not contain duplicate elements', () => {
      const result = $('li').parent()
      expect(result).to.have.length(1)
    })

    it('(selector) : should filter the matched parent elements by the selector', () => {
      let result = $('.orange').parent()
      expect(result).to.have.length(1)
      expect(result[0].attribs.id).to.be('fruits')
      result = $('li', food).parent('#fruits')
      expect(result).to.have.length(1)
      expect(result[0].attribs.id).to.be('fruits')
    })
  })

  describe('.closest', () => {
    it('() : should return an empty array', () => {
      const result = $('.orange').closest()
      expect(result).to.have.length(0)
      expect(result).to.be.a(cheerio)
    })

    it('(selector) : should find the closest element that matches the selector, searching through its ancestors and itself', () => {
      expect($('.orange').closest('.apple')).to.have.length(0)
      let result = $('.orange', food).closest('#food')
      expect(result[0].attribs.id).to.be('food')
      result = $('.orange', food).closest('ul')
      expect(result[0].attribs.id).to.be('fruits')
      result = $('.orange', food).closest('li')
      expect(result[0].attribs['class']).to.be('orange')
    })

    it('(selector) : should find the closest element of each item, removing duplicates', () => {
      const result = $('li', food).closest('ul')
      expect(result).to.have.length(2)
    })

    it('() : should not break if the selector does not have any results', () => {
      const result = $('.saladbar', food).closest('ul')
      expect(result).to.have.length(0)
    })
  })

  describe('.each', () => {
    it('( (i, elem) -> ) : should loop selected returning fn with (i, elem)', () => {
      const items = []
      const classes = ['apple', 'orange', 'pear']

      $('li').each(function (idx, elem) {
        items[idx] = elem
        expect(this.attribs['class']).to.equal(classes[idx])
      })
      expect(items[0].attribs['class']).to.equal('apple')
      expect(items[1].attribs['class']).to.equal('orange')
      expect(items[2].attribs['class']).to.equal('pear')
    })

    it('( (i, elem) -> ) : should break iteration when the iterator function returns false', () => {
      let iterationCount = 0
      $('li').each(idx => {
        iterationCount++
        return idx < 1
      })

      expect(iterationCount).to.equal(2)
    })
  })

  describe('.map', () => {
    it('(fn) : should be invoked with the correct arguments and context', () => {
      const $fruits = $('li')
      const args = []
      const thisVals = []

      $fruits.map(function () {
        args.push(Array.prototype.slice.call(arguments))
        thisVals.push(this)
      })

      expect(args).to.eql([
        [0, $fruits[0]],
        [1, $fruits[1]],
        [2, $fruits[2]]
      ])
      expect(thisVals).to.eql([
        $fruits[0],
        $fruits[1],
        $fruits[2]
      ])
    })

    it('(fn) : should return an Cheerio object wrapping the returned items', () => {
      const $fruits = $('li')
      const $mapped = $fruits.map(i => {
        return $fruits[2 - i]
      })

      expect($mapped).to.have.length(3)
      expect($mapped[0]).to.be($fruits[2])
      expect($mapped[1]).to.be($fruits[1])
      expect($mapped[2]).to.be($fruits[0])
    })

    it('(fn) : should ignore `null` and `undefined` returned by iterator', () => {
      const $fruits = $('li')
      const retVals = [null, undefined, $fruits[1]]
      const $mapped = $fruits.map(i => {
        return retVals[i]
      })

      expect($mapped).to.have.length(1)
      expect($mapped[0]).to.be($fruits[1])
    })

    it('(fn) : should preform a shallow merge on arrays returned by iterator', () => {
      const $fruits = $('li')
      const $mapped = $fruits.map(() => {
        return [1, [3, 4]]
      })

      expect($mapped.get()).to.eql([
        1, [3, 4],
        1, [3, 4],
        1, [3, 4]
      ])
    })

    it('(fn) : should tolerate `null` and `undefined` when flattening arrays returned by iterator', () => {
      const $fruits = $('li')
      const $mapped = $fruits.map(() => {
        return [null, undefined]
      })

      expect($mapped.get()).to.eql([
        null, undefined,
        null, undefined,
        null, undefined
      ])
    })
  })

  describe('.filter', () => {
    it('(selector) : should reduce the set of matched elements to those that match the selector', () => {
      const pear = $('li').filter('.pear').text()
      expect(pear).to.be('Pear')
    })

    it('(selector) : should not consider nested elements', () => {
      const lis = $('#fruits').filter('li')
      expect(lis).to.have.length(0)
    })

    it('(selection) : should reduce the set of matched elements to those that are contained in the provided selection', () => {
      const $fruits = $('li')
      const $pear = $fruits.filter('.pear, .apple')
      expect($fruits.filter($pear)).to.have.length(2)
    })

    it('(element) : should reduce the set of matched elements to those that specified directly', () => {
      const $fruits = $('li')
      const pear = $fruits.filter('.pear')[0]
      expect($fruits.filter(pear)).to.have.length(1)
    })

    it('(fn) : should reduce the set of matched elements to those that pass the function\'s test', () => {
      const orange = $('li').filter(function (i, el) {
        expect(this).to.be(el)
        expect(el.tagName).to.be('li')
        expect(i).to.be.a('number')
        return $(this).attr('class') === 'orange'
      }).text()
      expect(orange).to.be('Orange')
    })
  })

  describe('.not', () => {
    it('(selector) : should reduce the set of matched elements to those that do not match the selector', () => {
      const $fruits = $('li')
      const $notPear = $fruits.not('.pear')

      expect($notPear).to.have.length(2)
      expect($notPear[0]).to.be($fruits[0])
      expect($notPear[1]).to.be($fruits[1])
    })

    it('(selector) : should not consider nested elements', () => {
      const lis = $('#fruits').not('li')
      expect(lis).to.have.length(1)
    })

    it('(selection) : should reduce the set of matched elements to those that are mot contained in the provided selection', () => {
      const $fruits = $('li')
      const $orange = $('.orange')
      const $notOrange = $fruits.not($orange)

      expect($notOrange).to.have.length(2)
      expect($notOrange[0]).to.be($fruits[0])
      expect($notOrange[1]).to.be($fruits[2])
    })

    it('(element) : should reduce the set of matched elements to those that specified directly', () => {
      const $fruits = $('li')
      const apple = $('.apple')[0]
      const $notApple = $fruits.not(apple)

      expect($notApple).to.have.length(2)
      expect($notApple[0]).to.be($fruits[1])
      expect($notApple[1]).to.be($fruits[2])
    })

    it('(fn) : should reduce the set of matched elements to those that do not pass the function\'s test', () => {
      const $fruits = $('li')
      const $notOrange = $fruits.not(function (i, el) {
        expect(this).to.be(el)
        expect(el.name).to.be('li')
        expect(i).to.be.a('number')
        return $(this).attr('class') === 'orange'
      })

      expect($notOrange).to.have.length(2)
      expect($notOrange[0]).to.be($fruits[0])
      expect($notOrange[1]).to.be($fruits[2])
    })
  })

  describe('.has', () => {
    beforeEach(() => {
      $ = cheerio.load(food)
    })

    it('(selector) : should reduce the set of matched elements to those with descendants that match the selector', () => {
      const $fruits = $('#fruits,#vegetables').has('.pear')
      expect($fruits).to.have.length(1)
      expect($fruits[0]).to.be($('#fruits')[0])
    })

    it('(selector) : should only consider nested elements', () => {
      const $empty = $('#fruits').has('#fruits')
      expect($empty).to.have.length(0)
    })

    it('(element) : should reduce the set of matched elements to those that are ancestors of the provided element', () => {
      const $fruits = $('#fruits,#vegetables').has($('.pear')[0])
      expect($fruits).to.have.length(1)
      expect($fruits[0]).to.be($('#fruits')[0])
    })

    it('(element) : should only consider nested elements', () => {
      const $fruits = $('#fruits')
      const fruitsEl = $fruits[0]
      const $empty = $fruits.has(fruitsEl)
      expect($empty).to.have.length(0)
    })
  })

  describe('.first', () => {
    it('() : should return the first item', () => {
      const $src = $('<span>foo</span><span>bar</span><span>baz</span>')
      const $elem = $src.first()
      expect($elem.length).to.equal(1)
      expect($elem[0].childNodes[0].data).to.equal('foo')
    })

    it('() : should return an empty object for an empty object', () => {
      const $src = $()
      const $first = $src.first()
      expect($first.length).to.equal(0)
      expect($first[0]).to.be(undefined)
    })
  })

  describe('.last', () => {
    it('() : should return the last element', () => {
      const $src = $('<span>foo</span><span>bar</span><span>baz</span>')
      const $elem = $src.last()
      expect($elem.length).to.equal(1)
      expect($elem[0].childNodes[0].data).to.equal('baz')
    })

    it('() : should return an empty object for an empty object', () => {
      const $src = $()
      const $last = $src.last()
      expect($last.length).to.equal(0)
      expect($last[0]).to.be(undefined)
    })
  })

  describe('.first & .last', () => {
    it('() : should return equivalent collections if only one element', () => {
      const $src = $('<span>bar</span>')
      const $first = $src.first()
      const $last = $src.last()
      expect($first.length).to.equal(1)
      expect($first[0].childNodes[0].data).to.equal('bar')
      expect($last.length).to.equal(1)
      expect($last[0].childNodes[0].data).to.equal('bar')
      expect($first[0]).to.equal($last[0])
    })
  })

  describe('.eq', () => {
    function getText(el) {
      if (!el.length) return ''
      return el[0].childNodes[0].data
    }

    it('(i) : should return the element at the specified index', () => {
      expect(getText($('li').eq(0))).to.equal('Apple')
      expect(getText($('li').eq(1))).to.equal('Orange')
      expect(getText($('li').eq(2))).to.equal('Pear')
      expect(getText($('li').eq(3))).to.equal('')
      expect(getText($('li').eq(-1))).to.equal('Pear')
    })
  })

  describe('.get', () => {
    it('(i) : should return the element at the specified index', () => {
      const children = $('#fruits').children()
      expect(children.get(0)).to.be(children[0])
      expect(children.get(1)).to.be(children[1])
      expect(children.get(2)).to.be(children[2])
    })

    it('(-1) : should return the element indexed from the end of the collection', () => {
      const children = $('#fruits').children()
      expect(children.get(-1)).to.be(children[2])
      expect(children.get(-2)).to.be(children[1])
      expect(children.get(-3)).to.be(children[0])
    })

    it('() : should return an array containing all of the collection', () => {
      const children = $('#fruits').children()
      const all = children.get()
      expect(Array.isArray(all)).to.be.ok()
      expect(all).to.eql([
        children[0],
        children[1],
        children[2]
      ])
    })
  })

  describe('.index', () => {
    describe('() : ', () => {
      it('returns the index of a child amongst its siblings', () => {
        expect($('.orange').index()).to.be(1)
      })
      it('returns -1 when the selection has no parent', () => {
        expect($('<div/>').index()).to.be(-1)
      })
    })

    describe('(selector) : ', () => {
      it('returns the index of the first element in the set matched by `selector`', () => {
        expect($('.apple').index('#fruits, li')).to.be(1)
      })

      it('returns -1 when the item is not present in the set matched by `selector`', () => {
        expect($('.apple').index('#fuits')).to.be(-1)
      })

      it('returns -1 when the first element in the set has no parent', () => {
        expect($('<div/>').index('*')).to.be(-1)
      })
    })

    describe('(node) : ', () => {
      it('returns the index of the given node within the current selection', () => {
        const $lis = $('li')
        expect($lis.index($lis.get(1))).to.be(1)
      })

      it('returns the index of the given node within the current selection when the current selection has no parent', () => {
        const $apple = $('.apple').remove()
        expect($apple.index($apple.get(0))).to.be(0)
      })

      it('returns -1 when the given node is not present in the current selection', () => {
        expect($('li').index($('#fruits').get(0))).to.be(-1)
      })

      it('returns -1 when the current selection is empty', () => {
        expect($('.not-fruit').index($('#fruits').get(0))).to.be(-1)
      })
    })

    describe('(selection) : ', () => {
      it('returns the index of the first node in the provided selection within the current selection', () => {
        const $lis = $('li')
        expect($lis.index($('.orange, .pear'))).to.be(1)
      })

      it('returns -1 when the given node is not present in the current selection', () => {
        expect($('li').index($('#fruits'))).to.be(-1)
      })

      it('returns -1 when the current selection is empty', () => {
        expect($('.not-fruit').index($('#fruits'))).to.be(-1)
      })
    })
  })

  describe('.slice', () => {
    function getText(el) {
      if (!el.length) return ''
      return el[0].childNodes[0].data
    }

    it('(start) : should return all elements after the given index', () => {
      const sliced = $('li').slice(1)
      expect(sliced).to.have.length(2)
      expect(getText(sliced.eq(0))).to.equal('Orange')
      expect(getText(sliced.eq(1))).to.equal('Pear')
    })

    it('(start, end) : should return all elements matching the given range', () => {
      const sliced = $('li').slice(1, 2)
      expect(sliced).to.have.length(1)
      expect(getText(sliced.eq(0))).to.equal('Orange')
    })

    it('(-start) : should return element matching the offset from the end', () => {
      const sliced = $('li').slice(-1)
      expect(sliced).to.have.length(1)
      expect(getText(sliced.eq(0))).to.equal('Pear')
    })
  })

  describe('.end() :', () => {
    let $fruits

    beforeEach(() => {
      $fruits = $('#fruits').children()
    })

    it('returns an empty object at the end of the chain', () => {
      expect($fruits.end().end().end()).to.be.ok()
      expect($fruits.end().end().end()).to.have.length(0)
    })

    it('find', () => {
      expect($fruits.find('.apple').end()).to.be($fruits)
    })

    it('filter', () => {
      expect($fruits.filter('.apple').end()).to.be($fruits)
    })

    it('map', () => {
      expect($fruits.map(function () { return this }).end()).to.be($fruits)
    })

    it('contents', () => {
      expect($fruits.contents().end()).to.be($fruits)
    })

    it('eq', () => {
      expect($fruits.eq(1).end()).to.be($fruits)
    })

    it('first', () => {
      expect($fruits.first().end()).to.be($fruits)
    })

    it('last', () => {
      expect($fruits.last().end()).to.be($fruits)
    })

    it('slice', () => {
      expect($fruits.slice(1).end()).to.be($fruits)
    })

    it('children', () => {
      expect($fruits.children().end()).to.be($fruits)
    })

    it('parent', () => {
      expect($fruits.parent().end()).to.be($fruits)
    })

    it('parents', () => {
      expect($fruits.parents().end()).to.be($fruits)
    })

    it('closest', () => {
      expect($fruits.closest('ul').end()).to.be($fruits)
    })

    it('siblings', () => {
      expect($fruits.siblings().end()).to.be($fruits)
    })

    it('next', () => {
      expect($fruits.next().end()).to.be($fruits)
    })

    it('nextAll', () => {
      expect($fruits.nextAll().end()).to.be($fruits)
    })

    it('prev', () => {
      expect($fruits.prev().end()).to.be($fruits)
    })

    it('prevAll', () => {
      expect($fruits.prevAll().end()).to.be($fruits)
    })

    it('clone', () => {
      expect($fruits.clone().end()).to.be($fruits)
    })
  })

  describe('.add', () => {
    let $fruits, $apple, $orange, $pear, $carrot, $sweetcorn

    beforeEach(() => {
      $ = cheerio.load(food)
      $fruits = $('#fruits')
      $apple = $('.apple')
      $orange = $('.orange')
      $pear = $('.pear')
      $carrot = $('.carrot')
      $sweetcorn = $('.sweetcorn')
    })

    describe('(selector', () => {
      describe(') :', () => {
        describe('matched element', () => {
          it('occurs before current selection', () => {
            const $selection = $orange.add('.apple')

            expect($selection).to.have.length(2)
            expect($selection[0]).to.be($apple[0])
            expect($selection[1]).to.be($orange[0])
          })

          it('is identical to the current selection', () => {
            const $selection = $orange.add('.orange')

            expect($selection).to.have.length(1)
            expect($selection[0]).to.be($orange[0])
          })

          it('occurs after current selection', () => {
            const $selection = $orange.add('.pear')

            expect($selection).to.have.length(2)
            expect($selection[0]).to.be($orange[0])
            expect($selection[1]).to.be($pear[0])
          })

          it('contains the current selection', () => {
            const $selection = $orange.add('#fruits')

            expect($selection).to.have.length(2)
            expect($selection[0]).to.be($fruits[0])
            expect($selection[1]).to.be($orange[0])
          })

          it('is a child of the current selection', () => {
            const $selection = $fruits.add('.orange')

            expect($selection).to.have.length(2)
            expect($selection[0]).to.be($fruits[0])
            expect($selection[1]).to.be($orange[0])
          })
        })

        describe('matched elements', () => {
          it('occur before the current selection', () => {
            const $selection = $pear.add('.apple, .orange')

            expect($selection).to.have.length(3)
            expect($selection[0]).to.be($apple[0])
            expect($selection[1]).to.be($orange[0])
            expect($selection[2]).to.be($pear[0])
          })

          it('include the current selection', () => {
            const $selection = $pear.add('#fruits li')

            expect($selection).to.have.length(3)
            expect($selection[0]).to.be($apple[0])
            expect($selection[1]).to.be($orange[0])
            expect($selection[2]).to.be($pear[0])
          })

          it('occur after the current selection', () => {
            const $selection = $apple.add('.orange, .pear')

            expect($selection).to.have.length(3)
            expect($selection[0]).to.be($apple[0])
            expect($selection[1]).to.be($orange[0])
            expect($selection[2]).to.be($pear[0])
          })

          it('occur within the current selection', () => {
            const $selection = $fruits.add('#fruits li')

            expect($selection).to.have.length(4)
            expect($selection[0]).to.be($fruits[0])
            expect($selection[1]).to.be($apple[0])
            expect($selection[2]).to.be($orange[0])
            expect($selection[3]).to.be($pear[0])
          })
        })
      })

      it(', context)', () => {
        const $selection = $fruits.add('li', '#vegetables')
        expect($selection).to.have.length(3)
        expect($selection[0]).to.be($fruits[0])
        expect($selection[1]).to.be($carrot[0])
        expect($selection[2]).to.be($sweetcorn[0])
      })
    })

    describe('(element) :', () => {
      describe('honors document order when element occurs', () => {
        it('before the current selection', () => {
          const $selection = $orange.add($apple[0])

          expect($selection).to.have.length(2)
          expect($selection[0]).to.be($apple[0])
          expect($selection[1]).to.be($orange[0])
        })

        it('after the current selection', () => {
          const $selection = $orange.add($pear[0])

          expect($selection).to.have.length(2)
          expect($selection[0]).to.be($orange[0])
          expect($selection[1]).to.be($pear[0])
        })

        it('within the current selection', () => {
          const $selection = $fruits.add($orange[0])

          expect($selection).to.have.length(2)
          expect($selection[0]).to.be($fruits[0])
          expect($selection[1]).to.be($orange[0])
        })

        it('as an ancestor of the current selection', () => {
          const $selection = $orange.add($fruits[0])

          expect($selection).to.have.length(2)
          expect($selection[0]).to.be($fruits[0])
          expect($selection[1]).to.be($orange[0])
        })
      })

      it('does not insert an element already contained within the current selection', () => {
        const $selection = $apple.add($apple[0])

        expect($selection).to.have.length(1)
        expect($selection[0]).to.be($apple[0])
      })
    })

    describe('([elements]) : elements', () => {
      it('occur before the current selection', () => {
        const $selection = $pear.add($('.apple, .orange').get())

        expect($selection).to.have.length(3)
        expect($selection[0]).to.be($apple[0])
        expect($selection[1]).to.be($orange[0])
        expect($selection[2]).to.be($pear[0])
      })

      it('include the current selection', () => {
        const $selection = $pear.add($('#fruits li').get())

        expect($selection).to.have.length(3)
        expect($selection[0]).to.be($apple[0])
        expect($selection[1]).to.be($orange[0])
        expect($selection[2]).to.be($pear[0])
      })

      it('occur after the current selection', () => {
        const $selection = $apple.add($('.orange, .pear').get())

        expect($selection).to.have.length(3)
        expect($selection[0]).to.be($apple[0])
        expect($selection[1]).to.be($orange[0])
        expect($selection[2]).to.be($pear[0])
      })

      it('occur within the current selection', () => {
        const $selection = $fruits.add($('#fruits li').get())

        expect($selection).to.have.length(4)
        expect($selection[0]).to.be($fruits[0])
        expect($selection[1]).to.be($apple[0])
        expect($selection[2]).to.be($orange[0])
        expect($selection[3]).to.be($pear[0])
      })
    })

    /**
     * Element order is undefined in this case, so it should not be asserted
     * here.
     *
     * > If the collection consists of elements from different documents or
     * > ones not in any document, the sort order is undefined.
     *
     * http://api.jquery.com/add/
     */
    it('(html) : correctly parses and adds the new elements', () => {
      const $selection = $apple.add('<li class="banana">banana</li>')

      expect($selection).to.have.length(2)
      expect($selection.is('.apple')).to.be(true)
      expect($selection.is('.banana')).to.be(true)
    })

    describe('(selection) :', () => {
      describe('element in selection', () => {
        it('occurs before current selection', () => {
          const $selection = $orange.add($('.apple'))

          expect($selection).to.have.length(2)
          expect($selection[0]).to.be($apple[0])
          expect($selection[1]).to.be($orange[0])
        })

        it('is identical to the current selection', () => {
          const $selection = $orange.add($('.orange'))

          expect($selection).to.have.length(1)
          expect($selection[0]).to.be($orange[0])
        })

        it('occurs after current selection', () => {
          const $selection = $orange.add($('.pear'))

          expect($selection).to.have.length(2)
          expect($selection[0]).to.be($orange[0])
          expect($selection[1]).to.be($pear[0])
        })

        it('contains the current selection', () => {
          const $selection = $orange.add($('#fruits'))

          expect($selection).to.have.length(2)
          expect($selection[0]).to.be($fruits[0])
          expect($selection[1]).to.be($orange[0])
        })

        it('is a child of the current selection', () => {
          const $selection = $fruits.add($('.orange'))

          expect($selection).to.have.length(2)
          expect($selection[0]).to.be($fruits[0])
          expect($selection[1]).to.be($orange[0])
        })
      })

      describe('elements in the selection', () => {
        it('occur before the current selection', () => {
          const $selection = $pear.add($('.apple, .orange'))

          expect($selection).to.have.length(3)
          expect($selection[0]).to.be($apple[0])
          expect($selection[1]).to.be($orange[0])
          expect($selection[2]).to.be($pear[0])
        })

        it('include the current selection', () => {
          const $selection = $pear.add($('#fruits li'))

          expect($selection).to.have.length(3)
          expect($selection[0]).to.be($apple[0])
          expect($selection[1]).to.be($orange[0])
          expect($selection[2]).to.be($pear[0])
        })

        it('occur after the current selection', () => {
          const $selection = $apple.add($('.orange, .pear'))

          expect($selection).to.have.length(3)
          expect($selection[0]).to.be($apple[0])
          expect($selection[1]).to.be($orange[0])
          expect($selection[2]).to.be($pear[0])
        })

        it('occur within the current selection', () => {
          const $selection = $fruits.add($('#fruits li'))

          expect($selection).to.have.length(4)
          expect($selection[0]).to.be($fruits[0])
          expect($selection[1]).to.be($apple[0])
          expect($selection[2]).to.be($orange[0])
          expect($selection[3]).to.be($pear[0])
        })
      })
    })
  })

  describe('.addBack', () => {
    describe('() : ', () => {
      it('includes siblings and self', () => {
        const $selection = $('.orange').siblings().addBack()

        expect($selection).to.have.length(3)
        expect($selection[0]).to.be($('.apple')[0])
        expect($selection[1]).to.be($('.orange')[0])
        expect($selection[2]).to.be($('.pear')[0])
      })

      it('includes children and self', () => {
        const $selection = $('#fruits').children().addBack()

        expect($selection).to.have.length(4)
        expect($selection[0]).to.be($('#fruits')[0])
        expect($selection[1]).to.be($('.apple')[0])
        expect($selection[2]).to.be($('.orange')[0])
        expect($selection[3]).to.be($('.pear')[0])
      })

      it('includes parent and self', () => {
        const $selection = $('.apple').parent().addBack()

        expect($selection).to.have.length(2)
        expect($selection[0]).to.be($('#fruits')[0])
        expect($selection[1]).to.be($('.apple')[0])
      })

      it('includes parents and self', () => {
        const q = cheerio.load(food)
        const $selection = q('.apple').parents().addBack()

        expect($selection).to.have.length(3)
        expect($selection[0]).to.be(q('#food')[0])
        expect($selection[1]).to.be(q('#fruits')[0])
        expect($selection[2]).to.be(q('.apple')[0])
      })
    })

    it('(filter) : filters the previous selection', () => {
      const $selection = $('li').eq(1).addBack('.apple')

      expect($selection).to.have.length(2)
      expect($selection[0]).to.be($('.apple')[0])
      expect($selection[1]).to.be($('.orange')[0])
    })
  })
})
