var ElementType = require("./dom-element-type");

function DomHandler(callback, options, elementCB){
	if(typeof callback === "object"){
		elementCB = options;
		options = callback;
		callback = null;
	} else if(typeof options === "function"){
		elementCB = options;
		options = defaultOpts;
	}
	this._callback = callback;
	this._options = options || defaultOpts;
	this._elementCB = elementCB;
	this.dom = [];
	this._done = false;
	this._tagStack = [];
}

//default options
var defaultOpts = {
	ignoreWhitespace: false //Keep whitespace-only text nodes
};

//Resets the handler back to starting state
DomHandler.prototype.onreset = function(){
	DomHandler.call(this, this._callback, this._options, this._elementCB);
};

//Signals the handler that parsing is done
DomHandler.prototype.onend = function(){
	if(this._done) return;
	this._done = true;
	this._handleCallback(null);
};

DomHandler.prototype._handleCallback =
DomHandler.prototype.onerror = function(error){
	if(typeof this._callback === "function"){
		this._callback(error, this.dom);
	} else {
		if(error) throw error;
	}
};

DomHandler.prototype.onclosetag = function(name){
	//if(this._tagStack.pop().name !== name) this._handleCallback(Error("Tagname didn't match!"));
	var elem = this._tagStack.pop();
	if(this._elementCB) this._elementCB(elem);
};

DomHandler.prototype._addDomElement = function(element){
	var lastTag = this._tagStack[this._tagStack.length - 1];

	if (this._options.withDomLvl1) {
		element = makeNode(element);
	}

	if(lastTag){
		lastTag.children.push(element);
	} else { //There aren't parent elements
		this.dom.push(element);
	}
};

var domLvl1 = {
	tagName: 'name',
	childNodes: 'children',
	parentNode: 'parent',
	previousSibling: 'prev',
	nextSibling: 'next'
};
var nodeTypes = {
	element: 1,
	text: 3,
	comment: 8,
	cdata: 4
};
var makeNode = DomHandler.makeNode = function(nodeData) {
	//return Object.create(NodePrototype, nodeData);
	nodeData.__proto__ = NodePrototype;
	return nodeData;
};

var NodePrototype = {};
Object.keys(domLvl1).forEach(function(key) {
	var shorthand = domLvl1[key];
	Object.defineProperty(NodePrototype, key, {
		get: function() {
			return this[shorthand];
		},
		set: function(val) {
			this[shorthand] = val;
			return val;
		}
	});
});
Object.defineProperties(NodePrototype, {
	firstChild: {
		get: function() {
			return this.childNodes[0] || null;
		}
	},
	lastChild: {
		get: function() {
			return this.childNodes[this.childNodes.length - 1] || null;
		}
	},
	nodeType: {
		get: function() {
			return nodeTypes[this.type] || nodeTypes.element;
		}
	}
});

DomHandler.prototype.onopentag = function(name, attribs){
	var lastTag = this._tagStack[this._tagStack.length - 1];

	var element = {
		type: name === "script" ? ElementType.Script : name === "style" ? ElementType.Style : ElementType.Tag,
		name: name,
		attribs: attribs,
		children: [],
		prev: null,
		next: null,
		parent: lastTag || null
	};

	if (this._options.withDomLvl1) {
		element = makeNode(element);
	}

	if(lastTag){
		var idx = lastTag.children.length;
		while(idx > 0){
			if(ElementType.isTag(lastTag.children[--idx])){
				element.prev = lastTag.children[idx];
				lastTag.children[idx].next = element;
				break;
			}
		}
		lastTag.children.push(element);
	} else {
		this.dom.push(element);
	}

	this._tagStack.push(element);
};

DomHandler.prototype.ontext = function(data){
	if(this._options.ignoreWhitespace && data.trim() === "") return;

	if(this._tagStack.length){
		var lastTag;

		if(
			(lastTag = this._tagStack[this._tagStack.length - 1]) &&
			(lastTag = lastTag.children[lastTag.children.length - 1]) &&
			lastTag.type === ElementType.Text
		){
			lastTag.data += data;
			return;
		}
	} else {
		if(this.dom.length && this.dom[this.dom.length-1].type === ElementType.Text){
			this.dom[this.dom.length-1].data += data;
			return;
		}
	}

	this._addDomElement({
		data: data,
		type: ElementType.Text
	});
};

DomHandler.prototype.oncomment = function(data){
	var lastTag = this._tagStack[this._tagStack.length - 1];

	if(lastTag && lastTag.type === ElementType.Comment){
		lastTag.data += data;
		return;
	}

	var element = {
		data: data,
		type: ElementType.Comment
	};

	this._addDomElement(element);
	this._tagStack.push(element);
};

DomHandler.prototype.oncdatastart = function(){
	var element = {
		children: [{
			data: "",
			type: ElementType.Text
		}],
		type: ElementType.CDATA
	};

	this._addDomElement(element);
	this._tagStack.push(element);
};

DomHandler.prototype.oncommentend = DomHandler.prototype.oncdataend = function(){
	this._tagStack.pop();
};

DomHandler.prototype.onprocessinginstruction = function(name, data){
	this._addDomElement({
		name: name,
		data: data,
		type: ElementType.Directive
	});
};

module.exports = DomHandler;
