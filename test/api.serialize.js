var expect = require('expect.js');

var $ = require('../');
var forms = require('./fixtures').forms;

describe('$(...)', function() {

  describe('.serializeArray', function() {

    it('() : should get form controls', function() {
      expect($('form#simple', forms).serializeArray().length).to.equal(1);
    });
    
    it('() : should get nested form controls', function() {
      expect($('form#nested', forms).serializeArray().length).to.equal(2);
    });
    
    it('() : should not get disabled form controls', function() {
      expect($('form#disabled', forms).serializeArray().length).to.equal(0);
    });
    
    it('() : should not get form controls with the wrong type', function() {
      expect($('form#submit', forms).serializeArray().length).to.equal(1);
      expect($('form#submit', forms).serializeArray()[0].name).to.equal('fruit');
      expect($('form#submit', forms).serializeArray()[0].value).to.equal('Apple');
    });
    
    it('() : should get selected options', function() {
      expect($('form#select', forms).serializeArray().length).to.equal(1);
      expect($('form#select', forms).serializeArray()[0].name).to.equal('fruit');
      expect($('form#select', forms).serializeArray()[0].value).to.equal('Orange');
    });
    
    it('() : should not get unnamed form controls', function() {
      expect($('form#unnamed', forms).serializeArray().length).to.equal(1);
      expect($('form#unnamed', forms).serializeArray()[0].name).to.equal('fruit');
      expect($('form#unnamed', forms).serializeArray()[0].value).to.equal('Apple');
    });

  });

});