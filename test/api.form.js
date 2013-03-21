var expect = require('expect.js');

var $ = require('../');
var fixtures = require('./fixtures');
var fruits = fixtures.fruits;
var vegetables = fixtures.vegetables;
var form = fixtures.form;

describe('.val', function(){
	it('.val() : should get the value', function() {
		var value = $('#txtUser', form).val();
		expect(value).to.equal('cheerio');
	});

	it('.val(value) : should set value', function() {
		var $mail = $('#txtMail', form);
		var value = 'cheerio@domain.com';
		$mail.val(value);
		expect($mail.val()).to.equal(value);
	});

	it('.val(value) : should set multiple attributes', function(){
		var $eles = $('input', form);
		var value = 'cheerio';
		$eles.val(value);
		expect($('#txtUser', $eles).val()).to.equal(value);
		expect($('#txtMail', $eles).val()).to.equal(value);
	});
});

describe('.serializeArray', function(){
	it('$(form).serializeArray: Should get elements from form', function(){
		var $forms = $(form);
		var result = $forms.serializeArray();
		expect(result).to.eql([ { name: 'txtUser', value: 'cheerio' },
			{ name: 'txtMail', value: '' },
			{ name: 'txtMemo', value: 'something' } ]);
	});
});

describe('.serializeArray', function(){
	it('$(form).serializeArray: Should get serialize values', function(){
		var $forms = $(form);
		var review = 'txtUser=cheerio&txtMail=&txtMemo=something';
		var result = $forms.serialize();
		expect(result).to.be.equal(review);
	});
});