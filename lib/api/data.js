//     cheerio.js
// The following code is heavily inspired by jQuery's $.fn.data()
var $ = require('../static')
	, util = require('../utils')
	, _ = require('underscore');

exports.data = function(name, value) {
	//get the value
	if(typeof name == 'string' && value === undefined){
		var cache = this.cache || {};
		return cache[name];
	};

	this.cache = this.cache || {};
	var hash = name;
	if(value !== undefined){
		hash = {};
		hash[name] = value;
	};

	_.extend(this.cache, hash);
	return this;
};

//remove data from the element node

exports.removeData = function(names){
	if(!this.cache) return this;
	if (typeof names == 'string') names = names.split(/\s+/);
	var that = this;
	_.each(names, function(name, i){
		delete that.cache[name];
	});
	return this;
};