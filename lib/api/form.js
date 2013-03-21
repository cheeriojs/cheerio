var _ = require("underscore")
	, Cheerio = require("../cheerio");

var serializeArray = exports.serializeArray = function () {
	var elements = [];
	var findInput = function(parent){
		_.map(parent.children(), function(node){
			var $node = Cheerio(node);

			//has children

			if($node.children().length > 0){
				return findInput($node);
			};

			var tag = node.name;
			var type = $node.attr("type");
			//ignore something
			if(!/input|textarea/i.test(tag)) return;
			if(type && /submit|reset|button/i.test(type)) return;
			if($node.attr("disabled")) return;

			//unchecked
			if(/radio|checkbox/.test(type) && !node.attr("checked")) return;

			var value = $node.val();
			var name = $node.attr("id");
			if(!name) return;
			elements.push({
				name: name,
				value: value || ""
			});
		});
	}(this);

	return elements;
};

var serialize = exports.serialize = function () {
	var result = [];
	this.serializeArray().forEach(function (elm) {
		result.push( encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value) )
	})
	return result.join('&')
};

var val = exports.val = function(value){
	if (!this[0]) return this;

	//get value
	if(value === undefined){
		return /textarea/i.test(this[0].name) ? this.text() : this.attr("value");
	};

	//set attribute value
	return this.each(function(i, el){
		if(/textarea/i.test(el.name)){
			el.text(value);
		}else{
			this.attr("value", value);
		};
	});
}