const expect = require('expect.js')
const cheerio = require('../..')
const { forms } = require('../fixtures')

describe('$(...)', () => {
  let $

  beforeEach(() => {
    $ = cheerio.load(forms)
  })

  describe('.serializeArray', () => {
    it('() : should get form controls', () => {
      expect($('form#simple').serializeArray()).to.eql([{
        name: 'fruit',
        value: 'Apple'
      }])
    })

    it('() : should get nested form controls', () => {
      expect($('form#nested').serializeArray()).to.have.length(2)
      const data = $('form#nested').serializeArray()
      data.sort((a, b) => {
        return a.value - b.value
      })
      expect(data).to.eql([{
        name: 'fruit',
        value: 'Apple'
      }, {
        name: 'vegetable',
        value: 'Carrot'
      }])
    })

    it('() : should not get disabled form controls', () => {
      expect($('form#disabled').serializeArray()).to.eql([])
    })

    it('() : should not get form controls with the wrong type', () => {
      expect($('form#submit').serializeArray()).to.eql([{
        name: 'fruit',
        value: 'Apple'
      }])
    })

    it('() : should get selected options', () => {
      expect($('form#select').serializeArray()).to.eql([{
        name: 'fruit',
        value: 'Orange'
      }])
    })

    it('() : should not get unnamed form controls', () => {
      expect($('form#unnamed').serializeArray()).to.eql([{
        name: 'fruit',
        value: 'Apple'
      }])
    })

    it('() : should get multiple selected options', () => {
      expect($('form#multiple').serializeArray()).to.have.length(2)
      const data = $('form#multiple').serializeArray()
      data.sort((a, b) => {
        return a.value - b.value
      })
      expect(data).to.eql([{
        name: 'fruit',
        value: 'Apple'
      }, {
        name: 'fruit',
        value: 'Orange'
      }])
    })

    it('() : should get individually selected elements', () => {
      const data = $('form#nested input').serializeArray()
      data.sort((a, b) => {
        return a.value - b.value
      })
      expect(data).to.eql([{
        name: 'fruit',
        value: 'Apple'
      }, {
        name: 'vegetable',
        value: 'Carrot'
      }])
    })

    it('() : should standardize line breaks', () => {
      expect($('form#textarea').serializeArray()).to.eql([{
        name: 'fruits',
        value: 'Apple\r\nOrange'
      }])
    })

    it('() : shouldn\'t serialize the empty string', () => {
      expect($('<input value=pineapple>').serializeArray()).to.eql([])
      expect($('<input name="" value=pineapple>').serializeArray()).to.eql([])
      expect($('<input name="fruit" value=pineapple>').serializeArray()).to.eql([{
        name: 'fruit',
        value: 'pineapple'
      }])
    })

    it('() : should serialize inputs without value attributes', () => {
      expect($('<input name="fruit">').serializeArray()).to.eql([{
        name: 'fruit',
        value: ''
      }])
    })
  })

  describe('.serialize', () => {
    it('() : should get form controls', () => {
      expect($('form#simple').serialize()).to.equal('fruit=Apple')
    })

    it('() : should get nested form controls', () => {
      expect($('form#nested').serialize()).to.equal('fruit=Apple&vegetable=Carrot')
    })

    it('() : should not get disabled form controls', () => {
      expect($('form#disabled').serialize()).to.equal('')
    })

    it('() : should get multiple selected options', () => {
      expect($('form#multiple').serialize()).to.equal('fruit=Apple&fruit=Orange')
    })

    it('() : should encode spaces as +\'s', () => {
      expect($('form#spaces').serialize()).to.equal('fruit=Blood+orange')
    })
  })
})
