var expect = require('expect.js'),
  cheerio = require('../..'),
  forms = require('../fixtures').forms;

describe('$(...)', function() {

  var $;

  beforeEach(function() {
    $ = cheerio.load(forms);
  });

  describe('.serializeArray', function() {

    it('() : should get form controls', function() {
      expect($('form#simple').serializeArray()).to.eql([
        {
          name: 'fruit',
          value: 'Apple'
        }
      ]);
    });

    it('() : should get nested form controls', function() {
      expect($('form#nested').serializeArray()).to.have.length(2);
      var data = $('form#nested').serializeArray();
      data.sort(function (a, b) {
        return a.value - b.value;
      });
      expect(data).to.eql([
        {
          name: 'fruit',
          value: 'Apple'
        },
        {
          name: 'vegetable',
          value: 'Carrot'
        }
      ]);
    });

    it('() : should not get disabled form controls', function() {
      expect($('form#disabled').serializeArray()).to.eql([]);
    });

    it('() : should not get form controls with the wrong type', function() {
      expect($('form#submit').serializeArray()).to.eql([
        {
          name: 'fruit',
          value: 'Apple'
        }
      ]);
    });

    it('() : should get selected options', function() {
      expect($('form#select').serializeArray()).to.eql([
        {
          name: 'fruit',
          value: 'Orange'
        }
      ]);
    });

    it('() : should not get unnamed form controls', function() {
      expect($('form#unnamed').serializeArray()).to.eql([
        {
          name: 'fruit',
          value: 'Apple'
        }
      ]);
    });

    it('() : should get multiple selected options', function() {
      expect($('form#multiple').serializeArray()).to.have.length(2);
      var data = $('form#multiple').serializeArray();
      data.sort(function (a, b) {
        return a.value - b.value;
      });
      expect(data).to.eql([
        {
          name: 'fruit',
          value: 'Apple'
        },
        {
          name: 'fruit',
          value: 'Orange'
        }
      ]);
    });

    it('() : should get individually selected elements', function() {
      var data = $('form#nested input').serializeArray();
      data.sort(function (a, b) {
        return a.value - b.value;
      });
      expect(data).to.eql([
        {
          name: 'fruit',
          value: 'Apple'
        },
        {
          name: 'vegetable',
          value: 'Carrot'
        }
      ]);

    });

    it('() : should standardize line breaks', function() {
      expect($('form#textarea').serializeArray()).to.eql([
        {
          name: 'fruits',
          value: 'Apple\r\nOrange'
        }
      ]);
    });

  });

});
