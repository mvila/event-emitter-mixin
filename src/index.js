'use strict';

export function EventEmitterMixin(superclass = Object) {
  return class extends superclass {
    on(name, fn) {
      let listeners = this._getListeners(name, true);
      listeners.push(fn);
      return fn;
    }

    off(name, fn) {
      let listeners = this._getListeners(name);
      if (!listeners) return;
      if (!fn) {
        listeners.splice(0, listeners.length);
        return;
      }
      let index = listeners.indexOf(fn);
      if (index !== -1) listeners.splice(index, 1);
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
        results.push(listeners[i].apply(thisArg, args));
      }
      return results;
    }
  };
}

// decorator to easily add listener on class prototypes
export function on(target, name, descriptor) {
  let listeners;
  if (target.hasOwnProperty(name)) {
    listeners = target[name];
  } else {
    listeners = [];
  }
  let fn = descriptor.value;
  listeners.push(fn);
  descriptor.value = listeners;
}

export default EventEmitterMixin;
