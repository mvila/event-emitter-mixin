'use strict';

export function EventEmitterMixin(superclass = function() {}) {
  return class extends superclass {
    on(name, fn) {
      let listeners = this._getListeners(name, true);
      let index = listeners.indexOf(undefined);
      if (index !== -1) listeners[index] = fn; else listeners.push(fn);
      return fn;
    }

    off(name, fn) {
      let listeners = this._getListeners(name);
      if (!listeners) return;
      if (!fn) {
        listeners.fill(undefined);
        return;
      }
      let index = listeners.indexOf(fn);
      if (index !== -1) listeners[index] = undefined;
    }

    emit(name, ...args) {
      let results = [];
      let emitter = this;
      do {
        if (!emitter[name]) break; // OPTIMIZATION
        let newResults = emitter._callListeners(name, this, args);
        if (newResults.length) results.push.apply(results, newResults);
        emitter = Object.getPrototypeOf(emitter);
      } while (emitter._callListeners);
      return Promise.all(results);
    }

    _getListeners(name, createIfUndefined) {
      if (!this.hasOwnProperty(name)) {
        if (!createIfUndefined) return undefined;
        Object.defineProperty(this, name, { value: [] });
      }
      return this[name];
    }

    _callListeners(name, thisArg, args) {
      let listeners = this._getListeners(name);
      if (!listeners) return [];
      let results = [];
      for (let i = 0; i < listeners.length; i++) {
        let fn = listeners[i];
        if (fn) results.push(fn.apply(thisArg, args));
      }
      return results;
    }
  };
}

// decorator to add listener on class prototypes
export function on(target, name, descriptor) {
  let listeners;
  if (target.hasOwnProperty(name)) {
    listeners = target[name];
    if (typeof listeners === 'function') {
      // transform-decorators-legacy bug:
      // the function should not be defined
      // before the decorator is called
      listeners = [];
    }
  } else {
    listeners = [];
  }
  let fn = descriptor.value;
  listeners.push(fn);
  descriptor.value = listeners;
}

export default EventEmitterMixin;
