var cheerio = require('../..');
var forms = require('../__fixtures__/fixtures').forms;

describe('$(...)', function () {
  var $;

  beforeEach(function () {
    $ = cheerio.load(forms);
  });

  describe('.serializeArray', function () {
    it('() : should get form controls', function () {
      expect($('form#simple').serializeArray()).toStrictEqual([
        {
          name: 'fruit',
          value: 'Apple',
        },
      ]);
    });

    it('() : should get nested form controls', function () {
      expect($('form#nested').serializeArray()).toHaveLength(2);
      var data = $('form#nested').serializeArray();
      data.sort(function (a, b) {
        return a.value - b.value;
      });
      expect(data).toStrictEqual([
        {
          name: 'fruit',
          value: 'Apple',
        },
        {
          name: 'vegetable',
          value: 'Carrot',
        },
      ]);
    });

    it('() : should not get disabled form controls', function () {
      expect($('form#disabled').serializeArray()).toStrictEqual([]);
    });

    it('() : should not get form controls with the wrong type', function () {
      expect($('form#submit').serializeArray()).toStrictEqual([
        {
          name: 'fruit',
          value: 'Apple',
        },
      ]);
    });

    it('() : should get selected options', function () {
      expect($('form#select').serializeArray()).toStrictEqual([
        {
          name: 'fruit',
          value: 'Orange',
        },
      ]);
    });

    it('() : should not get unnamed form controls', function () {
      expect($('form#unnamed').serializeArray()).toStrictEqual([
        {
          name: 'fruit',
          value: 'Apple',
        },
      ]);
    });

    it('() : should get multiple selected options', function () {
      expect($('form#multiple').serializeArray()).toHaveLength(2);
      var data = $('form#multiple').serializeArray();
      data.sort(function (a, b) {
        return a.value - b.value;
      });
      expect(data).toStrictEqual([
        {
          name: 'fruit',
          value: 'Apple',
        },
        {
          name: 'fruit',
          value: 'Orange',
        },
      ]);
    });

    it('() : should get individually selected elements', function () {
      var data = $('form#nested input').serializeArray();
      data.sort(function (a, b) {
        return a.value - b.value;
      });
      expect(data).toStrictEqual([
        {
          name: 'fruit',
          value: 'Apple',
        },
        {
          name: 'vegetable',
          value: 'Carrot',
        },
      ]);
    });

    it('() : should standardize line breaks', function () {
      expect($('form#textarea').serializeArray()).toStrictEqual([
        {
          name: 'fruits',
          value: 'Apple\r\nOrange',
        },
      ]);
    });

    it("() : shouldn't serialize the empty string", function () {
      expect($('<input value=pineapple>').serializeArray()).toStrictEqual([]);
      expect(
        $('<input name="" value=pineapple>').serializeArray()
      ).toStrictEqual([]);
      expect(
        $('<input name="fruit" value=pineapple>').serializeArray()
      ).toStrictEqual([
        {
          name: 'fruit',
          value: 'pineapple',
        },
      ]);
    });

    it('() : should serialize inputs without value attributes', function () {
      expect($('<input name="fruit">').serializeArray()).toStrictEqual([
        {
          name: 'fruit',
          value: '',
        },
      ]);
    });
  });

  describe('.serialize', function () {
    it('() : should get form controls', function () {
      expect($('form#simple').serialize()).toBe('fruit=Apple');
    });

    it('() : should get nested form controls', function () {
      expect($('form#nested').serialize()).toBe('fruit=Apple&vegetable=Carrot');
    });

    it('() : should not get disabled form controls', function () {
      expect($('form#disabled').serialize()).toBe('');
    });

    it('() : should get multiple selected options', function () {
      expect($('form#multiple').serialize()).toBe('fruit=Apple&fruit=Orange');
    });

    it("() : should encode spaces as +'s", function () {
      expect($('form#spaces').serialize()).toBe('fruit=Blood+orange');
    });
  });
});
