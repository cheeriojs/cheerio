var isArray = Array.isArray || function (obj) {
  return toString.call(obj) === '[object Array]';
};

/*
* EventObject
*/

var EventObject = function (type, el, data) {
  this.type = type;
  this.target = el;
  this.data = data;
  this.cancelBubble = false;
  this.defaultPrevented = false;
  this.bubbles = false;
};

EventObject.prototype.stopPropagation = function () {
  this.cancelBubble = true;
  this.bubbles = false;
};

EventObject.prototype.restorePropagation = function () {
  this.cancelBubble = false;
};

EventObject.prototype.preventDefault = function () {
  this.defaultPrevented = true;
};

EventObject.prototype.bubble = function (result) {
  this.bubbles = true;
  if (result) this.result = result;
};

/*
* Methods
*/

var trigger = exports.trigger = function (type, e) {
  var event = e || new EventObject(type, this[0]);

  if (!this[0]) return;

  if (this[0]._events) {

    var handler = this[0]._events[type];
    if (!handler) return false;

    if (typeof handler == 'function') {
      handler.call(this, event);
    } else if (isArray(handler)) {
      var listeners = handler.slice();

      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].call(this, event);
      }

    }

  }

  if (!event.cancelBubble) {
    var parent = this.parent();
    event.bubble();
    parent.trigger.call(parent, type, event);
  } else {
    event.restorePropagation();
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