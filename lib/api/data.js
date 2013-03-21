//     cheerio.js
// The following code is heavily inspired by jQuery's $.fn.data()
var $ = require('../static')
	, util = require('../utils')
	, _ = require('underscore');

var DATAPREFIX = 'data-cheerio-';

exports.data = function(name, value) {
	//get the value
	if(typeof name == 'string' && value === undefined){
		return this.attr(DATAPREFIX + name);
	};

	var hash = name;
	if(value !== undefined){
		hash = {};
		hash[name] = value;
	};

	//set data to attribute
	var that = this;
	_.each(hash, function(value, key, list){
		var dataName = DATAPREFIX + key;
		that.attr(dataName, value);
	});
	return this;
};

//remove data from the element node

exports.removeData = function(names){
	if (typeof names == 'string') names = names.split(/\s+/);
	var elements = this;
	_.each(names, function(name, i){
		name = DATAPREFIX + name;
		elements.removeAttr(name);
	});
	return this;
};