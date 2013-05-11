// Stub function that does not do much of anything than return the jQuery object
function jQueryStub() {
	return this;
}

var CheerioAdapters = {
	on: jQueryStub,
	off: jQueryStub,
	bind: jQueryStub,
	unbind: jQueryStub,
	delegate: jQueryStub,
	undelegate: jQueryStub,
	live: jQueryStub,
	die: jQueryStub,
	trigger: jQueryStub,
	ready: jQueryStub
};

exports = module.exports = CheerioAdapters;