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

var trigger = exports.trigger = function (type) {
  var event = (arguments.length > 1 && arguments[1] instanceof EventObject) ? arguments[1] : new EventObject(type, this[0]);

  var args = [type];

  switch (arguments.length) {
    case 1:
      args.push(event);
      break;
    case 2:
      if (isArray(arguments[1])) {
        args.push(event);
        arguments[1].forEach(function (a) {
          args.push(a);
        });
      } else if (arguments[1] instanceof EventObject) {
        args.push(arguments[1]);
      } else {
        args.push(event);
        args.push(arguments[1]);
      }
      break;
    default:
      Array.prototype.slice.call(arguments, 1).forEach(function (a) {
        args.push(a);
      });
  }

  if (!this[0]) return;

  if (this[0]._events) {

    var handler = this[0]._events[type];
    if (!handler) return false;

    if (typeof handler == 'function') {
      handler.apply(this, args.slice(1));
    } else if (isArray(handler)) {
      var listeners = handler.slice();

      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].apply(this, args.slice(1));
      }

    }

  }

  if (!event.cancelBubble) {
    var parent = this.parent();
    args[1].bubble();
    parent.trigger.apply(parent, args);
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

  return this;
};

var off = exports.off = function (type) {

  if (!type) {
    this[0]._events = {};
    return this;
  }

  delete this[0]._events[type];

  return this;
};