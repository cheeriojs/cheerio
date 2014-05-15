var isArray = Array.isArray || function (obj) {
  return toString.call(obj) === '[object Array]';
};

var EventObject = function (type, el, data) {
  this.type = type;
  this.target = el;
  this.data = data;
  this.cancelBubble = false;
  this.defaultPrevented = false;
  this.bubbles = false;
};

Event.prototype.stopPropagation = function () {
  this.cancelBubble = true;
};

Event.prototype.preventDefault = function () {
  this.defaultPrevented = true;
};

Event.prototype.bubble = function (result) {
  this.bubbles = true;
  this.result = result;
};

var trigger = exports.trigger = function (type, e) {

  if (!this[0]) return;

  var propagation = true;

  if (!e) var e = {}; // TODO: replace with new EventObject instance
  e.stopPropagation = function () {
    propagation = false;
  };

  if (this[0]._events) {

    var handler = this[0]._events[type];
    if (!handler) return false;

    if (typeof handler == 'function') {
      handler.call(this, e);
    } else if (isArray(handler)) {
      var listeners = handler.slice();

      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].call(this, e);
      }

    }

  }

  if (propagation) {
    var parent = this.parent();
    parent.trigger.call(parent, type, e);
    return true;
  } else {
    propagation = true;
    return false;
  }

};

var on = exports.on = function (type, listener) {
  if (!this[0]._events) this[0]._events = {};

  if (!this[0]._events[type]) {
    this[0]._events[type] = listener;
  } else if (isArray(this[0]._events[type])) {
    this[0]._events[type].push(listener);
  } else {
    this[0]._events[type] = [this[0]._events[type], listener];
  }

};