var expect = require('expect.js');

var $ = require('../');
var fixtures = require('./fixtures');
var fruits = fixtures.fruits;
var vegetables = fixtures.vegetables;
var form = fixtures.form;

describe('$().data', function() {
	it('.data(): should set data value.', function(){
		var $ele = $("li", fixtures.fruits);
		//$ele.toggle(false);
		//console.log($ele.attr("style"));
		var key = 'project', value = 'cheerio';
		var result = $ele.data(key, value).data(key);
		expect(result).to.equal(value);
	});

	it('.data(): should set object.', function(){
		var $ele = $(fixtures.fruits);
		var data = {
			project: 'cheerio',
			version: 1
		};
		$ele.data(data);
		expect($ele.data("project")).to.equal(data.project);
		expect($ele.data("version")).to.eql(data.version);
	});

	it('.removeData(): should remove data.', function(){
		var $ele = $(fixtures.fruits);
		var key = 'project', value = 'cheerio';
		var result = $ele.data(key, value).removeData(key).data(key);
		expect(result).to.be(undefined);
	});
});
