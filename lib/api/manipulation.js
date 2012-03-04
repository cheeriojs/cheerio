var _ = require('underscore'),
    $ = require('../cheerio'),
    updateDOM = $.parse.update,
    slice = Array.prototype.slice;

var removeChild = function(parent, elem) {
  $.each(parent.children, function(i, child) {
    if (elem === child)
      parent.children.splice(i, 1);
  });
};

/*
  Creates an array of cheerio objects,
  parsing strings if necessary
*/
var makeCheerioArray = function(elems) {
  var dom = [],
      len = elems.length,
      elem;

  for(var i = 0; i < len; i++) {
    elem = elems[i];
    // If a cheerio object
    if(elem.cheerio) {
      dom = dom.concat(elem.toArray());
    } else {
      dom = dom.concat($.parse.eval(elem));
    }
  }

  return dom;
};

var append = exports.append = function() {
  var elems = slice.call(arguments),
      dom = makeCheerioArray(elems);

  this.each(function() {
    if(_.isFunction(elems[0])) {
      // No yet supported
      return this;
    } else {
      if(!this.children) this.children = [];
      this.children = this.children.concat(dom);
      updateDOM(this.children, this);
    }
  });

  return this;
};


/*
  TODO: Refactor, only one line difference between,
  this function and append
*/
var prepend = exports.prepend = function() {
  var elems = slice.call(arguments),
      dom = makeCheerioArray(elems);

  this.each(function() {
    if(_.isFunction(elems[0])) {
      // No yet supported
      return this;
    } else {
      if(!this.children) this.children = [];
      this.children = dom.concat(this.children);
      updateDOM(this.children, this);
    }
  });

  return this;
};

var after = exports.after = function() {
  var elems = slice.call(arguments),
      dom = makeCheerioArray(elems);

  this.each(function() {
    var siblings = this.parent.children,
        index = siblings.indexOf(this);

    // If not found, move on
    if(!~index) return;

    // Add element after `this` element
    siblings.splice.apply(siblings, [++index, 0].concat(dom));

    // Update next, prev, and parent pointers
    updateDOM(siblings, this.parent);
    this.parent.children = siblings;

  });

  return this;
};

var before = exports.before = function() {
  var elems = slice.call(arguments),
      dom = makeCheerioArray(elems);

  this.each(function() {
    var siblings = this.parent.children,
        index = siblings.indexOf(this);

    // If not found, move on
    if(!~index) return;

    // Add element before `this` element
    siblings.splice.apply(siblings, [index, 0].concat(dom));

    // Update next, prev, and parent pointers
    updateDOM(siblings, this.parent);
    this.parent.children = siblings;

  });

  return this;
};

/*
  remove([selector])
*/
var remove = exports.remove = function(selector) {
  var elems = this;

  // Filter if we have selector
  if(selector)
    elems = elems.find(selector);

  elems.each(function() {
    var siblings = this.parent.children,
        index = siblings.indexOf(this);

    if(!~index) return;

    siblings.splice(index, 1);

    // Update next, prev, and parent pointers
    updateDOM(siblings, this.parent);
    this.parent.children = siblings;
  });

  return this;
};

var replaceWith = exports.replaceWith = function(content) {
  var content = (content.cheerio) ? content.toArray() : $.parse.eval(content);
  
  this.each(function() {
    var siblings = this.parent.children,
        index = siblings.indexOf(this);
        
    if(!~index) return;
    
    siblings.splice.apply(siblings, [index, 1].concat(content));
    
    updateDOM(siblings, this.parent);
    this.parent.children = siblings;
  });
  
  return this;
};

var empty = exports.empty = function() {
  this.each(function() {
    this.children = [];
  });
  return this;
};

var html = exports.html = function(str) {
  if(str === undefined || typeof(str) === 'object') {
    if(!this[0] || !this[0].children) return null;
    return $.html(this[0].children);
  }

  str = $.parse.eval(str);

  this.each(function() {
    this.children = str;
  });

  return this;
};

var tidy = exports.tidy = function() {
  return $.tidy(this[0].children);
}

var text = exports.text = function(str) {
  // If `str` blank or an object
  if(!str || typeof(str) === 'object') {
    return $.text(this);
  } else if (_.isFunction(str)) {
    // Function support
    return this.each(function(i) {
      var self = $(this);
      return self.text(str.call(this, i, self.text()));
    });
  }

  var elem = {
    data : str,
    type : 'text',
    parent : null,
    prev : null,
    next : null,
    children : []
  };

  // Append text node to each selected elements
  this.each(function() {
    this.children = elem;
    updateDOM(this.children, this);
  });

  return this;
};

var clone = exports.clone = function() {
    var result = [];
    for (var i = 0; i < this.length; i++) {
      // TODO: This could be more efficient
      result = result.concat($.parse.eval($.html(this[i])));
    }
    return $(result);
};


module.exports = $.fn.extend(exports);
