var expect = require('expect.js'),
    $ = require('../'), 
    form = require('./fixtures').form;

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